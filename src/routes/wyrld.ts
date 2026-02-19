import { Router, Request, Response, NextFunction } from "express";
import { getTableViewsByProjectQuery } from "../api/queries/tableViews";
import {
  getProjectUsersByProjectQuery,
  getProjectUserByUserAndProjectQuery,
} from "../api/queries/projectUsers";
import { getProjectPlayersByProjectQuery } from "../api/queries/projectPlayers";
import { getProjectInviteByProjectQuery } from "../api/queries/projectInvites";
import { get5eCharGeneralQuery } from "../api/queries/5eCharGeneral";
import { getCalendarsQuery } from "../api/queries/calendars";
import { getRecordsByProjectQuery } from "../api/queries/record";
import { getUserByIdQuery, User } from "../api/queries/users";
import { humanFileSize } from "../lib/utils";
import { getTableImageCountByProjectQuery } from "../api/queries/tableImages";
import { getImageQuery } from "../api/queries/images";
import { getSignedUrls } from "../api/controllers/s3";
import {
  requireProjectEditorOrRedirect,
  requireProjectMemberOrRedirect,
  requireUserOrRedirect,
} from "../lib/authz";
import { upsertRecentlyViewed, getRecentlyViewedByUserForIds } from "../api/queries/recentlyViewed";

const router = Router();

const RECENT_LIMIT = 5;

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
  if (userId == project.user_id) {
    const projectUsersData = await getProjectUsersByProjectQuery(project.id);
    for (const projectUser of projectUsersData.rows) {
      const userData = await getUserByIdQuery(projectUser.user_id);
      const user = userData.rows[0];
      (user as GetProjectUsersByProjectReturnUser).project_user_id =
        projectUser.id;
      (user as GetProjectUsersByProjectReturnUser).is_editor =
        projectUser.is_editor;
      settingsUsers.push(user as GetProjectUsersByProjectReturnUser);
    }
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
  res.redirect(id ? `/wyrld?id=${id}` : "/dash");
});

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
