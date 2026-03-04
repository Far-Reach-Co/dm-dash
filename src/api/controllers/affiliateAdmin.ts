import { NextFunction, Request, Response } from "express";
import {
  addAffiliateCodeQuery,
  editAffiliateCodeQuery,
  getAffiliateCodeByCodeQuery,
} from "../queries/affiliateCodes";
import { markAffiliateCommissionPaidQuery } from "../queries/affiliateCommissions";
import { normalizeAffiliateCode } from "../../lib/affiliate";
import { requireAffiliateAdmin } from "../../lib/affiliateAdminAuth";

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

    const notes = normalizeText(req.body?.notes, 2000) || null;
    const existingData = await getAffiliateCodeByCodeQuery(code);
    if (existingData.rows[0]) {
      throw { status: 409, message: "Affiliate code already exists" };
    }

    await addAffiliateCodeQuery({
      code,
      collaborator_name: collaboratorName,
      notes,
    });

    respondAdminRedirect(req, res, adminRedirectPath("code_created"));
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

export {
  createAffiliateCode,
  toggleAffiliateCodeStatus,
  markAffiliateCommissionPaid,
};
