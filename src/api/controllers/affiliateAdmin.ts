import { NextFunction, Request, Response } from "express";
import {
  addAffiliateCodeQuery,
  editAffiliateCodeQuery,
  getAffiliateCodeByCodeQuery,
  getAffiliateCodeByIdQuery,
} from "../queries/affiliateCodes";
import {
  getAffiliateCommissionPayoutCandidateByIdQuery,
  markAffiliateCommissionPaidQuery,
} from "../queries/affiliateCommissions";
import { normalizeAffiliateCode } from "../../lib/affiliate";
import { requireAffiliateAdmin } from "../../lib/affiliateAdminAuth";
import {
  createStripeConnectExpressAccount,
  createStripeConnectOnboardingLink,
  retrieveStripeConnectAccount,
} from "../../lib/stripeApi";
import {
  attemptAffiliateCommissionPayoutById,
  processPendingAffiliateCommissionPayouts,
} from "../../lib/affiliatePayouts";

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseCheckbox(value: unknown): boolean {
  if (Array.isArray(value)) return parseCheckbox(value[value.length - 1]);
  return value === true || value === "true" || value === "on" || value === "1";
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized || !normalized.includes("@") || normalized.length > 255) {
    return null;
  }
  return normalized;
}

function adminRedirectPath(status: string) {
  return `/admin/affiliates?status=${encodeURIComponent(status)}`;
}

function respondAdminRedirect(req: Request, res: Response, path: string) {
  if (req.headers["hx-request"]) {
    res.set("HX-Redirect", path).status(200).send("Redirecting");
    return;
  }
  res.redirect(303, path);
}

async function createAffiliateCode(req: Request, res: Response, next: NextFunction) {
  try {
    await requireAffiliateAdmin(req);

    const code = normalizeAffiliateCode(req.body?.code);
    if (!code) throw { status: 400, message: "Invalid affiliate code format" };

    const collaboratorName = normalizeText(req.body?.collaborator_name, 255);
    if (!collaboratorName) {
      throw { status: 400, message: "Collaborator name is required" };
    }

    const collaboratorEmail = normalizeEmail(req.body?.collaborator_email);
    const notes = normalizeText(req.body?.notes, 2000) || null;
    const existingData = await getAffiliateCodeByCodeQuery(code);
    if (existingData.rows[0]) {
      throw { status: 409, message: "Affiliate code already exists" };
    }

    await addAffiliateCodeQuery({
      code,
      collaborator_name: collaboratorName,
      collaborator_email: collaboratorEmail,
      notes,
    });

    respondAdminRedirect(req, res, adminRedirectPath("code_created"));
  } catch (err) {
    next(err);
  }
}

async function updateAffiliateCodeEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireAffiliateAdmin(req);

    const id = parsePositiveInt(req.params.id);
    if (!id) throw { status: 400, message: "Invalid affiliate code id" };

    const emailInput = normalizeText(req.body?.collaborator_email, 255);
    const collaboratorEmail = emailInput ? normalizeEmail(emailInput) : null;
    if (emailInput && !collaboratorEmail) {
      throw { status: 400, message: "Invalid collaborator email" };
    }

    const data = await editAffiliateCodeQuery(id, {
      collaborator_email: collaboratorEmail,
    });
    if (!data.rows[0]) throw { status: 404, message: "Affiliate code not found" };

    respondAdminRedirect(req, res, adminRedirectPath("code_email_updated"));
  } catch (err) {
    next(err);
  }
}

