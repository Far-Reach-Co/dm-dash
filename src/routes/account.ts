import { Router, Request, Response, NextFunction } from "express";
import { getUserByIdQuery } from "../api/queries/users";
import { humanFileSize } from "../lib/utils";
import { csrfMiddleware } from "./csrf";
import { requireUserOrRedirect } from "../lib/authz";
import { getUserDataUsageLimitBytes } from "../lib/subscription";

const router = Router();

router.get(
  "/account",
  csrfMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      const csrfToken = res.locals.csrfToken;
      const { rows } = await getUserByIdQuery(userId);
      const user = rows[0];

      // calculate used data formatted
      const usedDataFormatted = humanFileSize(user.used_data_in_bytes);
      const userDataLimitFormatted = humanFileSize(
        getUserDataUsageLimitBytes(Boolean(user.is_pro)),
      );

      res.render("account", {
        auth: userId,
        user,
        usedDataFormatted,
        userDataLimitFormatted,
        csrfToken,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
