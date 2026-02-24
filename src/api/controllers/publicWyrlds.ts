import { NextFunction, Request, Response } from "express";
import {
  addProjectUserQuery,
  getProjectUserByUserAndProjectQuery,
  getProjectUsersQuery,
} from "../queries/projectUsers.js";
import { getProjectsQuery, editProjectQuery } from "../queries/projects.js";
import { getRecordQuery } from "../queries/record.js";
import { getPublicWyrldDirectoryQuery } from "../queries/publicWyrlds.js";
import {
  addProjectJoinRequestQuery,
  editProjectJoinRequestQuery,
  getLatestProjectJoinRequestByProjectAndUserQuery,
  getPendingJoinRequestCountByProjectQuery,
  getPendingProjectJoinRequestByProjectAndUserQuery,
  getPendingProjectJoinRequestsByProjectQuery,
  getPendingProjectJoinRequestsByRequesterQuery,
  getProjectJoinRequestQuery,
} from "../queries/projectJoinRequests.js";
import {
  getProjectOrThrow,
  requireApiUser,
  requireProjectOwnerAccess,
} from "./accessControl";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { EventType, logEventAsync } from "../../lib/eventLogger";
import logger from "../../lib/logger.js";
import {
  notifyProjectJoinRequestCreatedAsync,
  notifyProjectJoinRequestReviewedAsync,
} from "../../lib/emailNotifications";
import {
  getProjectMemberCount,
  logJoinRequestDenied,
  parseBooleanLike,
  parseBoundedInt,
  parseJoinMode,
  parseOptionalPositiveInt,
  parsePositiveIntOrNull,
  PROJECT_JOIN_REQUEST_COOLDOWN_MS,
} from "./publicWyrldsShared";

async function getPublicWyrldDirectory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const search =
      typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const limit = parseBoundedInt(req.query.limit, 40, 1, 200);
    const offset = parseBoundedInt(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

    const [rowsData, ownedData, joinedData, pendingData] = await Promise.all([
      getPublicWyrldDirectoryQuery({ search, limit, offset }),
      getProjectsQuery(userId),
      getProjectUsersQuery(userId),
      getPendingProjectJoinRequestsByRequesterQuery(userId),
    ]);

    const ownedProjectIds = new Set(ownedData.rows.map((project) => Number(project.id)));
    const joinedProjectIds = new Set(
      joinedData.rows.map((projectUser) => Number(projectUser.project_id)),
    );
    const pendingProjectIds = new Set(
      pendingData.rows.map((request) => Number(request.project_id)),
    );
    const pendingRequestIdByProjectId = new Map(
      pendingData.rows.map((request) => [
        Number(request.project_id),
        Number(request.id),
      ]),
    );

    const projects = rowsData.rows.map((row) => {
      const projectId = Number(row.id);
      const isOwner = ownedProjectIds.has(projectId);
      const isMember = isOwner || joinedProjectIds.has(projectId);
      const hasPendingRequest = pendingProjectIds.has(projectId);
      const hasCapacityLimit = Number.isFinite(Number(row.public_join_capacity));
      const capacity = hasCapacityLimit ? Number(row.public_join_capacity) : null;
      const spotsRemaining =
        capacity === null ? null : Math.max(capacity - Number(row.member_count), 0);
      const isFull = spotsRemaining !== null && spotsRemaining <= 0;

      return {
        ...row,
        is_member: isMember,
        has_pending_request: hasPendingRequest,
        pending_request_id: pendingRequestIdByProjectId.get(projectId) || null,
        can_request_join:
          !isMember &&
          !hasPendingRequest &&
          row.public_join_mode === "request" &&
          !isFull,
        spots_remaining: spotsRemaining,
      };
    });

    res.status(200).send({ projects, total: projects.length, limit, offset });
  } catch (err) {
    next(err);
  }
}

