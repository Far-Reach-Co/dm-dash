import mail from "../api/smtp";
import { get5eCharGeneralQuery } from "../api/queries/5eCharGeneral";
import { getProjectUsersByProjectQuery } from "../api/queries/projectUsers";
import { getProjectQuery } from "../api/queries/projects";
import { getUsersByIdsQuery, User } from "../api/queries/users";
import type { BillingScope } from "../api/queries/billingSubscriptions";
import logger from "./logger";
import { getEmailPreferenceLinks, getPublicAppUrl } from "./emailPreferences";

type NotificationPreferenceKey = "notify_wyrld_join" | "notify_sheet_link";

const SUPPORT_EMAIL = "farreachco@gmail.com";
const DEFAULT_AFFILIATE_COMMISSION_ALERT_EMAIL = "farreachco@gmail.com";

function getAffiliateCommissionAlertEmails(): string[] {
  const raw =
    process.env.AFFILIATE_COMMISSION_ALERT_EMAIL ||
    process.env.AFFILIATE_COMMISSION_ALERT_EMAILS ||
    DEFAULT_AFFILIATE_COMMISSION_ALERT_EMAIL;

  const emails = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => Boolean(email) && email.includes("@"));

  return [...new Set(emails)];
}

function formatUtcDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toISOString().replace("T", " ").replace("Z", " UTC")}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shouldReceiveNotification(
  user: User,
  preferenceKey: NotificationPreferenceKey,
): boolean {
  if (!user.email) return false;
  if (user.email_unsubscribed_all) return false;
  return Boolean(user[preferenceKey]);
}

function buildNotificationFooter(userId: string | number): string {
  const { managePreferencesUrl, unsubscribeUrl } = getEmailPreferenceLinks(userId);

  return /*html*/ `
    <p>
      Manage your email settings:
      <a href="${managePreferencesUrl}">Preferences</a><br />
      Unsubscribe from non-essential emails:
      <a href="${unsubscribeUrl}">Unsubscribe</a><br />
      Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </p>
  `;
}

