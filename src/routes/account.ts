import { Router, Request, Response, NextFunction } from "express";
import { getUserByIdQuery } from "../api/queries/users";
import { humanFileSize } from "../lib/utils";
import { csrfMiddleware } from "./csrf";
import { requireUserOrRedirect } from "../lib/authz";
import { getUserDataUsageLimitBytes } from "../lib/subscription";
import { isAffiliateAdminEmail } from "../lib/affiliateAdminAuth";

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
      const rawBillingStatus =
        typeof req.query.billing === "string" ? req.query.billing.trim() : "";
      const billingStatus =
        rawBillingStatus === "user_success" ||
        rawBillingStatus === "user_cancel" ||
        rawBillingStatus === "portal_return"
          ? rawBillingStatus
          : "";

      // calculate used data formatted
      const usedDataFormatted = humanFileSize(user.used_data_in_bytes);
      const userDataLimitFormatted = humanFileSize(
        getUserDataUsageLimitBytes(Boolean(user.is_pro)),
      );

      res.render("account", {
        auth: userId,
        user,
        isAffiliateAdmin: isAffiliateAdminEmail(user.email),
        billingStatus,
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
