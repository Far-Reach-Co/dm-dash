import { Router, Request, Response, NextFunction } from "express";
import { getRecordQuery } from "../api/queries/record";
import { getRecordImagesByRecordQuery } from "../api/queries/recordImage";
import { getImagesQuery, Image } from "../api/queries/images";
import { getSignedUrls } from "../api/controllers/s3";
import { getProjectQuery } from "../api/queries/projects";
import logger from "../lib/logger.js";
import { requireRecordAccessOrRedirect, requireUserOrRedirect } from "../lib/authz";
import { upsertRecentlyViewed } from "../api/queries/recentlyViewed";

const router = Router();

router.get("/newrecord", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!requireUserOrRedirect(req, res, "/forbidden")) return;
    res.render("newrecord", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/editrecord",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.id) return res.redirect("/404");
      const recordId = req.query.id as string;
      const userId = req.session.user as string;

      const data = await getRecordQuery(recordId);
      const record = data.rows[0];

      const recordImageData = await getRecordImagesByRecordQuery(recordId);
      let imagesFromRecordImages: Image[] = [];
      let imageUrls: { [key: string]: string } = {};
      if (recordImageData.rows.length) {
        const imageIds = recordImageData.rows.map((ri) => ri.image_id);
        const imageDataList = await getImagesQuery(imageIds);
        imagesFromRecordImages = imageDataList.rows;
        imageUrls = await getSignedUrls(imagesFromRecordImages);
        logger.debug(
          { recordId, imageCount: imageIds.length },
          "Loaded record image URLs",
        );
      }

      // render non wyrld public or not
      if (!req.query.project_id) {
        const access = await requireRecordAccessOrRedirect(req, res, record, {
          mode: "edit",
          redirectTo: "/forbidden",
        });
        if (!access) return;
      } else {
        const projectId = req.query.project_id as string;
        const access = await requireRecordAccessOrRedirect(req, res, record, {
          mode: "edit",
          projectId,
          redirectTo: "/forbidden",
        });
        if (!access) return;
      }

      res.render("editrecord", {
        auth: userId,
        record: record,
        imageUrls: imageUrls,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/record",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.id) return res.redirect("/404");
      const recordId = req.query.id as string;
      const userId = req.session.user as string;

      const recordData = await getRecordQuery(recordId);
      const record = recordData.rows[0];

      const recordImageData = await getRecordImagesByRecordQuery(recordId);
      let imagesFromRecordImages: Image[] = [];
      let imageUrls: { [key: string]: string } = {};
      if (recordImageData.rows.length) {
        const imageIds = recordImageData.rows.map((ri) => ri.image_id);
        const imageDataList = await getImagesQuery(imageIds);
        imagesFromRecordImages = imageDataList.rows;
        imageUrls = await getSignedUrls(imagesFromRecordImages);
        logger.debug(
          { recordId, imageCount: imageIds.length },
          "Loaded record image URLs",
        );
      }

      if (userId) {
        upsertRecentlyViewed(userId, "record", recordId);
      }

      // render non wyrld public or not
      if (!req.query.project_id) {
        const access = await requireRecordAccessOrRedirect(req, res, record, {
          mode: "view",
          redirectTo: "/forbidden",
        });
        if (!access) return;
        return res.render("record", {
          auth: userId,
          record: record,
          imageUrls: imageUrls,
          projectId: null,
          canEdit: access.canEdit,
        });
      } else {
        // handle wyrld auth
        const projectId = req.query.project_id as string;
        const access = await requireRecordAccessOrRedirect(req, res, record, {
          mode: "view",
          projectId,
          redirectTo: "/forbidden",
        });
        if (!access) return;
        const projectData = await getProjectQuery(projectId);
        const project = projectData.rows[0];
        return res.render("record", {
          auth: userId,
          record: record,
          imageUrls: imageUrls,
          projectId: project.id,
          canEdit: access.canEdit,
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

export default router;
