import { Router, Request, Response, NextFunction } from "express";
import { requireUserOrRedirect } from "../lib/authz";

const router = Router();

router.get("/newtable", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!requireUserOrRedirect(req, res, "/forbidden")) return;
    res.render("newtable", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

export default router;