async function startAffiliateCodeConnectOnboarding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireAffiliateAdmin(req);

    const id = parsePositiveInt(req.params.id);
    if (!id) throw { status: 400, message: "Invalid affiliate code id" };

    const codeData = await getAffiliateCodeByIdQuery(id);
    const code = codeData.rows[0];
    if (!code) throw { status: 404, message: "Affiliate code not found" };

    const emailInput = normalizeText(req.body?.collaborator_email, 255);
    const collaboratorEmail = emailInput
      ? normalizeEmail(emailInput)
      : normalizeEmail(code.collaborator_email);
    if (emailInput && !collaboratorEmail) {
      throw { status: 400, message: "Invalid collaborator email" };
    }

    let connectAccountId = code.stripe_connect_account_id;
    if (!connectAccountId) {
      const created = await createStripeConnectExpressAccount({
        email: collaboratorEmail,
        metadata: {
          affiliate_code_id: String(code.id),
          affiliate_code: code.code,
        },
      });
      connectAccountId = created.id;
    }

    const account = await retrieveStripeConnectAccount(connectAccountId);
    await editAffiliateCodeQuery(id, {
      collaborator_email: collaboratorEmail,
      stripe_connect_account_id: account.id,
      stripe_connect_details_submitted: account.detailsSubmitted,
      stripe_connect_charges_enabled: account.chargesEnabled,
      stripe_connect_payouts_enabled: account.payoutsEnabled,
    });

    if (account.payoutsEnabled) {
      respondAdminRedirect(req, res, adminRedirectPath("connect_ready"));
      return;
    }

    const onboardingLink = await createStripeConnectOnboardingLink({
      accountId: account.id,
      refreshPath: adminRedirectPath("connect_link_expired"),
      returnPath: adminRedirectPath("connect_return"),
    });
    if (req.headers["hx-request"]) {
      res.set("HX-Redirect", onboardingLink.url).status(200).send("Redirecting");
      return;
    }
    res.redirect(303, onboardingLink.url);
  } catch (err) {
    next(err);
  }
}

async function toggleAffiliateCodeStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireAffiliateAdmin(req);

    const id = parsePositiveInt(req.params.id);
    if (!id) throw { status: 400, message: "Invalid affiliate code id" };

    const isActive = parseCheckbox(req.body?.is_active);
    const data = await editAffiliateCodeQuery(id, {
      is_active: isActive,
    });
    if (!data.rows[0]) throw { status: 404, message: "Affiliate code not found" };

    respondAdminRedirect(
      req,
      res,
      adminRedirectPath(isActive ? "code_enabled" : "code_disabled"),
    );
  } catch (err) {
    next(err);
  }
}

async function markAffiliateCommissionPaid(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const adminUser = await requireAffiliateAdmin(req);
    const id = parsePositiveInt(req.params.id);
    if (!id) throw { status: 400, message: "Invalid commission id" };

    const payoutNote = normalizeText(req.body?.payout_note, 2000) || null;
    const data = await markAffiliateCommissionPaidQuery({
      id,
      paid_by_user_id: adminUser.id,
      payout_note: payoutNote,
    });
    if (!data.rows[0]) {
      throw { status: 409, message: "Commission is already processed or missing" };
    }

    respondAdminRedirect(req, res, adminRedirectPath("commission_paid"));
  } catch (err) {
    next(err);
  }
}

async function processAffiliatePendingPayouts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireAffiliateAdmin(req);
    const result = await processPendingAffiliateCommissionPayouts({
      limit: 500,
    });

    respondAdminRedirect(
      req,
      res,
      `${adminRedirectPath("payout_batch_processed")}&paid=${result.paid}&failed=${result.failed}&skipped=${result.skipped}`,
    );
  } catch (err) {
    next(err);
  }
}

async function retryAffiliateCommissionPayout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireAffiliateAdmin(req);
    const id = parsePositiveInt(req.params.id);
    if (!id) throw { status: 400, message: "Invalid commission id" };

    const candidateData = await getAffiliateCommissionPayoutCandidateByIdQuery(id);
    if (!candidateData.rows[0]) {
      throw { status: 404, message: "Commission not found" };
    }

    const result = await attemptAffiliateCommissionPayoutById(id);
    const status =
      result.status === "paid"
        ? "payout_retry_paid"
        : result.status === "failed"
          ? "payout_retry_failed"
          : "payout_retry_skipped";

    respondAdminRedirect(req, res, adminRedirectPath(status));
  } catch (err) {
    next(err);
  }
}

export {
  createAffiliateCode,
  updateAffiliateCodeEmail,
  startAffiliateCodeConnectOnboarding,
  toggleAffiliateCodeStatus,
  markAffiliateCommissionPaid,
  processAffiliatePendingPayouts,
  retryAffiliateCommissionPayout,
};
