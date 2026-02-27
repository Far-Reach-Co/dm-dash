import {
  addNotificationQuery,
  addNotificationsQuery,
  getNotificationsByUserQuery,
  getUnreadNotificationCountByUserQuery,
  markAllNotificationsReadByUserQuery,
  markNotificationReadByIdAndUserQuery,
  Notification,
} from "../api/queries/notifications";
import { getProjectQuery } from "../api/queries/projects";
import { getProjectUsersByProjectQuery } from "../api/queries/projectUsers";
import { getUsersByIdsQuery } from "../api/queries/users";
import { getProjectDiscussionThreadQuery } from "../api/queries/projectDiscussion";
import { extractMentionUsernames } from "./discussionMentions";
import { getProjectMemberCount } from "../api/controllers/publicWyrldsShared";
import logger from "./logger";

const TITLE_MAX = 180;
const BODY_MAX = 600;

function trimToMax(value: string, max: number) {
  const normalized = String(value || "").trim();
  if (normalized.length <= max) return normalized;
  return normalized.slice(0, max - 1).trimEnd() + "…";
}

function cleanLink(link: string | null | undefined): string | null {
  if (!link) return null;
  const normalized = String(link).trim();
  if (!normalized) return null;
  return normalized.slice(0, 600);
}

export async function notifyUser(params: {
  userId: number | string;
  type: string;
  title: string;
  body?: string;
  link?: string | null;
  data?: Record<string, unknown>;
}) {
  return await addNotificationQuery({
    user_id: params.userId,
    type: trimToMax(params.type, 80),
    title: trimToMax(params.title, TITLE_MAX),
    body: trimToMax(params.body || "", BODY_MAX),
    link: cleanLink(params.link),
    data_json: params.data || {},
  });
}

export async function notifyUsers(params: {
  userIds: Array<number | string>;
  type: string;
  title: string;
  body?: string;
  link?: string | null;
  data?: Record<string, unknown>;
  excludeUserIds?: Array<number | string>;
}) {
  const excluded = new Set(
    (params.excludeUserIds || []).map((id) => String(id)),
  );
  const uniqueUserIds = [...new Set(params.userIds.map((id) => String(id)))]
    .filter((id) => !excluded.has(id));
  if (!uniqueUserIds.length) return { rows: [] as Notification[] };
  return await addNotificationsQuery(
    uniqueUserIds.map((userId) => ({
      user_id: Number(userId),
      type: trimToMax(params.type, 80),
      title: trimToMax(params.title, TITLE_MAX),
      body: trimToMax(params.body || "", BODY_MAX),
      link: cleanLink(params.link),
      data_json: params.data || {},
    })),
  );
}

export async function listNotifications(params: {
  userId: number | string;
  limit?: number;
  offset?: number;
}) {
  return await getNotificationsByUserQuery({
    userId: params.userId,
    limit: params.limit,
    offset: params.offset,
  });
}

export async function getUnreadNotificationCount(userId: number | string) {
  const countData = await getUnreadNotificationCountByUserQuery(userId);
  return Number(countData.rows[0]?.count || 0);
}

export async function markNotificationRead(params: {
  id: number | string;
  userId: number | string;
}) {
  return await markNotificationReadByIdAndUserQuery(params.id, params.userId);
}

export async function markAllNotificationsRead(userId: number | string) {
  return await markAllNotificationsReadByUserQuery(userId);
}

export async function notifyProjectOwner(params: {
  projectId: number | string;
  type: string;
  title: string;
  body?: string;
  link?: string | null;
  data?: Record<string, unknown>;
  excludeUserIds?: Array<number | string>;
}) {
  const projectData = await getProjectQuery(params.projectId);
  const project = projectData.rows[0];
  if (!project) return { rows: [] as Notification[] };
  return await notifyUsers({
    userIds: [project.user_id],
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link,
    data: params.data,
    excludeUserIds: params.excludeUserIds,
  });
}

export async function notifyProjectEditors(params: {
  projectId: number | string;
  type: string;
  title: string;
  body?: string;
  link?: string | null;
  data?: Record<string, unknown>;
  includeOwner?: boolean;
  excludeUserIds?: Array<number | string>;
}) {
  const projectData = await getProjectQuery(params.projectId);
  const project = projectData.rows[0];
  if (!project) return { rows: [] as Notification[] };
  const projectUsersData = await getProjectUsersByProjectQuery(project.id);
  const editorIds = projectUsersData.rows
    .filter((row) => Boolean(row.is_editor))
    .map((row) => Number(row.user_id));
  if (params.includeOwner !== false) editorIds.push(Number(project.user_id));
  return await notifyUsers({
    userIds: editorIds,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link,
    data: params.data,
    excludeUserIds: params.excludeUserIds,
  });
}

