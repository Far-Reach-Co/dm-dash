import {
  addProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
  removeProjectPlayerQuery,
  editProjectPlayerQuery,
  getProjectPlayersByPlayerQuery,
} from "../queries/projectPlayers";
import { Request, Response, NextFunction } from "express";
import { logEventAsync, EventType } from "../../lib/eventLogger";

async function addProjectPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await addProjectPlayerQuery(req.body);
    const projectPlayer = data.rows[0];
    // Log project player creation event
    logEventAsync({
      userId: req.session.user,
      projectId: req.body.project_id,
      eventType: EventType.PROJECT_PLAYER_CREATED,
      eventData: {
        projectPlayerId: projectPlayer.id,
        playerId: req.body.player_id,
      },
      req,
    });

    // If HTMX request, redirect to wyrld page
    if (req.headers["hx-request"]) {
      res
        .set("HX-Redirect", `/wyrld?id=${req.body.project_id}`)
        .send("Character linked successfully.");
    } else {
      res.status(201).json(projectPlayer);
    }
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
