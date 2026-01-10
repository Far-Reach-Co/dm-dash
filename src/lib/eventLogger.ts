import db from "../api/dbconfig";
import { Request } from "express";

export enum EventType {
  // User events
  USER_REGISTERED = "user.registered",
  USER_LOGIN = "user.login",

  // Project events
  PROJECT_CREATED = "project.created",
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

    await db.query({
      text: `
        INSERT INTO "LogEvent" (user_id, project_id, event_type, event_data, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [
        userId || null,
        projectId || null,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
        ipAddress,
        userAgent,
      ],
    });
  } catch (error) {
    // Don't throw errors for event logging - we don't want analytics to break the app
    console.error("Failed to log event:", error);
  }
}

/**
 * Helper to log events without blocking the response
 * Fire-and-forget style for non-critical event logging
 */
export function logEventAsync(params: LogEventParams): void {
  logEvent(params).catch((error) => {
    console.error("Async event logging failed:", error);
  });
}