export async function notifyMentionsInProjectDiscussion(params: {
  actorUserId: number | string;
  projectId: number | string;
  threadId: number | string;
  content: string;
  notificationType: string;
  title: string;
  body?: string;
  excludeUserIds?: Array<number | string>;
}) {
  const mentions = extractMentionUsernames(params.content);
  if (!mentions.length) return { rows: [] as Notification[] };

  const projectData = await getProjectQuery(params.projectId);
  const project = projectData.rows[0];
  if (!project) return { rows: [] as Notification[] };

  const projectUsersData = await getProjectUsersByProjectQuery(project.id);
  const memberIds = [
    Number(project.user_id),
    ...projectUsersData.rows.map((row) => Number(row.user_id)),
  ];
  const usersData = await getUsersByIdsQuery([...new Set(memberIds)]);
  const usernameToUserId = new Map<string, number>();
  for (const user of usersData.rows) {
    usernameToUserId.set(String(user.username || "").toLowerCase(), Number(user.id));
  }

  const mentionedUserIds = mentions
    .map((username) => usernameToUserId.get(username))
    .filter((userId): userId is number => Number.isInteger(userId));

  if (!mentionedUserIds.length) return { rows: [] as Notification[] };

  return await notifyUsers({
    userIds: mentionedUserIds,
    excludeUserIds: [params.actorUserId, ...(params.excludeUserIds || [])],
    type: params.notificationType,
    title: params.title,
    body: params.body,
    link: `/wyrld/community?id=${params.projectId}&thread=${params.threadId}`,
    data: {
      projectId: Number(params.projectId),
      threadId: Number(params.threadId),
      mention: true,
    },
  });
}

export async function notifyThreadCreatorOnReply(params: {
  actorUserId: number | string;
  threadId: number | string;
  body: string;
}) {
  const threadData = await getProjectDiscussionThreadQuery(params.threadId);
  const thread = threadData.rows[0];
  if (!thread) return { rows: [] as Notification[] };
  return await notifyUsers({
    userIds: [thread.creator_user_id],
    excludeUserIds: [params.actorUserId],
    type: "discussion.thread_reply",
    title: `New reply in "${trimToMax(thread.title, 90)}"`,
    body: trimToMax(params.body, BODY_MAX),
    link: `/wyrld/community?id=${thread.project_id}&thread=${thread.id}`,
    data: {
      projectId: Number(thread.project_id),
      threadId: Number(thread.id),
      threadCreatorId: Number(thread.creator_user_id),
    },
  });
}

export async function notifyCapacityStateForOwner(params: {
  projectId: number | string;
  trigger: "member_joined" | "member_left";
}) {
  const projectData = await getProjectQuery(params.projectId);
  const project = projectData.rows[0];
  if (!project) return;
  if (!project.is_public_listed) return;
  if (project.public_join_mode !== "request") return;
  const capacity = Number(project.public_join_capacity || 0);
  if (!capacity || capacity <= 0) return;

  const memberCount = await getProjectMemberCount(project.id);
  const spotsRemaining = Math.max(capacity - memberCount, 0);
  if (params.trigger === "member_joined" && memberCount === capacity) {
    await notifyProjectOwner({
      projectId: project.id,
      type: "project.capacity_reached",
      title: `Capacity reached for ${trimToMax(project.title || "your wyrld", 90)}`,
      body: `Your public request queue is effectively closed (${memberCount}/${capacity}).`,
      link: `/wyrld/settings?id=${project.id}`,
      data: { projectId: Number(project.id), memberCount, capacity },
    });
  }
  if (params.trigger === "member_left" && memberCount === capacity - 1) {
    await notifyProjectOwner({
      projectId: project.id,
      type: "project.slot_opened",
      title: `A player slot opened in ${trimToMax(project.title || "your wyrld", 90)}`,
      body: `${spotsRemaining} slot available (${memberCount}/${capacity}).`,
      link: `/wyrld/settings?id=${project.id}`,
      data: { projectId: Number(project.id), memberCount, capacity, spotsRemaining },
    });
  }
}

export function notifySilently(
  task: Promise<unknown>,
  label: string,
  context?: Record<string, unknown>,
) {
  task.catch((err) => {
    logger.error({ err, ...(context || {}) }, label);
  });
}
