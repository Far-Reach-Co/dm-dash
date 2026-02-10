import { Router, Request, Response, NextFunction } from "express";
import { csrfMiddleware } from "./csrf";

const router = Router();

router.get(
  "/login",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Invalidate old session cookie
      res.clearCookie("frcsession", {
        httpOnly: true,
        sameSite: "lax",
      });
      const csrfToken = res.locals.csrfToken;
      res.render("login", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/register",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const csrfToken = res.locals.csrfToken;
      res.render("register", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/forgotpassword",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const csrfToken = res.locals.csrfToken;
      res.render("forgotpassword", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/resetpassword",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const csrfToken = res.locals.csrfToken;
      res.render("resetpassword", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