async function sendNotificationEmail(params: {
  recipient: User;
  subject: string;
  message: string;
}) {
  const { recipient, subject, message } = params;
  const { unsubscribeUrl } = getEmailPreferenceLinks(recipient.id);

  await mail.sendMessage({
    user: recipient,
    title: subject,
    message,
    footerHtml: buildNotificationFooter(recipient.id),
    headers: {
      "List-Unsubscribe":
        `<mailto:${SUPPORT_EMAIL}?subject=unsubscribe>, <${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

async function getUsersByIds(ids: number[]): Promise<User[]> {
  if (!ids.length) return [];
  const usersData = await getUsersByIdsQuery(ids);
  return usersData.rows;
}

async function notifyWyrldJoin(params: {
  projectId: string | number;
  joiningUserId: string | number;
}) {
  const { projectId, joiningUserId } = params;
  const joiningUserIdNum = Number(joiningUserId);

  const [projectData, projectUsersData] = await Promise.all([
    getProjectQuery(projectId),
    getProjectUsersByProjectQuery(projectId),
  ]);
  const project = projectData.rows[0];
  if (!project) return;

  const recipientIds = new Set<number>([Number(project.user_id)]);
  for (const projectUser of projectUsersData.rows) {
    if (projectUser.is_editor) {
      recipientIds.add(Number(projectUser.user_id));
    }
  }
  recipientIds.delete(joiningUserIdNum);

  const allUserIds = new Set<number>([...recipientIds, joiningUserIdNum]);
  const users = await getUsersByIds([...allUserIds]);
  if (!users.length) return;

  const usersById = new Map<number, User>(
    users.map((user) => [Number(user.id), user]),
  );
  const joiningUser = usersById.get(joiningUserIdNum);
  const joiningUsername = joiningUser?.username || "A user";
  const projectTitle = project.title || `Wyrld #${project.id}`;
  const wyrldUrl = `${getPublicAppUrl()}/wyrld?id=${project.id}`;

  const recipients = [...recipientIds]
    .map((id) => usersById.get(id))
    .filter((user): user is User => Boolean(user))
    .filter((user) => shouldReceiveNotification(user, "notify_wyrld_join"));

  if (!recipients.length) return;

  await Promise.all(
    recipients.map((recipient) =>
      sendNotificationEmail({
        recipient,
        subject: `${joiningUsername} joined ${projectTitle}`,
        message: /*html*/ `
          <p>
            <strong>${escapeHtml(joiningUsername)}</strong> just joined
            <strong>${escapeHtml(projectTitle)}</strong>.
          </p>
          <p><a href="${wyrldUrl}">Open this Wyrld</a></p>
        `,
      }),
    ),
  );
}

async function notifySheetLinked(params: {
  actorUserId: string | number;
  projectId: string | number;
  playerId: string | number;
}) {
  const { actorUserId, projectId, playerId } = params;
  const actorUserIdNum = Number(actorUserId);

  const [projectData, projectUsersData, sheetData] = await Promise.all([
    getProjectQuery(projectId),
    getProjectUsersByProjectQuery(projectId),
    get5eCharGeneralQuery(playerId),
  ]);
  const project = projectData.rows[0];
  const sheet = sheetData.rows[0];
  if (!project || !sheet) return;

  const recipientIds = new Set<number>([Number(project.user_id), Number(sheet.user_id)]);
  for (const projectUser of projectUsersData.rows) {
    if (projectUser.is_editor) {
      recipientIds.add(Number(projectUser.user_id));
    }
  }
  recipientIds.delete(actorUserIdNum);

  const allUserIds = new Set<number>([
    ...recipientIds,
    actorUserIdNum,
    Number(sheet.user_id),
  ]);
  const users = await getUsersByIds([...allUserIds]);
  if (!users.length) return;

  const usersById = new Map<number, User>(
    users.map((user) => [Number(user.id), user]),
  );
  const actorUser = usersById.get(actorUserIdNum);
  const actorUsername = actorUser?.username || "A user";
  const sheetOwner = usersById.get(Number(sheet.user_id));
  const sheetOwnerUsername = sheetOwner?.username || "Unknown user";
  const sheetName = sheet.name || `Sheet #${sheet.id}`;
  const projectTitle = project.title || `Wyrld #${project.id}`;
  const wyrldUrl = `${getPublicAppUrl()}/wyrld?id=${project.id}`;

  const recipients = [...recipientIds]
    .map((id) => usersById.get(id))
    .filter((user): user is User => Boolean(user))
    .filter((user) => shouldReceiveNotification(user, "notify_sheet_link"));

  if (!recipients.length) return;

  await Promise.all(
    recipients.map((recipient) =>
      sendNotificationEmail({
        recipient,
        subject: `Character linked in ${projectTitle}`,
        message: /*html*/ `
          <p>
            <strong>${escapeHtml(actorUsername)}</strong> linked
            <strong>${escapeHtml(sheetName)}</strong> in
            <strong>${escapeHtml(projectTitle)}</strong>.
          </p>
          <p>Sheet owner: <strong>${escapeHtml(sheetOwnerUsername)}</strong></p>
          <p><a href="${wyrldUrl}">Open this Wyrld</a></p>
        `,
      }),
    ),
  );
}

export function notifyWyrldJoinAsync(params: {
  projectId: string | number;
  joiningUserId: string | number;
}): void {
  notifyWyrldJoin(params).catch((err) => {
    logger.error({ err, params }, "Failed to send wyrld join email notifications");
  });
}

export function notifySheetLinkedAsync(params: {
  actorUserId: string | number;
  projectId: string | number;
  playerId: string | number;
}): void {
  notifySheetLinked(params).catch((err) => {
    logger.error({ err, params }, "Failed to send sheet linked email notifications");
  });
}

async function notifyProjectJoinRequestCreated(params: {
  projectId: string | number;
  requesterUserId: string | number;
  joinRequestId: string | number;
  message?: string | null;
}) {
  const { projectId, requesterUserId, joinRequestId, message } = params;
  const requesterUserIdNum = Number(requesterUserId);

  const [projectData, users] = await Promise.all([
    getProjectQuery(projectId),
    getUsersByIds([requesterUserIdNum]),
  ]);
  const project = projectData.rows[0];
  if (!project) return;

  const ownerData = await getUsersByIds([Number(project.user_id)]);
  const owner = ownerData[0];
  if (!owner || !shouldReceiveNotification(owner, "notify_wyrld_join")) return;

  const requester = users[0];
  const requesterUsername = requester?.username || "A user";
  const projectTitle = project.title || `Wyrld #${project.id}`;
  const settingsUrl = `${getPublicAppUrl()}/wyrld/settings?id=${project.id}`;
  const safeMessage = String(message || "").trim();

  await sendNotificationEmail({
    recipient: owner,
    subject: `New join request for ${projectTitle}`,
    message: /*html*/ `
      <p>
        <strong>${escapeHtml(requesterUsername)}</strong> requested to join
        <strong>${escapeHtml(projectTitle)}</strong>.
      </p>
      ${
        safeMessage
          ? `<p>Message: <em>${escapeHtml(safeMessage)}</em></p>`
          : "<p>No message was included.</p>"
      }
      <p>Request ID: <strong>${escapeHtml(String(joinRequestId))}</strong></p>
      <p><a href="${settingsUrl}">Review join requests</a></p>
    `,
  });
}

async function notifyProjectJoinRequestReviewed(params: {
  projectId: string | number;
  requesterUserId: string | number;
  reviewerUserId: string | number;
  status: "approved" | "rejected";
}) {
  const { projectId, requesterUserId, reviewerUserId, status } = params;
  const requesterUserIdNum = Number(requesterUserId);
  const reviewerUserIdNum = Number(reviewerUserId);

  const [projectData, users] = await Promise.all([
    getProjectQuery(projectId),
    getUsersByIds([requesterUserIdNum, reviewerUserIdNum]),
  ]);
  const project = projectData.rows[0];
  if (!project) return;

  const usersById = new Map<number, User>(
    users.map((user) => [Number(user.id), user]),
  );
  const requester = usersById.get(requesterUserIdNum);
  if (!requester || !shouldReceiveNotification(requester, "notify_wyrld_join")) return;

  const reviewer = usersById.get(reviewerUserIdNum);
  const reviewerUsername = reviewer?.username || "A manager";
  const projectTitle = project.title || `Wyrld #${project.id}`;
  const wyrldUrl = `${getPublicAppUrl()}/wyrld?id=${project.id}`;
  const wasApproved = status === "approved";

  await sendNotificationEmail({
    recipient: requester,
    subject: wasApproved
      ? `Join request approved for ${projectTitle}`
      : `Join request update for ${projectTitle}`,
    message: /*html*/ `
      <p>
        Your request to join <strong>${escapeHtml(projectTitle)}</strong> was
        <strong>${wasApproved ? "approved" : "rejected"}</strong> by
        <strong>${escapeHtml(reviewerUsername)}</strong>.
      </p>
      ${
        wasApproved
          ? `<p><a href="${wyrldUrl}">Open this Wyrld</a></p>`
          : ""
      }
    `,
  });
}

async function notifyProjectJoinRequestExpired(params: {
  projectId: string | number;
  requesterUserId: string | number;
}) {
  const { projectId, requesterUserId } = params;
  const requesterUserIdNum = Number(requesterUserId);

  const [projectData, users] = await Promise.all([
    getProjectQuery(projectId),
    getUsersByIds([requesterUserIdNum]),
  ]);
  const project = projectData.rows[0];
  if (!project) return;

  const requester = users[0];
  if (!requester || !shouldReceiveNotification(requester, "notify_wyrld_join")) return;

  const projectTitle = project.title || `Wyrld #${project.id}`;
  const directoryUrl = `${getPublicAppUrl()}/wyrlds/public`;

  await sendNotificationEmail({
    recipient: requester,
    subject: `Join request expired for ${projectTitle}`,
    message: /*html*/ `
      <p>
        Your request to join <strong>${escapeHtml(projectTitle)}</strong> was
        marked as <strong>rejected</strong> due to no response.
      </p>
      <p>You can browse other campaigns or submit a new request later.</p>
      <p><a href="${directoryUrl}">Browse Public Wyrlds</a></p>
    `,
  });
}

async function notifyProjectUserRemoved(params: {
  projectId: string | number;
  removedUserId: string | number;
  removedByUserId?: string | number | null;
}) {
  const { projectId, removedUserId, removedByUserId } = params;
  const removedUserIdNum = Number(removedUserId);
  const actorUserIdNum =
    removedByUserId === undefined || removedByUserId === null
      ? null
      : Number(removedByUserId);

  const userIds = [removedUserIdNum];
  if (actorUserIdNum !== null) userIds.push(actorUserIdNum);

  const [projectData, users] = await Promise.all([
    getProjectQuery(projectId),
    getUsersByIds(userIds),
  ]);
  const project = projectData.rows[0];
  if (!project) return;

  const usersById = new Map<number, User>(
    users.map((user) => [Number(user.id), user]),
  );
  const removedUser = usersById.get(removedUserIdNum);
  if (!removedUser || !shouldReceiveNotification(removedUser, "notify_wyrld_join")) {
    return;
  }

  const actorUser =
    actorUserIdNum === null ? null : usersById.get(actorUserIdNum) || null;
  const actorUsername = actorUser?.username || "A wyrld manager";
  const projectTitle = project.title || `Wyrld #${project.id}`;
  const dashUrl = `${getPublicAppUrl()}/dash/wyrlds`;

  await sendNotificationEmail({
    recipient: removedUser,
    subject: `Removed from ${projectTitle}`,
    message: /*html*/ `
      <p>
        You were removed from <strong>${escapeHtml(projectTitle)}</strong> by
        <strong>${escapeHtml(actorUsername)}</strong>.
      </p>
      <p><a href="${dashUrl}">Open your Wyrlds dashboard</a></p>
    `,
  });
}

async function notifyAffiliateCommissionCreated(params: {
  commissionId: number;
  affiliateCode: string;
  collaboratorName: string;
  amountCents: number;
  scope: BillingScope;
  userId: number;
  projectId: number | null;
  stripeSubscriptionId: string;
  stripeInvoiceId: string | null;
  createdAt: string;
}) {
  const alertEmails = getAffiliateCommissionAlertEmails();
  if (!alertEmails.length) return;

  const [buyerData, projectData] = await Promise.all([
    getUsersByIds([params.userId]),
    params.projectId ? getProjectQuery(params.projectId) : Promise.resolve({ rows: [] }),
  ]);
  const buyer = buyerData[0] || null;
  const project = projectData.rows[0] || null;

  const amountUsd = (params.amountCents / 100).toFixed(2);
  const planType = params.scope === "project" ? "Pro Wyrld signup" : "Pro User signup";
  const projectLabel =
    params.scope === "project"
      ? project?.title || `Wyrld #${params.projectId || "unknown"}`
      : "N/A";
  const adminUrl = `${getPublicAppUrl()}/admin/affiliates`;

  const message = /*html*/ `
    <p>A new affiliate commission was created.</p>
    <p>
      <strong>Commission ID:</strong> ${params.commissionId}<br />
      <strong>Status:</strong> pending<br />
      <strong>Amount:</strong> $${amountUsd}<br />
      <strong>Type:</strong> ${escapeHtml(planType)}<br />
      <strong>Created:</strong> ${escapeHtml(formatUtcDate(params.createdAt))}
    </p>
    <p>
      <strong>Affiliate Code:</strong> ${escapeHtml(params.affiliateCode)}<br />
      <strong>Collaborator:</strong> ${escapeHtml(params.collaboratorName)}
    </p>
    <p>
      <strong>Buyer:</strong> ${escapeHtml(
        buyer?.username || `User #${params.userId}`,
      )}<br />
      <strong>Buyer ID:</strong> ${params.userId}<br />
      <strong>Wyrld:</strong> ${escapeHtml(projectLabel)}
    </p>
    <p>
      <strong>Stripe Subscription:</strong> ${escapeHtml(params.stripeSubscriptionId)}<br />
      <strong>Stripe Invoice:</strong> ${escapeHtml(params.stripeInvoiceId || "N/A")}
    </p>
    <p><a href="${adminUrl}">Open Affiliate Admin</a></p>
  `;

  await Promise.all(
    alertEmails.map((email) =>
      mail.sendMessage({
        user: { email },
        title: `[Affiliate] New commission #${params.commissionId} ($${amountUsd})`,
        message,
      }),
    ),
  );
}

