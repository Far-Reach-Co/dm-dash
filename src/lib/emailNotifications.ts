import mail from "../api/smtp";
import { get5eCharGeneralQuery } from "../api/queries/5eCharGeneral";
import { getProjectUsersByProjectQuery } from "../api/queries/projectUsers";
import { getProjectQuery } from "../api/queries/projects";
import { getUsersByIdsQuery, User } from "../api/queries/users";
import logger from "./logger";
import { getEmailPreferenceLinks, getPublicAppUrl } from "./emailPreferences";

type NotificationPreferenceKey = "notify_wyrld_join" | "notify_sheet_link";

const SUPPORT_EMAIL = "farreachco@gmail.com";

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
