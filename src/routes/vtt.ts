import { Router, Request, Response, NextFunction } from "express";
import { getTableViewByUUIDQuery } from "../api/queries/tableViews";
import { upsertRecentlyViewed } from "../api/queries/recentlyViewed";
import { requireTableAccessOrRedirect } from "../lib/authz";

const router = Router();

router.get("/vtt", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.query.uuid) return res.render("404", { auth: req.session.user });
    const uuid = req.query.uuid as string;
    const tableData = await getTableViewByUUIDQuery(uuid);

    // if not table
    if (!tableData.rows.length) {
      return res.render("404", { auth: req.session.user });
    }

    const table = tableData.rows[0];
    const access = await requireTableAccessOrRedirect(req, res, table, "/forbidden");
    if (!access) return;
    if (req.session.user) {
      upsertRecentlyViewed(req.session.user, "table", table.id);
    }
    return res.render("vtt", {
      auth: req.session.user,
      projectAuth: access.projectAuth,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
