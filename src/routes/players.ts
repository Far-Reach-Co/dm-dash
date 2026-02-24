import { Router, Request, Response, NextFunction } from "express";
import { requireUserOrRedirect } from "../lib/authz";
import { upsertRecentlyViewed } from "../api/queries/recentlyViewed";
import { resolvePlayerSheetAccess } from "./playerSheetAccessService";
import { getCharacterSheetExportData } from "./playerSheetExportService";
import {
  buildExportHref,
  buildExportJsonHref,
  buildSheetHref,
  toSafeFilenamePart,
} from "./playerSheetRouteUtils";

const router = Router();

router.get(
  "/5eplayer",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access = await resolvePlayerSheetAccess(req, res);
      if (!access) return;

      upsertRecentlyViewed(access.userId, "sheet", access.playerSheetId);
      res.render("5eplayer", {
        auth: access.userId,
        playerSheetName: access.playerSheetName,
        exportHref: buildExportHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        ),
        jsonExportHref: buildExportJsonHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        ),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5eplayer/export/json",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access = await resolvePlayerSheetAccess(req, res);
      if (!access) return;

      const exportData = await getCharacterSheetExportData(access.playerSheetId);
      if (!exportData) return res.redirect("/dash");

      const datePart = new Date().toISOString().slice(0, 10);
      const safeName = toSafeFilenamePart(access.playerSheetName);
      const fileName = `${safeName}-${datePart}.json`;

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      return res.status(200).send(
        JSON.stringify(
          {
            schemaVersion: "1.0.0",
            exportType: "dnd5e_character_sheet",
            exportedAt: new Date().toISOString(),
            app: "dm-dash",
            sheet: {
              id: access.playerSheetId,
              name: access.playerSheetName,
              projectId: access.projectId,
            },
            data: exportData,
          },
          null,
          2,
        ),
      );
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5eplayer/export",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access = await resolvePlayerSheetAccess(req, res);
      if (!access) return;

      const exportData = await getCharacterSheetExportData(access.playerSheetId);
      if (!exportData) return res.redirect("/dash");

      res.render("5eplayer-export", {
        auth: access.userId,
        playerSheetName: access.playerSheetName,
        sheetHref: buildSheetHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        ),
        printHref: `${buildExportHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        )}&print=1`,
        autoPrint: req.query.print === "1",
        exportData,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/newsheet", (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/forbidden");
    if (!userId) return;
    res.render("newsheet", {
      auth: userId,
      wyrld_id: req.query.wyrld_id || null,
      wyrld_title: req.query.wyrld_title || null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
