import {
  addPlayerInviteQuery,
  getPlayerInviteQuery,
  getPlayerInviteByPlayerQuery,
  getPlayerInviteByUUIDQuery,
  removePlayerInviteQuery,
} from "../queries/playerInvites.js";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { requireSheetOwnerAccess } from "./accessControl";

async function addPlayerInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uuid = uuidv4();
  req.body.uuid = uuid;

  try {
    await requireSheetOwnerAccess(req, req.body.player_id);
    const existingInviteData = await getPlayerInviteByPlayerQuery(req.body.player_id);
    const existingInvite = existingInviteData.rows[0];
    if (existingInvite) {
      res.status(200).json(existingInvite);
      return;
    }

    try {
      const data = await addPlayerInviteQuery(req.body);
      res.status(201).json(data.rows[0]);
    } catch (err: any) {
      if (err?.code === "23505") {
        const retryExistingData = await getPlayerInviteByPlayerQuery(req.body.player_id);
        const retryExisting = retryExistingData.rows[0];
        if (retryExisting) {
          res.status(200).json(retryExisting);
          return;
        }
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

async function getPlayerInviteByUUID(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getPlayerInviteByUUIDQuery(req.params.uuid);
    res.send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getPlayerInviteByPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetOwnerAccess(req, req.params.player_id);
    const data = await getPlayerInviteByPlayerQuery(req.params.player_id);
    res.send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removePlayerInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const inviteData = await getPlayerInviteQuery(req.params.id);
    const invite = inviteData.rows[0];
    if (!invite) throw { status: 404, message: "Invite not found" };
    await requireSheetOwnerAccess(req, invite.player_id);
    await removePlayerInviteQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export {
  getPlayerInviteByUUID,
  getPlayerInviteByPlayer,
  addPlayerInvite,
  removePlayerInvite,
};
