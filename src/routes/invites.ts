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

const router = Router();

router.get(
  "/invite",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "forbidden")) return;
      // if no invite uuid in params
      if (!req.query.invite)
        return res.render("invite", {
          auth: req.session.user,
          error: "Can't find invite",
        });
      // if no invite
      const inviteUUID = req.query.invite as string;
      const inviteData = await getProjectInviteByUUIDQuery(inviteUUID);
      if (!inviteData.rows.length)
        return res.render("invite", {
          auth: req.session.user,
          error: "Can't find invite",
        });
      // if no project
      const invite = inviteData.rows[0];
      const projectData = await getProjectQuery(invite.project_id);
      if (!projectData.rows.length)
        return res.render("invite", {
          auth: req.session.user,
          error: "Can't find the wyrld related to this invite",
        });
      // if are the owner/creator
      const project = projectData.rows[0];
      if (project.user_id == req.session.user)
        return res.render("invite", {
          auth: req.session.user,
          error: "You already own this wyrld",
        });
      // if already a member
      const projectUserData = await getProjectUserByUserAndProjectQuery(
        req.session.user,
        project.id,
      );
      if (projectUserData.rows.length)
        return res.render("invite", {
          auth: req.session.user,
          error: "You already joined this wyrld",
        });

      // safe
      await addProjectUserQuery({
        project_id: invite.project_id,
        user_id: req.session.user,
        is_editor: false,
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
      if (!requireUserOrRedirect(req, res, "/login")) return;
      if (!req.query.id) return res.redirect("/dash");

      const projectId = req.query.id as string;
      const projectData = await getProjectQuery(projectId);
      if (!projectData.rows.length) return res.redirect("/dash");

      const project = projectData.rows[0];

      // Get user's character sheets
      const userSheets = await get5eCharsGeneralByUserQuery(req.session.user);

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
        auth: req.session.user,
        project,
        unlinkedSheets,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
