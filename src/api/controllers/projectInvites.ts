import {
  addProjectInviteQuery,
  getProjectInviteQuery,
  getProjectInviteByProjectQuery,
  getProjectInviteByUUIDQuery,
  removeProjectInviteQuery,
} from "../queries/projectInvites.js";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { requireProjectEditorAccess } from "./accessControl";
import { EventType, logEventAsync } from "../../lib/eventLogger";

function resolveProjectInvitePartial(source: unknown) {
  return source === "wyrld"
    ? "partials/wyrld_invite_display"
    : "partials/wyrld_settings/invite";
}

function sendProjectInviteResponse(
  req: Request,
  res: Response,
  params: { inviteId: number; inviteUuid: string; projectId: number | string; status: number },
) {
  const inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${params.inviteUuid}`;
  const payload = {
    inviteLink,
    inviteId: params.inviteId,
    projectId: params.projectId,
  };

  if (req.body.source === "settings") {
    res.status(params.status).json({ inviteLink: payload.inviteLink, inviteId: payload.inviteId });
    return;
  }

  res.status(params.status).render(resolveProjectInvitePartial(req.body.source), payload);
}

async function addProjectInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uuid = uuidv4();
  req.body.uuid = uuid;

  try {
    if (!req.body.project_id) throw { status: 400, message: "project_id is required" };
    const editorRole = await requireProjectEditorAccess(req, req.body.project_id);
    const existingInviteData = await getProjectInviteByProjectQuery(req.body.project_id);
    const existingInvite = existingInviteData.rows[0];
    if (existingInvite) {
      sendProjectInviteResponse(req, res, {
        inviteId: existingInvite.id,
        inviteUuid: existingInvite.uuid,
        projectId: existingInvite.project_id,
        status: 200,
      });
      return;
    }

    let invite:
      | Awaited<ReturnType<typeof addProjectInviteQuery>>["rows"][number]
      | undefined;
    try {
      const data = await addProjectInviteQuery(req.body);
      invite = data.rows[0];
    } catch (err: any) {
      if (err?.code === "23505") {
        const retryExistingData = await getProjectInviteByProjectQuery(req.body.project_id);
        const retryExisting = retryExistingData.rows[0];
        if (retryExisting) {
          sendProjectInviteResponse(req, res, {
            inviteId: retryExisting.id,
            inviteUuid: retryExisting.uuid,
            projectId: retryExisting.project_id,
            status: 200,
          });
          return;
        }
      }
      throw err;
    }
    if (!invite) throw { status: 500, message: "Failed to create project invite" };

    logEventAsync({
      userId: editorRole.userId,
      projectId: invite.project_id,
      eventType: EventType.PROJECT_INVITE_CREATED,
      eventData: {
        inviteId: invite.id,
        inviteUuid: invite.uuid,
        source: req.body.source || null,
        outcome: "success",
        reason: null,
      },
      req,
    });
    sendProjectInviteResponse(req, res, {
      inviteId: invite.id,
      inviteUuid: invite.uuid,
      projectId: invite.project_id,
      status: 201,
    });
  } catch (err) {
    next(err);
  }
}

async function getProjectInviteByUUID(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getProjectInviteByUUIDQuery(req.params.uuid);
    res.send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeProjectInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const inviteData = await getProjectInviteQuery(req.params.id);
    const invite = inviteData.rows[0];
    if (!invite) throw { status: 404, message: "Invite not found" };
    const editorRole = await requireProjectEditorAccess(req, invite.project_id);
    const data = await removeProjectInviteQuery(req.params.id);
    const removedInvite = data.rows[0];
    logEventAsync({
      userId: editorRole.userId,
      projectId: removedInvite.project_id,
      eventType: EventType.PROJECT_INVITE_REVOKED,
      eventData: {
        inviteId: removedInvite.id,
        inviteUuid: removedInvite.uuid,
        source: req.body.source || null,
        outcome: "success",
        reason: null,
      },
      req,
    });

    if (req.body.source === "settings") {
      res.status(200).json({ success: true });
      return;
    }

    // Render different partial based on source
    const partial = req.body.source === "wyrld"
      ? "partials/wyrld_invite_button"
      : "partials/wyrld_settings/invitebutton";

    res.render(partial, {
      projectId: removedInvite.project_id,
    });
  } catch (err) {
    next(err);
  }
}

export { getProjectInviteByUUID, addProjectInvite, removeProjectInvite };
