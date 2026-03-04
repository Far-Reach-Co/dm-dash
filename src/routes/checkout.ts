import { Router, Request, Response, NextFunction } from "express";
import { getActiveAffiliateCodeByCodeQuery } from "../api/queries/affiliateCodes";
import { getProjectsByIdsQuery, getProjectsQuery } from "../api/queries/projects";
import { getProjectUsersQuery } from "../api/queries/projectUsers";
import { getUserByIdQuery } from "../api/queries/users";
import { normalizeAffiliateCode } from "../lib/affiliate";
import { requireUserOrRedirect } from "../lib/authz";

const router = Router();

type CheckoutPlan = "user" | "project";
type CheckoutInterval = "monthly" | "yearly";

function parseCheckoutSource(value: unknown): "account" | "wyrld" {
  if (typeof value !== "string") return "account";
  return value.trim().toLowerCase() === "wyrld" ? "wyrld" : "account";
}

function parseCheckoutPlan(value: unknown): CheckoutPlan {
  if (typeof value !== "string") return "user";
  return value.trim().toLowerCase() === "project" ? "project" : "user";
}

function parseCheckoutInterval(value: unknown): CheckoutInterval {
  if (typeof value !== "string") return "monthly";
  return value.trim().toLowerCase() === "yearly" ? "yearly" : "monthly";
}

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseCheckoutStatus(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (
    raw === "user_success" ||
    raw === "user_cancel" ||
    raw === "wyrld_success" ||
    raw === "wyrld_cancel"
  ) {
    return raw;
  }
  return "";
}

function buildCheckoutReturnPath(params: {
  source: "account" | "wyrld";
  plan: CheckoutPlan;
  interval: CheckoutInterval;
  projectId: number | null;
  affiliateCode: string | null;
}) {
  const query = new URLSearchParams();
  query.set("from", params.source);
  query.set("plan", params.plan);
  query.set("interval", params.interval);
  if (params.projectId) {
    query.set("project_id", String(params.projectId));
  }
  if (params.affiliateCode) {
    query.set("ref", params.affiliateCode);
  }
  return `/checkout?${query.toString()}`;
}

router.get("/checkout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/login");
    if (!userId) return;

    const source = parseCheckoutSource(req.query.from);
    const requestedPlan = parseCheckoutPlan(req.query.plan);
    const interval = parseCheckoutInterval(req.query.interval);
    const requestedProjectId = parsePositiveInt(req.query.project_id);
    const requestedAffiliateCode = normalizeAffiliateCode(req.query.ref);
    const checkoutStatus = parseCheckoutStatus(req.query.billing);

    const [userData, ownedProjectsData, joinedProjectUsersData] = await Promise.all([
      getUserByIdQuery(userId),
      getProjectsQuery(userId),
      getProjectUsersQuery(userId),
    ]);
    const user = userData.rows[0];
    if (!user) throw { status: 404, message: "User not found" };

    const ownedProjects = ownedProjectsData.rows.map((project) => ({
      id: Number(project.id),
      title: String(project.title || "Untitled Wyrld"),
      is_pro: Boolean(project.is_pro),
      relation: "owner" as const,
    }));
    const ownedProjectIds = new Set(ownedProjects.map((project) => project.id));

    const joinedProjectIds = [
      ...new Set(
        joinedProjectUsersData.rows
          .map((projectUser) => Number(projectUser.project_id))
          .filter((id) => Number.isInteger(id) && id > 0 && !ownedProjectIds.has(id)),
      ),
    ];
    const joinedProjectsData = joinedProjectIds.length
      ? await getProjectsByIdsQuery(joinedProjectIds)
      : { rows: [] };
    const joinedProjects = joinedProjectsData.rows.map((project) => ({
      id: Number(project.id),
      title: String(project.title || "Untitled Wyrld"),
      is_pro: Boolean(project.is_pro),
      relation: "member" as const,
    }));
    const availableProjects = [...ownedProjects, ...joinedProjects];
    const availableProjectIds = new Set(availableProjects.map((project) => project.id));

    const selectedProjectId =
      requestedProjectId && availableProjectIds.has(requestedProjectId)
        ? requestedProjectId
        : availableProjects[0]?.id || null;

    const plan: CheckoutPlan = requestedPlan;
    const affiliateCodeData = requestedAffiliateCode
      ? await getActiveAffiliateCodeByCodeQuery(requestedAffiliateCode)
      : { rows: [] };
    const activeAffiliateCode = affiliateCodeData.rows[0] || null;
    const affiliateCode = activeAffiliateCode?.code || null;
    const affiliateMessage = requestedAffiliateCode
      ? activeAffiliateCode
        ? `Referral code applied (${activeAffiliateCode.code})`
        : "Referral code is invalid or inactive."
      : "";

    const backPath =
      source === "wyrld" && selectedProjectId
        ? `/wyrld/settings?id=${selectedProjectId}`
        : "/account";

    res.render("checkout", {
      auth: userId,
      source,
      plan,
      interval,
      selectedProjectId,
      availableProjects,
      affiliateCode,
      affiliateMessage,
      userIsPro: Boolean(user.is_pro),
      backPath,
      checkoutStatus,
      returnPath: buildCheckoutReturnPath({
        source,
        plan,
        interval,
        projectId: selectedProjectId,
        affiliateCode,
      }),
      billingPath:
        source === "wyrld" && selectedProjectId
          ? `/billing?from=wyrld&project_id=${selectedProjectId}`
          : "/billing?from=account",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
