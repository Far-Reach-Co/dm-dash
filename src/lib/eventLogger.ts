import db from "../api/dbconfig";
import { Request } from "express";
import logger from "./logger";

export enum EventType {
  // User events
  USER_REGISTERED = "user.registered",
  USER_LOGIN = "user.login",

  // Project events
  PROJECT_CREATED = "project.created",
  PROJECT_USER_CREATED = "project_user.created",
  PROJECT_PLAYER_CREATED = "project_player.created",

  // Character events
  DND_5E_CHARACTER_CREATED = "dnd_5e_character.created",
  PLAYER_USER_CREATED = "player_user.created",

  // Table/VTT events
  TABLE_CREATED = "table.created",

  // Image/media events
  IMAGE_UPLOADED = "image.uploaded",
  IMAGE_DELETED = "image.deleted",

  // Record events
  RECORD_CREATED = "record.created",

  // Calendar events
  CALENDAR_CREATED = "calendar.created",

  // Public wyrld / join request events
  PROJECT_JOIN_REQUEST_CREATED = "project_join_request.created",
  PROJECT_JOIN_REQUEST_CANCELLED = "project_join_request.cancelled",
  PROJECT_JOIN_REQUEST_APPROVED = "project_join_request.approved",
  PROJECT_JOIN_REQUEST_REJECTED = "project_join_request.rejected",
  PROJECT_JOIN_REQUEST_DENIED = "project_join_request.denied",
  PROJECT_PUBLIC_SETTINGS_UPDATED = "project.public_settings_updated",

  // Guest sandbox events
  GUEST_SANDBOX_STARTED = "guest_sandbox.started",

  // Reporting events
  MONTHLY_LOG_REPORT_EMAIL_SENT = "report.monthly_log_email_sent",
}

export interface EventData {
  [key: string]: any;
}

export interface LogEventParams {
  userId?: string | number;
  projectId?: string | number;
  eventType: EventType | string;
  eventData?: EventData;
  req?: Request;
}

function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function deriveFeatureAndAction(eventType: string) {
  const normalized = readNonEmptyString(eventType) || "event.unknown";
  const [feature, ...rest] = normalized.split(".");
  return {
    feature: feature || "event",
    action: rest.length ? rest.join(".") : "event",
  };
}

function normalizeEventData(params: {
  userId?: string | number;
  projectId?: string | number;
  eventType: EventType | string;
  eventData?: EventData;
  req?: Request;
}): EventData {
  const rawEventData = isRecord(params.eventData) ? { ...params.eventData } : {};
  const { feature, action } = deriveFeatureAndAction(String(params.eventType));
  const requestId =
    params.req?.id !== undefined && params.req?.id !== null
      ? String(params.req.id)
      : null;

  if (!readNonEmptyString(rawEventData.feature)) {
    rawEventData.feature = feature;
  }
  if (!readNonEmptyString(rawEventData.action)) {
    rawEventData.action = action;
  }
  if (!readNonEmptyString(rawEventData.outcome)) {
    rawEventData.outcome = "success";
  }
  if (!("reason" in rawEventData)) {
    rawEventData.reason = null;
  }
  if (!("requestId" in rawEventData)) {
    rawEventData.requestId = requestId;
  }
  if (!("userId" in rawEventData) && params.userId !== undefined) {
    rawEventData.userId = params.userId;
  }
  if (!("projectId" in rawEventData) && params.projectId !== undefined) {
    rawEventData.projectId = params.projectId;
  }

  return rawEventData;
}

/**
 * Logs an event to the LogEvent table
 * @param params Event parameters including user, project, type, and data
 * @returns Promise that resolves when event is logged
 */
export async function logEvent(params: LogEventParams): Promise<void> {
  const { userId, projectId, eventType, eventData, req } = params;

  try {
    // Extract IP and user agent from request if provided
    const ipAddress = req?.ip || req?.socket?.remoteAddress || null;
    const userAgent = req?.get("user-agent") || null;
    const normalizedEventData = normalizeEventData({
      userId,
      projectId,
      eventType,
      eventData,
      req,
    });

    await db.query({
      text: `
        INSERT INTO "LogEvent" (user_id, project_id, event_type, event_data, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [
        userId || null,
        projectId || null,
        eventType,
        JSON.stringify(normalizedEventData),
        ipAddress,
        userAgent,
      ],
    });
  } catch (error) {
    // Don't throw errors for event logging - we don't want analytics to break the app
    logger.error(
      {
        err: error,
        eventType,
        userId: userId || null,
        projectId: projectId || null,
        requestId: req?.id ? String(req.id) : null,
      },
      "Failed to log event",
    );
  }
}

/**
 * Helper to log events without blocking the response
 * Fire-and-forget style for non-critical event logging
 */
export function logEventAsync(params: LogEventParams): void {
  logEvent(params).catch((error) => {
    logger.error(
      {
        err: error,
        eventType: params.eventType,
        userId: params.userId || null,
        projectId: params.projectId || null,
        requestId: params.req?.id ? String(params.req.id) : null,
      },
      "Async event logging failed",
    );
  });
}
