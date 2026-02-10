import { Router, Request, Response, NextFunction } from "express";
import { getUserByIdQuery } from "../api/queries/users";
import { humanFileSize } from "../lib/utils";
import { csrfMiddleware } from "./csrf";
import { requireUserOrRedirect } from "../lib/authz";

const router = Router();

router.get(
  "/account",
  csrfMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/login")) return;
      const csrfToken = res.locals.csrfToken;
      const { rows } = await getUserByIdQuery(req.session.user);

      // calculate used data formatted
      const usedDataFormatted = humanFileSize(rows[0].used_data_in_bytes);

      res.render("account", {
        auth: req.session.user,
        user: rows[0],
        usedDataFormatted,
        csrfToken,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
