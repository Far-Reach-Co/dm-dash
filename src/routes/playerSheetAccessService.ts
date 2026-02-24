import { Request, Response } from "express";
import {
  get5eCharGeneralUserIdQuery,
  get5eCharNamesQuery,
} from "../api/queries/5eCharGeneral";
import { getPlayerUserByUserAndPlayerQuery } from "../api/queries/playerUsers";
import { getPlayerInviteByUUIDQuery } from "../api/queries/playerInvites";
import { getProjectQuery } from "../api/queries/projects";
import { getProjectUserByUserAndProjectQuery } from "../api/queries/projectUsers";
import { requireUserOrRedirect } from "../lib/authz";

export interface SheetAccessResult {
  userId: string | number;
  playerSheetId: string;
  playerSheetName: string;
  projectId: string | null;
  inviteId: string | null;
}

export async function resolvePlayerSheetAccess(
  req: Request,
  res: Response,
): Promise<SheetAccessResult | null> {
  const userId = requireUserOrRedirect(req, res, "/login");
  if (!userId) return null;

  if (!req.query.id) {
    res.redirect("/dash");
    return null;
  }

  const playerSheetId = String(req.query.id);
  const projectId = req.query.project ? String(req.query.project) : null;
  const inviteId = req.query.invite ? String(req.query.invite) : null;

  const playerSheetUserIdData = await get5eCharGeneralUserIdQuery(playerSheetId);
  const playerSheetUser = playerSheetUserIdData.rows[0];
  if (!playerSheetUser) {
    res.redirect("/dash");
    return null;
  }
  const playerSheetUserId = playerSheetUser.user_id;

  const playerSheetNameData = await get5eCharNamesQuery([playerSheetId]);
  const playerSheetNameRow = playerSheetNameData.rows[0];
  if (!playerSheetNameRow?.name) {
    res.redirect("/dash");
    return null;
  }
  const playerSheetName = playerSheetNameRow.name;

  if (playerSheetUserId == userId) {
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  const playerUserData = await getPlayerUserByUserAndPlayerQuery(
    userId,
    playerSheetId,
  );
  if (playerUserData.rows.length) {
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  if (!projectId) {
    const invite = inviteId || "";
    if (!invite) {
      res.render("forbidden", { auth: userId });
      return null;
    }
    const inviteData = await getPlayerInviteByUUIDQuery(invite);
    if (!inviteData.rows.length) {
      res.render("forbidden", { auth: userId });
      return null;
    }
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  const projectData = await getProjectQuery(projectId);
  if (!projectData.rows.length) {
    res.render("forbidden", { auth: userId });
    return null;
  }
  const project = projectData.rows[0];
  if (userId == project.user_id) {
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  const projectUserData = await getProjectUserByUserAndProjectQuery(
    userId,
    projectId,
  );
  if (!projectUserData.rows.length) {
    res.render("forbidden", { auth: userId });
    return null;
  }
  const projectUser = projectUserData.rows[0];
  if (!projectUser.is_editor) {
    res.render("forbidden", { auth: userId });
    return null;
  }

  return { userId, playerSheetId, playerSheetName, projectId, inviteId };
}
