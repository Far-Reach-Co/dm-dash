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
    "code_enabled",
    "code_disabled",
    "commission_paid",
  ]);
  return allowed.has(raw) ? raw : "";
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
