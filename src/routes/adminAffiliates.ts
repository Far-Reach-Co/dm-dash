import { Router, Request, Response, NextFunction } from "express";
import { getAffiliateCodesQuery } from "../api/queries/affiliateCodes";
import { getAffiliateCommissionsAdminQuery } from "../api/queries/affiliateCommissions";
import { requireAffiliateAdminOrRedirect } from "../lib/affiliateAdminAuth";
import { getPublicAppUrl } from "../lib/emailPreferences";
import { csrfMiddleware } from "./csrf";

const router = Router();

function parseStatus(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  const allowed = new Set([
    "code_created",
    "code_email_updated",
    "code_enabled",
    "code_disabled",
    "connect_ready",
    "connect_return",
    "connect_link_expired",
    "commission_paid",
    "payout_batch_processed",
    "payout_retry_paid",
    "payout_retry_failed",
    "payout_retry_skipped",
  ]);
  return allowed.has(raw) ? raw : "";
}

function parseNonNegativeInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

router.get(
  "/admin/affiliates",
  csrfMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await requireAffiliateAdminOrRedirect(req, res, "/forbidden");
      if (!user) return;

      const [codesData, commissionsData] = await Promise.all([
        getAffiliateCodesQuery(),
        getAffiliateCommissionsAdminQuery(),
      ]);
      const codes = codesData.rows;
      const commissions = commissionsData.rows;
      const pendingByCode: Record<number, number> = {};
      for (const commission of commissions) {
        if (commission.status !== "pending") continue;
        pendingByCode[commission.affiliate_code_id] =
          (pendingByCode[commission.affiliate_code_id] || 0) + commission.amount_cents;
      }

      res.render("admin-affiliates", {
        auth: user.id,
        csrfToken: res.locals.csrfToken,
        adminUser: user,
        status: parseStatus(req.query.status),
        payoutSummary: {
          paid: parseNonNegativeInt(req.query.paid),
          failed: parseNonNegativeInt(req.query.failed),
          skipped: parseNonNegativeInt(req.query.skipped),
        },
        publicBaseUrl: getPublicAppUrl(),
        codes,
        commissions,
        pendingByCode,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
