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
    res.status(201).json(data.rows[0]);
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
    await removeProjectInviteQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export { getProjectInviteByUUID, addProjectInvite, removeProjectInvite };
