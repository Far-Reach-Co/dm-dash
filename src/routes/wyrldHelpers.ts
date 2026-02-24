import { Request } from "express";

export function toPublicWyrldSlug(rawTitle: unknown) {
  const title = String(rawTitle || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!title) return "wyrld";
  return title.slice(0, 80);
}

export function getPublicWyrldPath(projectId: number | string, title: unknown) {
  const slug = toPublicWyrldSlug(title);
  return `/wyrlds/public/${projectId}/${slug}`;
}

export function getRequestOrigin(req: Request) {
  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

export function normalizeMetaDescription(value: unknown, maxLength: number) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function isMissingProjectJoinRequestTableError(err: unknown) {
  const pgErr = err as { code?: string; message?: string };
  if (pgErr?.code !== "42P01") return false;
  return String(pgErr?.message || "").includes("ProjectJoinRequest");
}

export const sortByDateDesc = <T>(
  items: T[],
  getDate: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTime = getDate(a) ? new Date(getDate(a) as string).getTime() : 0;
    const bTime = getDate(b) ? new Date(getDate(b) as string).getTime() : 0;
    return bTime - aTime;
  });
};

export const sortByTitle = <T>(
  items: T[],
  getTitle: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTitle = (getTitle(a) ?? "").toLowerCase();
    const bTitle = (getTitle(b) ?? "").toLowerCase();
    return aTitle.localeCompare(bTitle);
  });
};

export function buildRecents<T>(
  items: T[],
  viewedIds: number[],
  getId: (item: T) => number,
  getDate: (item: T) => string | undefined,
  limit: number,
): T[] {
  const itemMap = new Map(items.map((item) => [getId(item), item]));
  const recent: T[] = [];
  for (const id of viewedIds) {
    const item = itemMap.get(id);
    if (item) recent.push(item);
  }
  if (recent.length < limit) {
    const recentIds = new Set(recent.map(getId));
    const fallback = sortByDateDesc(items, getDate);
    for (const item of fallback) {
      if (recent.length >= limit) break;
      if (!recentIds.has(getId(item))) recent.push(item);
    }
  }
  return recent;
}

export interface WyrldActivityEvent {
  id: number;
  created_at: string;
  event_type: string;
  actor_username: string;
  summary: string;
  outcome: string;
  reason: string | null;
}

export function toNumericId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function toEventData(value: unknown): Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, any>;
}

export function readEventString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function summarizeWyrldActivityEvent(params: {
  eventType: string;
  actorUsername: string;
  eventData: Record<string, any>;
  usernamesById: Map<number, string>;
  characterNamesById: Map<number, string>;
  recordTitlesById: Map<number, string>;
}): string | null {
  const {
    eventType,
    actorUsername,
    eventData,
    usernamesById,
    characterNamesById,
    recordTitlesById,
  } = params;
  const requesterUserId = toNumericId(eventData.requesterUserId);
  const joiningUserId = toNumericId(eventData.joiningUserId ?? eventData.userId);
  const removedUserId = toNumericId(eventData.removedUserId);
  const targetUserId = toNumericId(eventData.targetUserId);
  const explicitRequesterUsername = readEventString(eventData.requesterUsername);
  const explicitJoiningUsername = readEventString(eventData.joiningUsername);
  const explicitRemovedUsername = readEventString(eventData.removedUsername);
  const explicitTargetUsername = readEventString(eventData.targetUsername);
  const requesterUsername = requesterUserId
    ? usernamesById.get(requesterUserId) || explicitRequesterUsername || "A user"
    : explicitRequesterUsername || "A user";
  const joiningUsername = explicitJoiningUsername ||
    (joiningUserId
      ? usernamesById.get(joiningUserId) || actorUsername
      : actorUsername);
  const removedUsername = explicitRemovedUsername ||
    (removedUserId
      ? usernamesById.get(removedUserId) || actorUsername
      : actorUsername);
  const targetUsername = explicitTargetUsername ||
    (targetUserId ? usernamesById.get(targetUserId) || "A user" : "A user");

  switch (eventType) {
    case "project_join_request.created":
      return `${requesterUsername} requested to join this wyrld.`;
    case "project_join_request.cancelled":
      return `${actorUsername} cancelled their join request.`;
    case "project_join_request.approved":
      return `${actorUsername} approved ${requesterUsername}'s join request.`;
    case "project_join_request.rejected":
      return `${actorUsername} rejected ${requesterUsername}'s join request.`;
    case "project_join_request.denied":
      return `${actorUsername} could not submit a join request (${eventData.reason || "denied"}).`;
    case "project_user.created":
      return `${joiningUsername} joined the wyrld.`;
    case "project_user.removed":
      if (eventData.source === "self_leave") {
        return `${removedUsername} left the wyrld.`;
      }
      return `${removedUsername} was removed from the wyrld by ${actorUsername}.`;
    case "project_user.role_changed": {
      const nextRole = readEventString(eventData.nextRole) || "member";
      return `${actorUsername} changed ${targetUsername}'s role to ${nextRole}.`;
    }
    case "project_invite.created":
      return `${actorUsername} created an invite link.`;
    case "project_invite.revoked":
      return `${actorUsername} revoked an invite link.`;
    case "project_invite.used":
      return `${joiningUsername} joined the wyrld via invite link.`;
    case "project_player.created": {
      const playerId = toNumericId(eventData.playerId);
      const characterName =
        readEventString(eventData.characterName) ||
        (playerId ? characterNamesById.get(playerId) || null : null);
      const characterLabel = characterName ? `"${characterName}"` : null;
      if (!characterLabel) return null;
      return `${actorUsername} connected character ${characterLabel} to the wyrld.`;
    }
    case "project_player.removed": {
      const playerId = toNumericId(eventData.playerId);
      const characterName =
        readEventString(eventData.characterName) ||
        (playerId ? characterNamesById.get(playerId) || null : null);
      const characterLabel = characterName ? `"${characterName}"` : null;
      if (!characterLabel) return null;
      return `${actorUsername} disconnected character ${characterLabel} from the wyrld.`;
    }
    case "table.created": {
      const tableTitle =
        readEventString(eventData.title) ||
        readEventString(eventData.tableTitle) ||
        null;
      if (!tableTitle) return null;
      return `${actorUsername} created table "${tableTitle}".`;
    }
    case "record.created": {
      const recordId = toNumericId(eventData.recordId);
      const recordTitle =
        readEventString(eventData.title) ||
        readEventString(eventData.recordTitle) ||
        (recordId ? recordTitlesById.get(recordId) || null : null);
      if (!recordTitle) return `${actorUsername} created a record.`;
      return `${actorUsername} created record "${recordTitle}".`;
    }
    default:
      return `${actorUsername} triggered ${eventType}.`;
  }
}
