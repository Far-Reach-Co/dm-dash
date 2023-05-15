import {
  addProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
  removeProjectPlayerQuery,
  editProjectPlayerQuery,
  getProjectPlayersByPlayerQuery,
} from "../queries/projectPlayers";
import { Request, Response, NextFunction } from "express";

async function addProjectPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await addProjectPlayerQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectPlayersByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectPlayerData = await getProjectPlayersByProjectQuery(
      req.params.project_id
    );

    res.status(200).json(projectPlayerData.rows);
  } catch (err) {
    next(err);
  }
}

async function getProjectPlayersByPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectPlayerData = await getProjectPlayersByPlayerQuery(
      req.params.player_id
    );

    res.status(200).json(projectPlayerData.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProjectPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await removeProjectPlayerQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProjectPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await editProjectPlayerQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addProjectPlayer,
  getProjectPlayersByProject,
  getProjectPlayersByPlayer,
  removeProjectPlayer,
  editProjectPlayer,
};
