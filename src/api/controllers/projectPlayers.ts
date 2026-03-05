import {
  addProjectPlayerQuery,
  getProjectPlayerQuery,
  getProjectPlayerByProjectAndPlayerQuery,
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
import { subscriptionPlanLimits } from "../../lib/subscription";
import { get5eCharGeneralQuery } from "../queries/5eCharGeneral";

async function addProjectPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const generalData = await get5eCharGeneralQuery(req.body.player_id);
    const general = generalData.rows[0];
    if (!general) throw { status: 404, message: "Character not found" };

    const isSheetOwner =
      req.session?.user &&
      String(general.user_id) === String(req.session.user);

    if (isSheetOwner) {
      await requireProjectMemberAccess(req, req.body.project_id);
    } else {
      await requireProjectEditorAccess(req, req.body.project_id);
    }

    const existingProjectPlayerData = await getProjectPlayerByProjectAndPlayerQuery(
      req.body.project_id,
      req.body.player_id,
    );
    const existingProjectPlayer = existingProjectPlayerData.rows[0];
    if (existingProjectPlayer) {
      if (req.headers["hx-request"]) {
        res
          .set("HX-Redirect", `/wyrld?id=${req.body.project_id}`)
          .send("Character linked successfully.");
      } else {
        res.status(200).json(existingProjectPlayer);
      }
      return;
    }

    const projectPlayersData = await getProjectPlayersByProjectQuery(
      req.body.project_id
    );
    if (
      projectPlayersData.rows.length >=
      subscriptionPlanLimits.freeWyrldCharacterLinks
    ) {
      const projectData = await getProjectQuery(req.body.project_id);
      if (!projectData.rows[0].is_pro) {
        throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
      }
    }

    let projectPlayer:
      | Awaited<ReturnType<typeof addProjectPlayerQuery>>["rows"][number]
      | undefined;
    try {
      const data = await addProjectPlayerQuery(req.body);
      projectPlayer = data.rows[0];
    } catch (err: any) {
      if (err?.code === "23505") {
        const existingData = await getProjectPlayerByProjectAndPlayerQuery(
          req.body.project_id,
          req.body.player_id,
        );
        const existing = existingData.rows[0];
        if (existing) {
          if (req.headers["hx-request"]) {
            res
              .set("HX-Redirect", `/wyrld?id=${req.body.project_id}`)
              .send("Character linked successfully.");
          } else {
            res.status(200).json(existing);
          }
          return;
        }
      }
      throw err;
    }
    if (!projectPlayer) throw { status: 500, message: "Failed to link character" };
    const characterName = general.name || null;
    // Log project player creation event
    logEventAsync({
      userId: req.session.user,
      projectId: req.body.project_id,
      eventType: EventType.PROJECT_PLAYER_CREATED,
      eventData: {
        projectPlayerId: projectPlayer.id,
        playerId: req.body.player_id,
        characterName,
        source: "manual_link",
        outcome: "success",
        reason: null,
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
    const generalData = await get5eCharGeneralQuery(projectPlayer.player_id);
    const characterName = generalData.rows[0]?.name || null;
    await removeProjectPlayerQuery(req.params.id);
    logEventAsync({
      userId: req.session.user,
      projectId: projectPlayer.project_id,
      eventType: EventType.PROJECT_PLAYER_REMOVED,
      eventData: {
        projectPlayerId: projectPlayer.id,
        playerId: projectPlayer.player_id,
        characterName,
        source: "manual_unlink",
        outcome: "success",
        reason: null,
      },
      req,
    });
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
