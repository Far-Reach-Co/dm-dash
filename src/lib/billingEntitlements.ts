import { editProjectQuery, getProjectQuery } from "../api/queries/projects";
import {
  hasActiveProjectScopeSubscriptionQuery,
  hasActiveUserScopeSubscriptionQuery,
} from "../api/queries/billingSubscriptions";
import { editUserQuery, getUserByIdQuery } from "../api/queries/users";

export const ACTIVE_BILLING_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
] as const;

export async function recomputeUserProEntitlement(userId: string | number) {
  const userData = await getUserByIdQuery(userId);
  const user = userData.rows[0];
  if (!user) throw { status: 404, message: "User not found" };

  const activeData = await hasActiveUserScopeSubscriptionQuery(
    userId,
    ACTIVE_BILLING_SUBSCRIPTION_STATUSES,
  );
  const nextIsPro = Boolean(activeData.rows[0]?.has_active);

  if (Boolean(user.is_pro) !== nextIsPro) {
    await editUserQuery(user.id, { is_pro: nextIsPro });
  }

  return nextIsPro;
}

export async function recomputeProjectProEntitlement(projectId: string | number) {
  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  if (!project) throw { status: 404, message: "Project not found" };

  const activeData = await hasActiveProjectScopeSubscriptionQuery(
    projectId,
    ACTIVE_BILLING_SUBSCRIPTION_STATUSES,
  );
  const nextIsPro = Boolean(activeData.rows[0]?.has_active);

  if (Boolean(project.is_pro) !== nextIsPro) {
    await editProjectQuery(project.id, { is_pro: nextIsPro });
  }

  return nextIsPro;
}
