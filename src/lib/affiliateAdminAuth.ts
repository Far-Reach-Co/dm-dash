import { Request, Response } from "express";
import { getUserByIdQuery } from "../api/queries/users";
import { requireUser, requireUserOrRedirect } from "./authz";

const AFFILIATE_ADMIN_EMAILS = new Set<string>([
  "jumpingafterrain@gmail.com",
  "farreachco@gmail.com",
]);
const isDevMode = process.env.SERVER_ENV === "dev";

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export function isAffiliateAdminEmail(email: unknown) {
  if (isDevMode) return true;
  const normalized = normalizeEmail(email);
  return Boolean(normalized && AFFILIATE_ADMIN_EMAILS.has(normalized));
}

export async function getSessionUserOrThrow(req: Request) {
  const userId = requireUser(req);
  const userData = await getUserByIdQuery(userId);
  const user = userData.rows[0];
  if (!user) throw { status: 404, message: "User not found" };
  return user;
}

export async function requireAffiliateAdmin(req: Request) {
  const user = await getSessionUserOrThrow(req);
  if (!isAffiliateAdminEmail(user.email)) {
    throw { status: 403, message: "Forbidden" };
  }
  return user;
}

export async function requireAffiliateAdminOrRedirect(
  req: Request,
  res: Response,
  redirectTo = "/forbidden",
) {
  const userId = requireUserOrRedirect(req, res, "/login");
  if (!userId) return null;

  const userData = await getUserByIdQuery(userId);
  const user = userData.rows[0];
  if (!user) {
    res.redirect(redirectTo);
    return null;
  }

  if (!isAffiliateAdminEmail(user.email)) {
    res.redirect(redirectTo);
    return null;
  }

  return user;
}
