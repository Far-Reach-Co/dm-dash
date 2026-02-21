import { Router, Request, Response, NextFunction } from "express";
import {
  addProjectUserQuery,
  getProjectUserByUserAndProjectQuery,
} from "../api/queries/projectUsers";
import { getProjectQuery } from "../api/queries/projects";
import { getProjectInviteByUUIDQuery } from "../api/queries/projectInvites";
import { get5eCharsGeneralByUserQuery } from "../api/queries/5eCharGeneral";
import { getProjectPlayersByProjectQuery } from "../api/queries/projectPlayers";
import { requireUserOrRedirect } from "../lib/authz";
import { logEventAsync, EventType } from "../lib/eventLogger";
import { notifyWyrldJoinAsync } from "../lib/emailNotifications";

const router = Router();

router.get(
  "/invite",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "forbidden");
      if (!userId) return;
      // if no invite uuid in params
      if (!req.query.invite)
        return res.render("invite", {
          auth: userId,
          error: "Can't find invite",
        });
      // if no invite
      const inviteUUID = req.query.invite as string;
      const inviteData = await getProjectInviteByUUIDQuery(inviteUUID);
      if (!inviteData.rows.length)
        return res.render("invite", {
          auth: userId,
          error: "Can't find invite",
        });
      // if no project
      const invite = inviteData.rows[0];
      const projectData = await getProjectQuery(invite.project_id);
      if (!projectData.rows.length)
        return res.render("invite", {
          auth: userId,
          error: "Can't find the wyrld related to this invite",
        });
      // if are the owner/creator
      const project = projectData.rows[0];
      if (project.user_id == userId)
        return res.render("invite", {
          auth: userId,
          error: "You already own this wyrld",
        });
      // if already a member
      const projectUserData = await getProjectUserByUserAndProjectQuery(
        userId,
        project.id,
      );
      if (projectUserData.rows.length)
        return res.render("invite", {
          auth: userId,
          error: "You already joined this wyrld",
        });

      // safe
      const addProjectUserData = await addProjectUserQuery({
        project_id: invite.project_id,
        user_id: userId,
        is_editor: false,
      });
      const projectUser = addProjectUserData.rows[0];
      logEventAsync({
        userId,
        projectId: project.id,
        eventType: EventType.PROJECT_USER_CREATED,
        eventData: {
          projectUserId: projectUser.id,
          joiningUserId: userId,
          source: "invite_link",
          outcome: "success",
          reason: null,
        },
        req,
      });
      logEventAsync({
        userId,
        projectId: project.id,
        eventType: EventType.PROJECT_INVITE_USED,
        eventData: {
          inviteId: invite.id,
          inviteUuid: invite.uuid,
          projectUserId: projectUser.id,
          joiningUserId: userId,
          source: "invite_link",
          outcome: "success",
          reason: null,
        },
        req,
      });
      notifyWyrldJoinAsync({
        projectId: project.id,
        joiningUserId: userId,
      });

      // redirect to welcome page to set up character
      res.redirect(`/wyrld-welcome?id=${project.id}`);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/wyrld-welcome",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      if (!req.query.id) return res.redirect("/dash");

      const projectId = req.query.id as string;
      const projectData = await getProjectQuery(projectId);
      if (!projectData.rows.length) return res.redirect("/dash");

      const project = projectData.rows[0];

      // Get user's character sheets
      const userSheets = await get5eCharsGeneralByUserQuery(userId);

      // Get sheets already linked to this wyrld
      const projectPlayers = await getProjectPlayersByProjectQuery(projectId);
      const linkedSheetIds = new Set(
        projectPlayers.rows.map((pp) => pp.player_id),
      );

      // Filter to get unlinked sheets
      const unlinkedSheets = userSheets.rows.filter(
        (sheet) => !linkedSheetIds.has(sheet.id),
      );

      res.render("wyrld-welcome", {
        auth: userId,
        project,
        unlinkedSheets,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
