import {
  addPlayerInviteQuery,
  getPlayerInviteQuery,
  getPlayerInviteByPlayerQuery,
  getPlayerInviteByUUIDQuery,
  removePlayerInviteQuery,
} from "../queries/playerInvites.js";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

async function addPlayerInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uuid = uuidv4();
  req.body.uuid = uuid;

  try {
    const data = await addPlayerInviteQuery(req.body);
    res.status(201).json(data.rows[0]);
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
