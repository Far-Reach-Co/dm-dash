import { Router, Request, Response, NextFunction } from "express";
import { upsertRecentlyViewed } from "../api/queries/recentlyViewed";
import { createGuestSandbox, requireGuestSandboxAccess } from "../lib/guestSandbox";
import { resolveTableAccessByUUID } from "../lib/tableAccessEvaluator";
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
    let access;
    try {
      access = await resolveTableAccessByUUID(req, uuid, {
        allowGuestSandbox: false,
      });
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        return res.render("404", { auth: req.session.user });
      }
      return res.redirect("/forbidden");
    }
    if (!access.table) {
      return res.render("404", { auth: req.session.user });
    }
    if (req.session.user) {
      upsertRecentlyViewed(req.session.user, "table", access.table.id);
    }
    return res.render("vtt", {
      auth: req.session.user,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
