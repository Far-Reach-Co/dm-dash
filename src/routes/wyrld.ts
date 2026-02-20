import { Router, Request, Response, NextFunction } from "express";
import { getTableViewsByProjectQuery } from "../api/queries/tableViews";
import {
  getProjectUsersByProjectQuery,
  getProjectUsersQuery,
  getProjectUserByUserAndProjectQuery,
} from "../api/queries/projectUsers";
import { getProjectsQuery, getProjectQuery } from "../api/queries/projects";
import { getProjectPlayersByProjectQuery } from "../api/queries/projectPlayers";
import { getProjectInviteByProjectQuery } from "../api/queries/projectInvites";
import { get5eCharGeneralQuery } from "../api/queries/5eCharGeneral";
import { getCalendarsQuery } from "../api/queries/calendars";
import { getRecordsByProjectQuery, getRecordQuery } from "../api/queries/record";
import { getUserByIdQuery, User } from "../api/queries/users";
import { humanFileSize } from "../lib/utils";
import { getTableImageCountByProjectQuery } from "../api/queries/tableImages";
import { getImageQuery, getImagesQuery } from "../api/queries/images";
import { getSignedUrls } from "../api/controllers/s3";
import { getRecordImagesByRecordQuery } from "../api/queries/recordImage";
import {
  requireProjectEditorOrRedirect,
  requireProjectMemberOrRedirect,
  requireUserOrRedirect,
} from "../lib/authz";
import { upsertRecentlyViewed, getRecentlyViewedByUserForIds } from "../api/queries/recentlyViewed";
import {
  getPendingProjectJoinRequestByProjectAndUserQuery,
  getPendingProjectJoinRequestsByProjectQuery,
  getPendingProjectJoinRequestsByRequesterQuery,
} from "../api/queries/projectJoinRequests";
import { getPublicWyrldDirectoryQuery } from "../api/queries/publicWyrlds";

const router = Router();

const RECENT_LIMIT = 5;

function toPublicWyrldSlug(rawTitle: unknown) {
  const title = String(rawTitle || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!title) return "wyrld";
  return title.slice(0, 80);
}

function getPublicWyrldPath(projectId: number | string, title: unknown) {
  const slug = toPublicWyrldSlug(title);
  return `/wyrlds/public/${projectId}/${slug}`;
}

function getRequestOrigin(req: Request) {
  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

function normalizeMetaDescription(value: unknown, maxLength: number) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function isMissingProjectJoinRequestTableError(err: unknown) {
  const pgErr = err as { code?: string; message?: string };
  if (pgErr?.code !== "42P01") return false;
  return String(pgErr?.message || "").includes("ProjectJoinRequest");
}

const sortByDateDesc = <T>(
  items: T[],
  getDate: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTime = getDate(a) ? new Date(getDate(a) as string).getTime() : 0;
    const bTime = getDate(b) ? new Date(getDate(b) as string).getTime() : 0;
    return bTime - aTime;
  });
};

const sortByTitle = <T>(
  items: T[],
  getTitle: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTitle = (getTitle(a) ?? "").toLowerCase();
    const bTitle = (getTitle(b) ?? "").toLowerCase();
    return aTitle.localeCompare(bTitle);
  });
};

function buildRecents<T>(
  items: T[],
  viewedIds: number[],
  getId: (item: T) => number,
  getDate: (item: T) => string | undefined,
  limit: number,
): T[] {
  const itemMap = new Map(items.map((item) => [getId(item), item]));
  const recent: T[] = [];
  for (const id of viewedIds) {
    const item = itemMap.get(id);
    if (item) recent.push(item);
  }
  if (recent.length < limit) {
    const recentIds = new Set(recent.map(getId));
    const fallback = sortByDateDesc(items, getDate);
    for (const item of fallback) {
      if (recent.length >= limit) break;
      if (!recentIds.has(getId(item))) recent.push(item);
    }
  }
  return recent;
}

interface GetProjectUsersByProjectReturnUser extends User {
  project_user_id: number;
  is_editor: boolean;
}

