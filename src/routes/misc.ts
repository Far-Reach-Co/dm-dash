import { Router, Request, Response, NextFunction } from "express";
import logger from "../lib/logger.js";

const router = Router();

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Failed to destroy session");
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/forbidden", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("forbidden", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

export default router;