async function requestProjectJoin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const project = await getProjectOrThrow(req.params.project_id);
    if (String(project.user_id) === String(userId)) {
      logJoinRequestDenied({
        req,
        userId,
        projectId: project.id,
        reason: "already_owner",
        statusCode: 409,
        message: "You already own this wyrld",
      });
      throw { status: 409, message: "You already own this wyrld" };
    }
    if (!project.is_pro || !project.is_public_listed) {
      logJoinRequestDenied({
        req,
        userId,
        projectId: project.id,
        reason: "not_public",
        statusCode: 403,
        message: "This wyrld is not listed publicly",
      });
      throw { status: 403, message: "This wyrld is not listed publicly" };
    }
    if (project.public_join_mode !== "request") {
      logJoinRequestDenied({
        req,
        userId,
        projectId: project.id,
        reason: "invite_only",
        statusCode: 403,
        message: "This wyrld is invite-only",
      });
      throw { status: 403, message: "This wyrld is invite-only" };
    }

    const existingMemberData = await getProjectUserByUserAndProjectQuery(
      userId,
      project.id,
    );
    if (existingMemberData.rows[0]) {
      logJoinRequestDenied({
        req,
        userId,
        projectId: project.id,
        reason: "already_member",
        statusCode: 409,
        message: "You are already a member of this wyrld",
      });
      throw { status: 409, message: "You are already a member of this wyrld" };
    }

    const pendingData = await getPendingProjectJoinRequestByProjectAndUserQuery(
      project.id,
      userId,
    );
    if (pendingData.rows[0]) {
      logJoinRequestDenied({
        req,
        userId,
        projectId: project.id,
        reason: "duplicate_pending",
        statusCode: 200,
        message: "A pending join request already exists",
      });
      res.status(200).send(pendingData.rows[0]);
      return;
    }

    const latestRequestData = await getLatestProjectJoinRequestByProjectAndUserQuery(
      project.id,
      userId,
    );
    const latestRequest = latestRequestData.rows[0];
    if (latestRequest?.created_at) {
      const latestCreatedAtMs = new Date(latestRequest.created_at).getTime();
      if (Number.isFinite(latestCreatedAtMs)) {
        const elapsedMs = Date.now() - latestCreatedAtMs;
        if (elapsedMs < PROJECT_JOIN_REQUEST_COOLDOWN_MS) {
          const waitSeconds = Math.max(
            1,
            Math.ceil((PROJECT_JOIN_REQUEST_COOLDOWN_MS - elapsedMs) / 1000),
          );
          logJoinRequestDenied({
            req,
            userId,
            projectId: project.id,
            reason: "cooldown",
            statusCode: 429,
            message: `Please wait ${waitSeconds}s before sending another join request`,
          });
          throw {
            status: 429,
            message: `Please wait ${waitSeconds}s before sending another join request`,
          };
        }
      }
    }

    if (
      project.public_join_capacity !== null &&
      project.public_join_capacity > 0
    ) {
      const memberCount = await getProjectMemberCount(project.id);
      if (memberCount >= project.public_join_capacity) {
        logJoinRequestDenied({
          req,
          userId,
          projectId: project.id,
          reason: "capacity_full",
          statusCode: 409,
          message: "This wyrld is at capacity",
        });
        throw { status: 409, message: "This wyrld is at capacity" };
      }
    }

    const rawMessage = typeof req.body?.message === "string" ? req.body.message : "";
    const message = rawMessage.trim().slice(0, 800);
    try {
      const data = await addProjectJoinRequestQuery({
        project_id: project.id,
        requester_user_id: userId,
        message,
      });
      const joinRequest = data.rows[0];
      logEventAsync({
        userId,
        projectId: project.id,
        eventType: EventType.PROJECT_JOIN_REQUEST_CREATED,
        eventData: {
          requestId: joinRequest.id,
          messageLength: message.length,
          outcome: "success",
          reason: null,
        },
        req,
      });
      logger.info(
        {
          requestId: req.id,
          userId,
          projectId: project.id,
          joinRequestId: joinRequest.id,
        },
        "Project join request created",
      );
      notifyProjectJoinRequestCreatedAsync({
        projectId: project.id,
        requesterUserId: userId,
        joinRequestId: joinRequest.id,
        message,
      });
      res.status(201).send(data.rows[0]);
    } catch (dbErr) {
      const pgErr = dbErr as { code?: string };
      if (pgErr?.code === "23505") {
        const pendingData = await getPendingProjectJoinRequestByProjectAndUserQuery(
          project.id,
          userId,
        );
        if (pendingData.rows[0]) {
          logJoinRequestDenied({
            req,
            userId,
            projectId: project.id,
            reason: "duplicate_pending",
            statusCode: 200,
            message: "A pending join request already exists",
          });
          res.status(200).send(pendingData.rows[0]);
          return;
        }
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
}

async function cancelProjectJoinRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const joinRequestData = await getProjectJoinRequestQuery(req.params.id);
    const joinRequest = joinRequestData.rows[0];
    if (!joinRequest) {
      logJoinRequestDenied({
        req,
        userId,
        reason: "request_not_found",
        statusCode: 404,
        message: "Join request not found",
      });
      throw { status: 404, message: "Join request not found" };
    }
    if (String(joinRequest.requester_user_id) !== String(userId)) {
      logJoinRequestDenied({
        req,
        userId,
        projectId: joinRequest.project_id,
        reason: "forbidden",
        statusCode: 403,
        message: "Forbidden",
      });
      throw { status: 403, message: "Forbidden" };
    }
    if (joinRequest.status !== "pending") {
      logJoinRequestDenied({
        req,
        userId,
        projectId: joinRequest.project_id,
        reason: "already_resolved",
        statusCode: 409,
        message: "Only pending requests can be cancelled",
      });
      throw { status: 409, message: "Only pending requests can be cancelled" };
    }

    const data = await editProjectJoinRequestQuery(joinRequest.id, {
      status: "cancelled",
      updated_at: new Date().toISOString(),
    });
    logEventAsync({
      userId,
      projectId: joinRequest.project_id,
      eventType: EventType.PROJECT_JOIN_REQUEST_CANCELLED,
      eventData: {
        requestId: joinRequest.id,
        outcome: "success",
        reason: null,
      },
      req,
    });
    logger.info(
      {
        requestId: req.id,
        userId,
        projectId: joinRequest.project_id,
        joinRequestId: joinRequest.id,
      },
      "Project join request cancelled",
    );
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectJoinRequestsByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireProjectOwnerAccess(req, req.params.project_id);
    const [rowsData, countData] = await Promise.all([
      getPendingProjectJoinRequestsByProjectQuery(req.params.project_id),
      getPendingJoinRequestCountByProjectQuery(req.params.project_id),
    ]);
    const count = countData.rows[0]?.count || 0;
    res.status(200).send({ requests: rowsData.rows, pending_count: count });
  } catch (err) {
    next(err);
  }
}

