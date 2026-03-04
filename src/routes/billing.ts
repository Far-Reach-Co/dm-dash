import { Router, Request, Response, NextFunction } from "express";
import { getBillingCustomerByUserIdQuery } from "../api/queries/billingCustomers";
import {
  BillingSubscription,
  getBillingSubscriptionsByUserIdQuery,
} from "../api/queries/billingSubscriptions";
import { getProjectUsersQuery } from "../api/queries/projectUsers";
import { getProjectsByIdsQuery, getProjectsQuery } from "../api/queries/projects";
import { getUserByIdQuery } from "../api/queries/users";
import { ACTIVE_BILLING_SUBSCRIPTION_STATUSES } from "../lib/billingEntitlements";
import { requireUserOrRedirect } from "../lib/authz";

const router = Router();

const ACTIVE_STATUS_SET = new Set<string>(
  ACTIVE_BILLING_SUBSCRIPTION_STATUSES.map((status) => status.toLowerCase()),
);

type BillingInterval = "monthly" | "yearly";

interface BillingSubscriptionView {
  key: string;
  scope: "user" | "project";
  planLabel: string;
  intervalLabel: string | null;
  statusLabel: string;
  isActive: boolean;
  projectId: number | null;
  projectTitle: string | null;
  updatedAt: string;
}

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseBillingSource(value: unknown): "account" | "wyrld" {
  if (typeof value !== "string") return "account";
  return value.trim().toLowerCase() === "wyrld" ? "wyrld" : "account";
}

function parseBillingStatus(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (
    raw === "user_success" ||
    raw === "user_cancel" ||
    raw === "wyrld_success" ||
    raw === "wyrld_cancel" ||
    raw === "portal_return"
  ) {
    return raw;
  }
  return "";
}

function readEnvValue(key: string): string | null {
  const raw = process.env[key];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : null;
}

function parseIntervalToken(value: unknown): BillingInterval | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "monthly" || normalized === "month") return "monthly";
  if (normalized === "yearly" || normalized === "year" || normalized === "annual") {
    return "yearly";
  }
  return null;
}

function inferIntervalFromPriceId(
  scope: "user" | "project",
  stripePriceId: string | null,
): BillingInterval | null {
  if (!stripePriceId) return null;
  const monthlyId =
    scope === "user"
      ? readEnvValue("STRIPE_PRICE_ID_PRO_USER_MONTHLY")
      : readEnvValue("STRIPE_PRICE_ID_PRO_WYRLD_MONTHLY");
  const yearlyId =
    scope === "user"
      ? readEnvValue("STRIPE_PRICE_ID_PRO_USER_YEARLY")
      : readEnvValue("STRIPE_PRICE_ID_PRO_WYRLD_YEARLY");
  if (monthlyId && stripePriceId === monthlyId) return "monthly";
  if (yearlyId && stripePriceId === yearlyId) return "yearly";
  return null;
}

function getSubscriptionInterval(subscription: BillingSubscription): BillingInterval | null {
  const metadata = subscription.metadata_json || {};
  const fromMetadata =
    parseIntervalToken((metadata as Record<string, unknown>).interval) ||
    parseIntervalToken((metadata as Record<string, unknown>).billing_interval);
  if (fromMetadata) return fromMetadata;
  return inferIntervalFromPriceId(subscription.scope, subscription.stripe_price_id);
}

function formatIntervalLabel(interval: BillingInterval | null) {
  if (interval === "monthly") return "Monthly";
  if (interval === "yearly") return "Yearly";
  return null;
}

function formatStatusLabel(status: string | null | undefined) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "Unknown";
  return normalized
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function getStatusRank(status: string) {
  return ACTIVE_STATUS_SET.has(String(status || "").toLowerCase()) ? 0 : 1;
}

function getTimestampMs(value: string | null | undefined) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCandidatePreferred(candidate: BillingSubscription, current: BillingSubscription) {
  const candidateRank = getStatusRank(candidate.status);
  const currentRank = getStatusRank(current.status);
  if (candidateRank !== currentRank) return candidateRank < currentRank;

  const candidateUpdatedAtMs = getTimestampMs(candidate.updated_at);
  const currentUpdatedAtMs = getTimestampMs(current.updated_at);
  if (candidateUpdatedAtMs !== currentUpdatedAtMs) {
    return candidateUpdatedAtMs > currentUpdatedAtMs;
  }

  return candidate.id > current.id;
}

