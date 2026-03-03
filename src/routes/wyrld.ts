import { Router, Request, Response, NextFunction } from "express";
import {
  getProjectUsersByProjectQuery,
  getProjectUsersQuery,
  getProjectUserByUserAndProjectQuery,
} from "../api/queries/projectUsers";
import { getProjectsQuery, getProjectQuery } from "../api/queries/projects";
import { getRecordQuery } from "../api/queries/record";
import { getUserByIdQuery } from "../api/queries/users";
import { getPublicWyrldDirectoryQuery } from "../api/queries/publicWyrlds";
import { getImageQuery, getImagesQuery } from "../api/queries/images";
import { getSignedUrls } from "../api/controllers/s3";
import { getRecordImagesByRecordQuery } from "../api/queries/recordImage";
import {
  requireProjectEditorOrRedirect,
  requireUserOrRedirect,
} from "../lib/authz";
import { upsertRecentlyViewed } from "../api/queries/recentlyViewed";
import {
  getPendingProjectJoinRequestByProjectAndUserQuery,
  getPendingProjectJoinRequestsByRequesterQuery,
} from "../api/queries/projectJoinRequests";
import {
  getPublicWyrldPath,
  getRequestOrigin,
  isMissingProjectJoinRequestTableError,
  normalizeMetaDescription,
  toPublicWyrldSlug,
} from "./wyrldHelpers";
import { loadWyrldData } from "./wyrldData";
import { expireStaleProJoinRequests } from "../lib/projectJoinRequestExpiry";

const router = Router();

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
  [
    "/wyrld/tables",
    "/wyrld/records",
    "/wyrld/sheets",
    "/wyrld/calendars",
    "/wyrld/community",
    "/wyrld/activity",
    "/wyrld/settings",
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const section = req.path.split("/")[2];

      const data = await loadWyrldData(req, res, userId, projectId, section);
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
        await expireStaleProJoinRequests({
          req,
          requesterUserId: userId,
        });
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
      if (!project || !project.is_public_listed) {
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
      if (!project || !project.is_public_listed) {
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
        `Join ${project.title}, an online tabletop RPG campaign looking for players on Far Reach Co.`;

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