export function notifyProjectJoinRequestCreatedAsync(params: {
  projectId: string | number;
  requesterUserId: string | number;
  joinRequestId: string | number;
  message?: string | null;
}): void {
  notifyProjectJoinRequestCreated(params).catch((err) => {
    logger.error(
      { err, params },
      "Failed to send project join request created email notification",
    );
  });
}

export function notifyProjectJoinRequestReviewedAsync(params: {
  projectId: string | number;
  requesterUserId: string | number;
  reviewerUserId: string | number;
  status: "approved" | "rejected";
}): void {
  notifyProjectJoinRequestReviewed(params).catch((err) => {
    logger.error(
      { err, params },
      "Failed to send project join request reviewed email notification",
    );
  });
}

export function notifyProjectJoinRequestExpiredAsync(params: {
  projectId: string | number;
  requesterUserId: string | number;
}): void {
  notifyProjectJoinRequestExpired(params).catch((err) => {
    logger.error(
      { err, params },
      "Failed to send project join request expiration email notification",
    );
  });
}

export function notifyProjectUserRemovedAsync(params: {
  projectId: string | number;
  removedUserId: string | number;
  removedByUserId?: string | number | null;
}): void {
  notifyProjectUserRemoved(params).catch((err) => {
    logger.error({ err, params }, "Failed to send project user removed email notification");
  });
}

export function notifyAffiliateCommissionCreatedAsync(params: {
  commissionId: number;
  affiliateCode: string;
  collaboratorName: string;
  amountCents: number;
  scope: BillingScope;
  userId: number;
  projectId: number | null;
  stripeSubscriptionId: string;
  stripeInvoiceId: string | null;
  createdAt: string;
}): void {
  notifyAffiliateCommissionCreated(params).catch((err) => {
    logger.error(
      { err, params },
      "Failed to send affiliate commission created email notification",
    );
  });
}
