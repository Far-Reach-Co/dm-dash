import {
  addProjectPlayerQuery,
  getProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
  removeProjectPlayerQuery,
  editProjectPlayerQuery,
  getProjectPlayersByPlayerQuery,
} from "../queries/projectPlayers";
import { Request, Response, NextFunction } from "express";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { getProjectQuery } from "../queries/projects";
import { userSubscriptionStatus } from "../../lib/enums";
import { notifySheetLinkedAsync } from "../../lib/emailNotifications";
import {
  requireProjectEditorAccess,
  requireProjectMemberAccess,
  requireSheetOwnerAccess,
} from "./accessControl";

async function addProjectPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireProjectEditorAccess(req, req.body.project_id);
    const projectPlayersData = await getProjectPlayersByProjectQuery(
      req.body.project_id
    );
    if (projectPlayersData.rows.length >= 5) {
      const projectData = await getProjectQuery(req.body.project_id);
      if (!projectData.rows[0].is_pro) {
        throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
      }
    }

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
    if (req.session.user) {
      notifySheetLinkedAsync({
        actorUserId: req.session.user,
        projectId: req.body.project_id,
        playerId: req.body.player_id,
      });
    }

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
    await requireProjectMemberAccess(req, req.params.project_id);
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
    await requireSheetOwnerAccess(req, req.params.player_id);
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
    const projectPlayerData = await getProjectPlayerQuery(req.params.id);
    const projectPlayer = projectPlayerData.rows[0];
    if (!projectPlayer) throw { status: 404, message: "Project player not found" };
    await requireProjectEditorAccess(req, projectPlayer.project_id);
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
    const projectPlayerData = await getProjectPlayerQuery(req.params.id);
    const projectPlayer = projectPlayerData.rows[0];
    if (!projectPlayer) throw { status: 404, message: "Project player not found" };
    await requireProjectEditorAccess(req, projectPlayer.project_id);
    const payload: Record<string, unknown> = {};
    if (typeof req.body.player_id !== "undefined") {
      payload.player_id = req.body.player_id;
    }
    if (!Object.keys(payload).length) {
      res.status(200).send(projectPlayer);
      return;
    }
    const data = await editProjectPlayerQuery(req.params.id, payload);
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
