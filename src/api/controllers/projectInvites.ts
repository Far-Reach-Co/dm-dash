import {
  addProjectInviteQuery,
  getProjectInviteQuery,
  getProjectInviteByUUIDQuery,
  removeProjectInviteQuery,
} from "../queries/projectInvites.js";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { requireProjectEditorAccess } from "./accessControl";

async function addProjectInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uuid = uuidv4();
  req.body.uuid = uuid;

  try {
    if (!req.body.project_id) throw { status: 400, message: "project_id is required" };
    await requireProjectEditorAccess(req, req.body.project_id);
    const data = await addProjectInviteQuery(req.body);
    const invite = data.rows[0];
    const inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${
      invite.uuid
    }`;
    const inviteId = invite.id;

    if (req.body.source === "settings") {
      res.status(201).json({ inviteLink, inviteId });
      return;
    }

    // Render different partial based on source
    const partial = req.body.source === "wyrld"
      ? "partials/wyrld_invite_display"
      : "partials/wyrld_settings/invite";

    res.render(partial, {
      inviteLink,
      inviteId,
      projectId: req.body.project_id,
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
    await requireProjectEditorAccess(req, invite.project_id);
    const data = await removeProjectInviteQuery(req.params.id);

    if (req.body.source === "settings") {
      res.status(200).json({ success: true });
      return;
    }

    // Render different partial based on source
    const partial = req.body.source === "wyrld"
      ? "partials/wyrld_invite_button"
      : "partials/wyrld_settings/invitebutton";

    res.render(partial, {
      projectId: data.rows[0].project_id,
    });
  } catch (err) {
    next(err);
  }
}

export { getProjectInviteByUUID, addProjectInvite, removeProjectInvite };
