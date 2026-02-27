import { Request } from "express";
import { expirePendingProjectJoinRequestsForProWyrldsQuery } from "../api/queries/projectJoinRequests";
import { EventType, logEventAsync } from "./eventLogger";
import logger from "./logger";
import { notifyProjectJoinRequestExpiredAsync } from "./emailNotifications";

export const PRO_JOIN_REQUEST_EXPIRATION_DAYS = 7;

export async function expireStaleProJoinRequests(params?: {
  req?: Request;
  projectId?: number | string | null;
  requesterUserId?: number | string | null;
  requestId?: number | string | null;
}) {
  const data = await expirePendingProjectJoinRequestsForProWyrldsQuery({
    projectId: params?.projectId,
    requesterUserId: params?.requesterUserId,
    requestId: params?.requestId,
  });
  if (!data.rows.length) return 0;

  for (const request of data.rows) {
    logEventAsync({
      projectId: request.project_id,
      eventType: EventType.PROJECT_JOIN_REQUEST_REJECTED,
      eventData: {
        requestId: request.id,
        requesterUserId: request.requester_user_id,
        joined: false,
        outcome: "success",
        reason: "auto_expired_timeout_7d",
        autoExpired: true,
        expirationDays: PRO_JOIN_REQUEST_EXPIRATION_DAYS,
      },
      req: params?.req,
    });
    notifyProjectJoinRequestExpiredAsync({
      projectId: request.project_id,
      requesterUserId: request.requester_user_id,
    });
  }

  logger.info(
    {
      requestId: params?.req?.id || null,
      projectId: params?.projectId || null,
      requesterUserId: params?.requesterUserId || null,
      requestIdFilter: params?.requestId || null,
      expiredCount: data.rows.length,
    },
    "Expired stale pending project join requests for Pro wyrlds",
  );

  return data.rows.length;
}
