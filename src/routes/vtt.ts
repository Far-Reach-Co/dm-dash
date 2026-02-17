import { Router, Request, Response, NextFunction } from "express";
import { getTableViewByUUIDQuery } from "../api/queries/tableViews";
import { upsertRecentlyViewed } from "../api/queries/recentlyViewed";
import { requireTableAccessOrRedirect } from "../lib/authz";
import { createGuestSandbox, requireGuestSandboxAccess } from "../lib/guestSandbox";
import { rateLimit } from "express-rate-limit";

const router = Router();

const guestSandboxStartLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get(
  "/vtt/guest/start",
  guestSandboxStartLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sandbox = await createGuestSandbox(req, {});
      return res.redirect(`/vtt?guest_uuid=${sandbox.id}`);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/vtt", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guestUUID =
      typeof req.query.guest_uuid === "string" ? req.query.guest_uuid : null;
    if (guestUUID) {
      try {
        await requireGuestSandboxAccess(req, guestUUID);
      } catch (err) {
        return res.redirect("/forbidden");
      }
      return res.render("vtt", {
        auth: req.session.user,
      });
    }

    if (!req.query.uuid) return res.render("404", { auth: req.session.user });
    const uuid = req.query.uuid as string;
    const tableData = await getTableViewByUUIDQuery(uuid);

    // if not table
    if (!tableData.rows.length) {
      return res.render("404", { auth: req.session.user });
    }

    const table = tableData.rows[0];
    const hasAccess = await requireTableAccessOrRedirect(req, res, table, "/forbidden");
    if (!hasAccess) return;
    if (req.session.user) {
      upsertRecentlyViewed(req.session.user, "table", table.id);
    }
    return res.render("vtt", {
      auth: req.session.user,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
