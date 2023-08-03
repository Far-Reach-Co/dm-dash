import {
  addProjectInviteQuery,
  getProjectInviteQuery,
  getProjectInviteByUUIDQuery,
  removeProjectInviteQuery,
} from "../queries/projectInvites.js";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

async function addProjectInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uuid = uuidv4();
  req.body.uuid = uuid;

  try {
    const data = await addProjectInviteQuery(req.body);
    const invite = data.rows[0];
    const inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${
      invite.uuid
    }`;
    const inviteId = invite.id;
    res.render("partials/wyrld_settings/invite", {
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
    const data = await removeProjectInviteQuery(req.params.id);
    res.render("partials/wyrld_settings/invitebutton", {
      projectId: data.rows[0].project_id,
    });
  } catch (err) {
    next(err);
  }
}

export { getProjectInviteByUUID, addProjectInvite, removeProjectInvite };