function buildSubscriptionViews(
  subscriptions: BillingSubscription[],
  projectTitlesById: Map<number, string>,
): BillingSubscriptionView[] {
  const byTarget = new Map<string, BillingSubscription>();

  for (const subscription of subscriptions) {
    const key =
      subscription.scope === "project"
        ? `project:${subscription.project_id || subscription.stripe_subscription_id}`
        : "user";
    const existing = byTarget.get(key);
    if (!existing || isCandidatePreferred(subscription, existing)) {
      byTarget.set(key, subscription);
    }
  }

  const views: BillingSubscriptionView[] = Array.from(byTarget.values()).map((subscription) => {
    const isActive = ACTIVE_STATUS_SET.has(subscription.status.toLowerCase());
    const interval = getSubscriptionInterval(subscription);
    const projectTitle =
      subscription.scope === "project" && subscription.project_id
        ? projectTitlesById.get(subscription.project_id) ||
          `Wyrld #${subscription.project_id}`
        : null;

    return {
      key:
        subscription.scope === "project"
          ? `project:${subscription.project_id || subscription.stripe_subscription_id}`
          : "user",
      scope: subscription.scope,
      planLabel: subscription.scope === "project" ? "Pro Wyrld" : "Pro User",
      intervalLabel: formatIntervalLabel(interval),
      statusLabel: formatStatusLabel(subscription.status),
      isActive,
      projectId: subscription.project_id ? Number(subscription.project_id) : null,
      projectTitle,
      updatedAt: subscription.updated_at,
    };
  });

  views.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (a.scope !== b.scope) return a.scope === "user" ? -1 : 1;
    if (a.scope === "project" && b.scope === "project") {
      const titleA = (a.projectTitle || "").toLowerCase();
      const titleB = (b.projectTitle || "").toLowerCase();
      if (titleA !== titleB) return titleA.localeCompare(titleB);
    }
    return getTimestampMs(b.updatedAt) - getTimestampMs(a.updatedAt);
  });

  return views;
}

function buildBillingReturnPath(params: {
  source: "account" | "wyrld";
  projectId: number | null;
}) {
  const query = new URLSearchParams();
  query.set("from", params.source);
  if (params.projectId) {
    query.set("project_id", String(params.projectId));
  }
  return `/billing?${query.toString()}`;
}

router.get("/billing", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/login");
    if (!userId) return;

    const source = parseBillingSource(req.query.from);
    const requestedProjectId = parsePositiveInt(req.query.project_id);
    const billingStatus = parseBillingStatus(req.query.billing);

    const userData = await getUserByIdQuery(userId);
    const user = userData.rows[0];
    if (!user) throw { status: 404, message: "User not found" };

    const [ownedProjectsData, joinedProjectUsersData] = await Promise.all([
      getProjectsQuery(userId),
      getProjectUsersQuery(userId),
    ]);
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

    const selectedProject =
      selectedProjectId != null
        ? availableProjects.find((project) => project.id === selectedProjectId) || null
        : null;

    const projectTitlesById = new Map<number, string>();
    for (const project of availableProjects) {
      projectTitlesById.set(project.id, project.title);
    }

    const subscriptionsData = await getBillingSubscriptionsByUserIdQuery(userId);
    const subscriptionViews = buildSubscriptionViews(
      subscriptionsData.rows,
      projectTitlesById,
    );

    const contextSubscription =
      source === "wyrld" && selectedProjectId
        ? subscriptionViews.find(
            (subscription) =>
              subscription.scope === "project" && subscription.projectId === selectedProjectId,
          ) || null
        : subscriptionViews.find((subscription) => subscription.scope === "user") || null;

    const contextPlanLabel = contextSubscription
      ? contextSubscription.planLabel
      : source === "wyrld"
        ? "No Wyrld Subscription"
        : "No User Subscription";
    const contextIntervalLabel = contextSubscription
      ? contextSubscription.intervalLabel
      : null;
    const contextStatusLabel = contextSubscription
      ? contextSubscription.statusLabel
      : "Not Subscribed";

    const customerData = await getBillingCustomerByUserIdQuery(userId);
    const hasBillingCustomer = Boolean(customerData.rows[0]?.stripe_customer_id);

    const backPath =
      source === "wyrld" && selectedProjectId
        ? `/wyrld/settings?id=${selectedProjectId}`
        : "/account";
    const checkoutPath =
      source === "wyrld" && selectedProjectId
        ? `/checkout?from=wyrld&plan=project&project_id=${selectedProjectId}`
        : "/checkout?from=account&plan=user";

    res.render("billing", {
      auth: userId,
      source,
      contextPlanLabel,
      contextIntervalLabel,
      contextStatusLabel,
      subscriptionViews,
      selectedProjectId,
      selectedProjectTitle: selectedProject?.title || null,
      hasBillingCustomer,
      backPath,
      checkoutPath,
      billingStatus,
      returnPath: buildBillingReturnPath({
        source,
        projectId: selectedProjectId,
      }),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
