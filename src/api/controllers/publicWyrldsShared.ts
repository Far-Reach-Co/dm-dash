import { Request } from "express";
import { getProjectUsersByProjectQuery } from "../queries/projectUsers.js";
import { EventType, logEventAsync } from "../../lib/eventLogger";
import logger from "../../lib/logger.js";

type ProjectPublicJoinMode = "invite_only" | "request";

export const PROJECT_JOIN_REQUEST_COOLDOWN_MS = 60 * 1000;

export function logJoinRequestDenied(params: {
  req: Request;
  reason: string;
  message: string;
  statusCode: number;
  userId?: string | number;
  projectId?: string | number;
}) {
  const { req, reason, message, statusCode, userId, projectId } = params;
  logEventAsync({
    userId,
    projectId,
    eventType: EventType.PROJECT_JOIN_REQUEST_DENIED,
    eventData: {
      outcome: "denied",
      reason,
      statusCode,
      message,
    },
    req,
  });
  logger.warn(
    {
      requestId: req.id,
      userId: userId ?? null,
      projectId: projectId ?? null,
      reason,
      statusCode,
    },
    "Project join request denied",
  );
}

export function parseBooleanLike(
  value: unknown,
  fallback: boolean,
  options?: { strict?: boolean },
) {
  if (typeof value === "undefined") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  if (options?.strict) throw { status: 400, message: "Invalid boolean value" };
  return fallback;
}

export function parseJoinMode(
  value: unknown,
  fallback: ProjectPublicJoinMode,
): ProjectPublicJoinMode {
  if (typeof value === "undefined") return fallback;
  if (value === "invite_only" || value === "request") return value;
  throw {
    status: 400,
    message: "public_join_mode must be 'invite_only' or 'request'",
  };
}

export function parsePositiveIntOrNull(
  value: unknown,
  fallback: number | null,
): number | null {
  if (typeof value === "undefined") return fallback;
  if (value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw { status: 400, message: "public_join_capacity must be a positive integer or null" };
  }
  return parsed;
}

export function parseOptionalPositiveInt(
  value: unknown,
  fallback: number | null,
): number | null {
  if (typeof value === "undefined") return fallback;
  if (value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw { status: 400, message: "featured_record_id must be a positive integer or null" };
  }
  return parsed;
}

export function parseBoundedInt(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

export async function getProjectMemberCount(projectId: number | string) {
  const projectUsersData = await getProjectUsersByProjectQuery(projectId);
  return projectUsersData.rows.length + 1;
}