async function respondProjectJoinRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const action = String(req.body?.action || "").trim().toLowerCase();
    if (action !== "approve" && action !== "reject") {
      logJoinRequestDenied({
        req,
        reason: "invalid_action",
        statusCode: 400,
        message: "action must be 'approve' or 'reject'",
      });
      throw { status: 400, message: "action must be 'approve' or 'reject'" };
    }

    const joinRequestData = await getProjectJoinRequestQuery(req.params.id);
    const joinRequest = joinRequestData.rows[0];
    if (!joinRequest) {
      logJoinRequestDenied({
        req,
        reason: "request_not_found",
        statusCode: 404,
        message: "Join request not found",
      });
      throw { status: 404, message: "Join request not found" };
    }
    if (joinRequest.status !== "pending") {
      logJoinRequestDenied({
        req,
        projectId: joinRequest.project_id,
        reason: "already_resolved",
        statusCode: 409,
        message: "Join request is already resolved",
      });
      throw { status: 409, message: "Join request is already resolved" };
    }

    const ownerRole = await requireProjectOwnerAccess(req, joinRequest.project_id);
    let status: "approved" | "rejected" = action === "approve" ? "approved" : "rejected";
    let joined = false;

    if (action === "approve") {
      const existingMemberData = await getProjectUserByUserAndProjectQuery(
        joinRequest.requester_user_id,
        joinRequest.project_id,
      );
      if (!existingMemberData.rows[0]) {
        if (
          ownerRole.project.public_join_capacity !== null &&
          ownerRole.project.public_join_capacity > 0
        ) {
          const memberCount = await getProjectMemberCount(joinRequest.project_id);
          if (memberCount >= ownerRole.project.public_join_capacity) {
            logJoinRequestDenied({
              req,
              userId: ownerRole.userId,
              projectId: joinRequest.project_id,
              reason: "capacity_full",
              statusCode: 409,
              message: "This wyrld is at capacity",
            });
            throw { status: 409, message: "This wyrld is at capacity" };
          }
        }

        await addProjectUserQuery({
          project_id: joinRequest.project_id,
          user_id: joinRequest.requester_user_id,
          is_editor: false,
        });
        logEventAsync({
          userId: ownerRole.userId,
          projectId: joinRequest.project_id,
          eventType: EventType.PROJECT_USER_CREATED,
          eventData: {
            joiningUserId: joinRequest.requester_user_id,
            source: "join_request_approval",
            outcome: "success",
            reason: null,
          },
          req,
        });
      }
      joined = true;
    }

    const updatedData = await editProjectJoinRequestQuery(joinRequest.id, {
      status,
      reviewer_user_id: Number(ownerRole.userId),
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const eventType =
      status === "approved"
        ? EventType.PROJECT_JOIN_REQUEST_APPROVED
        : EventType.PROJECT_JOIN_REQUEST_REJECTED;
    logEventAsync({
      userId: ownerRole.userId,
      projectId: joinRequest.project_id,
      eventType,
      eventData: {
        requestId: joinRequest.id,
        requesterUserId: joinRequest.requester_user_id,
        joined,
        outcome: "success",
        reason: status === "approved" ? null : "owner_rejected",
      },
      req,
    });
    logger.info(
      {
        requestId: req.id,
        userId: ownerRole.userId,
        projectId: joinRequest.project_id,
        joinRequestId: joinRequest.id,
        action: status,
        joined,
      },
      "Project join request reviewed",
    );
    notifyProjectJoinRequestReviewedAsync({
      projectId: joinRequest.project_id,
      requesterUserId: joinRequest.requester_user_id,
      reviewerUserId: ownerRole.userId,
      status,
    });

    res.status(200).send({
      request: updatedData.rows[0],
      joined,
    });
  } catch (err) {
    next(err);
  }
}