async function loadWyrldData(
  req: Request,
  res: Response,
  userId: string | number,
  projectId: string,
) {
  const project = await requireProjectMemberOrRedirect(
    req,
    res,
    projectId,
    "/forbidden",
  );
  if (!project) return null;

  let projectBannerSrc: string | null = null;
  let projectBannerName: string | null = null;
  if (project.is_pro && project.image_id) {
    const imageData = await getImageQuery(project.image_id);
    const image = imageData.rows[0];
    if (image) {
      const signedUrls = await getSignedUrls([image]);
      projectBannerSrc = signedUrls[image.id] || null;
      projectBannerName = image.original_name || null;
    }
  }

  let projectAuth = true;
  if (userId != project.user_id) {
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      userId,
      projectId,
    );
    const projectUser = projectUserData.rows[0];
    projectAuth = projectUser?.is_editor ?? false;
  }

  // get table views by project
  const tableData = await getTableViewsByProjectQuery(projectId);
  // get all character sheets by project
  const players = [];
  const projectPlayers = await getProjectPlayersByProjectQuery(projectId);
  for (const player of projectPlayers.rows) {
    const charData = await get5eCharGeneralQuery(player.player_id);
    players.push(charData.rows[0]);
  }

  // calendars
  const calendars = await getCalendarsQuery(projectId);

  // records
  const recordsData = await getRecordsByProjectQuery(project.id);

  // image count
  const imageCountData = await getTableImageCountByProjectQuery(project.id);
  const imageCount = parseInt(imageCountData.rows[0].count);

  // calculate used data formatted
  const usedDataFormatted = humanFileSize(project.used_data_in_bytes);

  // get invite link if exists (only needed for owners/managers)
  let inviteLink = null;
  let inviteId = null;
  if (projectAuth) {
    const inviteData = await getProjectInviteByProjectQuery(projectId);
    if (inviteData.rows.length > 0) {
      const invite = inviteData.rows[0];
      inviteId = invite.id;
      inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${invite.uuid}`;
    }
  }

  // load project users for settings (owner only)
  let settingsUsers: GetProjectUsersByProjectReturnUser[] = [];
  let pendingJoinRequests: Array<{
    id: number;
    requester_user_id: number;
    requester_username: string;
    message: string;
    created_at: string;
  }> = [];
  if (userId == project.user_id) {
    const projectUsersData = await getProjectUsersByProjectQuery(project.id);
    let joinRequestsRows: Array<{
      id: number;
      requester_user_id: number;
      requester_username: string;
      message: string;
      created_at: string;
    }> = [];
    try {
      const joinRequestsData = await getPendingProjectJoinRequestsByProjectQuery(
        project.id,
      );
      joinRequestsRows = joinRequestsData.rows;
    } catch (err) {
      if (!isMissingProjectJoinRequestTableError(err)) throw err;
    }

    for (const projectUser of projectUsersData.rows) {
      const userData = await getUserByIdQuery(projectUser.user_id);
      const user = userData.rows[0];
      (user as GetProjectUsersByProjectReturnUser).project_user_id =
        projectUser.id;
      (user as GetProjectUsersByProjectReturnUser).is_editor =
        projectUser.is_editor;
      settingsUsers.push(user as GetProjectUsersByProjectReturnUser);
    }
    pendingJoinRequests = joinRequestsRows.map((row) => ({
      id: row.id,
      requester_user_id: row.requester_user_id,
      requester_username: row.requester_username,
      message: row.message,
      created_at: row.created_at,
    }));
  }

  const tables = tableData.rows;
  const records = recordsData.rows;
  const sheets = players.filter(Boolean);
  const calendarsList = calendars.rows;

  // query recently viewed entity_ids scoped to this project's items
  const tableIds = tables.map((t: any) => t.id);
  const recordIds = records.map((r: any) => r.id);
  const sheetIds = sheets.map((s: any) => s.id);

  const [rvTables, rvRecords, rvSheets] = await Promise.all([
    tableIds.length ? getRecentlyViewedByUserForIds(userId, "table", tableIds, RECENT_LIMIT) : { rows: [] },
    recordIds.length ? getRecentlyViewedByUserForIds(userId, "record", recordIds, RECENT_LIMIT) : { rows: [] },
    sheetIds.length ? getRecentlyViewedByUserForIds(userId, "sheet", sheetIds, RECENT_LIMIT) : { rows: [] },
  ]);

  const recentTables = buildRecents(tables, rvTables.rows.map((r: any) => r.entity_id), (t: any) => t.id, (t: any) => t.date_created, RECENT_LIMIT);
  const recentRecords = buildRecents(records, rvRecords.rows.map((r: any) => r.entity_id), (r: any) => r.id, (r: any) => r.created_at, RECENT_LIMIT);
  const recentSheets = buildRecents(sheets, rvSheets.rows.map((r: any) => r.entity_id), (s: any) => s.id, (s: any) => s.created_at, RECENT_LIMIT);
  // calendars have no dedicated page route — keep creation-date sorting
  const recentCalendars = sortByDateDesc(
    calendarsList,
    (calendar) => (calendar as any).created_at,
  ).slice(0, RECENT_LIMIT);

  return {
    projectAuth,
    isOwner: userId == project.user_id,
    project,
    settingsUsers,
    tables,
    sheets,
    calendars: calendarsList,
    records,
    imageCount,
    usedDataFormatted,
    inviteLink,
    inviteId,
    projectBannerSrc,
    projectBannerName,
    pendingJoinRequests,
    memberCount: settingsUsers.length + 1,
    recentTables,
    recentRecords,
    recentSheets,
    recentCalendars,
    tablesSorted: sortByTitle(tables, (table) => (table as any).title),
    recordsSorted: sortByTitle(records, (record) => (record as any).title),
    sheetsSorted: sortByTitle(sheets, (sheet) => (sheet as any).name),
    calendarsSorted: sortByTitle(calendarsList, (calendar) => (calendar as any).title),
  };
}

router.get(
  "/wyrld",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;

      const data = await loadWyrldData(req, res, userId, projectId);
      if (!data) return;

      upsertRecentlyViewed(userId, "wyrld", projectId);

      res.render("wyrld", {
        auth: userId,
        section: "overview",
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  ["/wyrld/tables", "/wyrld/records", "/wyrld/sheets", "/wyrld/calendars", "/wyrld/settings"],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const section = req.path.split("/")[2];

      const data = await loadWyrldData(req, res, userId, projectId);
      if (!data) return;

      res.render("wyrld", {
        auth: userId,
        section,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/wyrldsettings", (req: Request, res: Response) => {
  const id = req.query.id;
  res.redirect(id ? `/wyrld/settings?id=${id}` : "/dash");
});

router.get("/sharedwyrldsettings", (req: Request, res: Response) => {
  const id = req.query.id;
  res.redirect(id ? `/wyrld/settings?id=${id}` : "/dash");
});

router.get(
  "/wyrlds/public",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user ?? null;
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const directoryData = await getPublicWyrldDirectoryQuery({
        search: query,
        limit: 120,
        offset: 0,
      });

      let ownedProjectIds = new Set<number>();
      let joinedProjectIds = new Set<number>();
      let pendingProjectIds = new Set<number>();
      let pendingRequestIdByProjectId = new Map<number, number>();

      if (userId) {
        const [ownedData, joinedData] = await Promise.all([
          getProjectsQuery(userId),
          getProjectUsersQuery(userId),
        ]);
        let pendingRows: Array<{ id: number; project_id: number }> = [];
        try {
          const pendingData = await getPendingProjectJoinRequestsByRequesterQuery(
            userId,
          );
          pendingRows = pendingData.rows.map((request) => ({
            id: Number(request.id),
            project_id: Number(request.project_id),
          }));
        } catch (err) {
          if (!isMissingProjectJoinRequestTableError(err)) throw err;
        }
        ownedProjectIds = new Set(
          ownedData.rows.map((project) => Number(project.id)),
        );
        joinedProjectIds = new Set(
          joinedData.rows.map((projectUser) => Number(projectUser.project_id)),
        );
        pendingProjectIds = new Set(
          pendingRows.map((request) => Number(request.project_id)),
        );
        pendingRequestIdByProjectId = new Map<number, number>(
          pendingRows.map((request) => [
            Number(request.project_id),
            Number(request.id),
          ]),
        );
      }

      const projects = directoryData.rows.map((row) => {
        const projectId = Number(row.id);
        const isOwner = ownedProjectIds.has(projectId);
        const isMember = isOwner || joinedProjectIds.has(projectId);
        const hasPendingRequest = pendingProjectIds.has(projectId);
        const capacity = row.public_join_capacity;
        const spotsRemaining =
          capacity === null ? null : Math.max(Number(capacity) - Number(row.member_count), 0);
        const isFull = spotsRemaining !== null && spotsRemaining <= 0;

        return {
          ...row,
          isOwner,
          isMember,
          hasPendingRequest,
          pendingRequestId: pendingRequestIdByProjectId.get(projectId) || null,
          spotsRemaining,
          isFull,
          publicPath: getPublicWyrldPath(projectId, row.title),
        };
      });

      const redirectTarget = req.originalUrl || "/wyrlds/public";
      const loginHref = `/login?redirect=${encodeURIComponent(redirectTarget)}`;

      res.render("publicwyrlds", {
        auth: userId || undefined,
        isAuthenticated: Boolean(userId),
        query,
        projects,
        loginHref,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/wyrlds/public/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.id);
      if (!Number.isInteger(projectId) || projectId <= 0) {
        return res.redirect("/404");
      }

      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];
      if (!project || !project.is_public_listed || !project.is_pro) {
        return res.redirect("/404");
      }

      const canonicalPath = getPublicWyrldPath(project.id, project.title);
      const queryIndex = req.originalUrl.indexOf("?");
      const querySuffix = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
      return res.redirect(302, `${canonicalPath}${querySuffix}`);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/wyrlds/public/:id/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.id);
      if (!Number.isInteger(projectId) || projectId <= 0) {
        return res.redirect("/404");
      }

      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];
      if (!project || !project.is_public_listed || !project.is_pro) {
        return res.redirect("/404");
      }
      const expectedSlug = toPublicWyrldSlug(project.title);
      if (req.params.slug !== expectedSlug) {
        const queryIndex = req.originalUrl.indexOf("?");
        const querySuffix = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
        return res.redirect(
          302,
          `/wyrlds/public/${project.id}/${expectedSlug}${querySuffix}`,
        );
      }

      const ownerData = await getUserByIdQuery(project.user_id);
      const ownerUsername = ownerData.rows[0]?.username || "Unknown";

      const projectUsersData = await getProjectUsersByProjectQuery(project.id);
      const memberCount = projectUsersData.rows.length + 1;

      let featuredRecord: {
        id: number;
        title: string;
        description: string;
      } | null = null;
      let featuredRecordImageUrls: Record<string, string> = {};
      let projectBannerSrc: string | null = null;
      let projectBannerName: string | null = null;

      if (project.image_id) {
        const bannerData = await getImageQuery(project.image_id);
        const bannerImage = bannerData.rows[0];
        if (bannerImage) {
          const signedUrls = await getSignedUrls([bannerImage]);
          projectBannerSrc = signedUrls[bannerImage.id] || null;
          projectBannerName = bannerImage.original_name || null;
        }
      }

      if (project.featured_record_id) {
        const featuredRecordData = await getRecordQuery(project.featured_record_id);
        const foundFeaturedRecord = featuredRecordData.rows[0];
        if (
          foundFeaturedRecord &&
          String(foundFeaturedRecord.project_id) === String(project.id)
        ) {
          featuredRecord = {
            id: foundFeaturedRecord.id,
            title: foundFeaturedRecord.title,
            description: foundFeaturedRecord.description,
          };

          const recordImageData = await getRecordImagesByRecordQuery(
            foundFeaturedRecord.id,
          );
          if (recordImageData.rows.length) {
            const imageIds = recordImageData.rows.map((row) => row.image_id);
            const imagesData = await getImagesQuery(imageIds);
            featuredRecordImageUrls = await getSignedUrls(imagesData.rows);
          }
        }
      }

      const userId = req.session?.user ?? null;
      let isOwner = false;
      let isMember = false;
      let hasPendingRequest = false;
      let pendingRequestId: number | null = null;

      if (userId) {
        isOwner = String(project.user_id) === String(userId);
        if (isOwner) {
          isMember = true;
        } else {
          const projectUserData = await getProjectUserByUserAndProjectQuery(
            userId,
            project.id,
          );
          isMember = Boolean(projectUserData.rows[0]);
        }

        if (!isMember) {
          try {
            const pendingData = await getPendingProjectJoinRequestByProjectAndUserQuery(
              project.id,
              userId,
            );
            const pendingRequest = pendingData.rows[0];
            if (pendingRequest) {
              hasPendingRequest = true;
              pendingRequestId = Number(pendingRequest.id);
            }
          } catch (err) {
            if (!isMissingProjectJoinRequestTableError(err)) throw err;
          }
        }
      }

      const capacity = project.public_join_capacity;
      const spotsRemaining =
        capacity === null ? null : Math.max(Number(capacity) - memberCount, 0);
      const isFull = spotsRemaining !== null && spotsRemaining <= 0;

      const redirectTarget = req.originalUrl || getPublicWyrldPath(project.id, project.title);
      const loginHref = `/login?redirect=${encodeURIComponent(redirectTarget)}`;
      const canonicalPath = getPublicWyrldPath(project.id, project.title);
      const canonicalUrl = `${getRequestOrigin(req)}${canonicalPath}`;
      const featuredImageValues = Object.values(featuredRecordImageUrls);
      const shareImage = projectBannerSrc || featuredImageValues[0] || null;
      const metaDescription =
        normalizeMetaDescription(project.description, 170) ||
        normalizeMetaDescription(featuredRecord?.description, 170) ||
        `Discover ${project.title} on Far Reach Co.`;

      res.render("publicwyrld", {
        auth: userId || undefined,
        isAuthenticated: Boolean(userId),
        project,
        ownerUsername,
        memberCount,
        featuredRecord,
        featuredRecordImageUrls,
        projectBannerSrc,
        projectBannerName,
        isOwner,
        isMember,
        hasPendingRequest,
        pendingRequestId,
        spotsRemaining,
        isFull,
        loginHref,
        canonicalPath,
        canonicalUrl,
        metaDescription,
        shareImage,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldtable",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/forbidden");
      if (!userId) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldtable", {
        auth: userId,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldcalendar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/forbidden");
      if (!userId) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldcalendar", {
        auth: userId,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldrecord",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/forbidden");
      if (!userId) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldrecord", {
        auth: userId,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/newwyrld", (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/forbidden");
    if (!userId) return;
    res.render("newwyrld", { auth: userId });
  } catch (err) {
    next(err);
  }
});

export default router;