async function editProjectPublicSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerRole = await requireProjectOwnerAccess(req, req.params.id);
    const project = ownerRole.project;
    const previousSettings = {
      is_public_listed: Boolean(project.is_public_listed),
      public_join_mode: project.public_join_mode || "invite_only",
      public_join_capacity: project.public_join_capacity,
      featured_record_id: project.featured_record_id,
    };

    const is_public_listed = parseBooleanLike(
      req.body?.is_public_listed,
      Boolean(project.is_public_listed),
      { strict: true },
    );
    const public_join_mode = parseJoinMode(
      req.body?.public_join_mode,
      project.public_join_mode || "invite_only",
    );
    const public_join_capacity = parsePositiveIntOrNull(
      req.body?.public_join_capacity,
      project.public_join_capacity,
    );
    const featured_record_id = parseOptionalPositiveInt(
      req.body?.featured_record_id,
      project.featured_record_id,
    );

    if (!project.is_pro && is_public_listed) {
      throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
    }

    const memberCount = await getProjectMemberCount(project.id);
    if (
      public_join_capacity !== null &&
      public_join_capacity > 0 &&
      memberCount > public_join_capacity
    ) {
      throw {
        status: 400,
        message: "Capacity cannot be lower than the current member count",
      };
    }

    if (featured_record_id !== null) {
      const featuredRecordData = await getRecordQuery(featured_record_id);
      const featuredRecord = featuredRecordData.rows[0];
      if (!featuredRecord) throw { status: 404, message: "Featured record not found" };
      if (String(featuredRecord.project_id) !== String(project.id)) {
        throw { status: 400, message: "Featured record must belong to this wyrld" };
      }
    }

    const data = await editProjectQuery(project.id, {
      is_public_listed,
      public_join_mode,
      public_join_capacity,
      featured_record_id,
    });
    const nextSettings = {
      is_public_listed,
      public_join_mode,
      public_join_capacity,
      featured_record_id,
    };
    const changedFields = Object.keys(nextSettings).filter((field) => {
      const key = field as keyof typeof nextSettings;
      return previousSettings[key] !== nextSettings[key];
    });
    const changes = changedFields.reduce<Record<string, { from: unknown; to: unknown }>>(
      (acc, field) => {
        const key = field as keyof typeof nextSettings;
        acc[field] = {
          from: previousSettings[key],
          to: nextSettings[key],
        };
        return acc;
      },
      {},
    );
    logEventAsync({
      userId: ownerRole.userId,
      projectId: project.id,
      eventType: EventType.PROJECT_PUBLIC_SETTINGS_UPDATED,
      eventData: {
        changedFields,
        changedCount: changedFields.length,
        changes,
        previousSettings,
        nextSettings,
        outcome: "success",
        reason: null,
      },
      req,
    });
    logger.info(
      {
        requestId: req.id,
        userId: ownerRole.userId,
        projectId: project.id,
        changedFields,
      },
      "Project public settings updated",
    );

    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getPublicWyrldDirectory,
  requestProjectJoin,
  cancelProjectJoinRequest,
  getProjectJoinRequestsByProject,
  respondProjectJoinRequest,
  editProjectPublicSettings,
};
