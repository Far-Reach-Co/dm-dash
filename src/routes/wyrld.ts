import { Router, Request, Response, NextFunction } from "express";
import { getTableViewsByProjectQuery } from "../api/queries/tableViews";
import {
  getProjectUsersByProjectQuery,
  getProjectUserByUserAndProjectQuery,
} from "../api/queries/projectUsers";
import { getProjectPlayersByProjectQuery } from "../api/queries/projectPlayers";
import { getProjectInviteByProjectQuery } from "../api/queries/projectInvites";
import { get5eCharGeneralQuery } from "../api/queries/5eCharGeneral";
import { getCalendarsQuery } from "../api/queries/calendars";
import { getRecordsByProjectQuery } from "../api/queries/record";
import { getUserByIdQuery, User } from "../api/queries/users";
import { humanFileSize } from "../lib/utils";
import {
  requireProjectEditorOrRedirect,
  requireProjectMemberOrRedirect,
  requireProjectOwnerOrRedirect,
  requireUserOrRedirect,
} from "../lib/authz";

const router = Router();

router.get(
  "/wyrld",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/login")) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectMemberOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;

      let projectAuth = true;
      if (req.session.user != project.user_id) {
        const projectUserData = await getProjectUserByUserAndProjectQuery(
          req.session.user,
          projectId,
        );
        const projectUser = projectUserData.rows[0];
        projectAuth = projectUser?.is_editor ?? false;
      }

      // get table views by project
      const tableData = await getTableViewsByProjectQuery(projectId);
      // get all character sheets by project
      const players = [];
      const projectPlayers = await getProjectPlayersByProjectQuery(projectId);
      for (var player of projectPlayers.rows) {
        const charData = await get5eCharGeneralQuery(player.player_id);
        players.push(charData.rows[0]);
      }

      // calendars
      const calendars = await getCalendarsQuery(projectId);

      // records
      const recordsData = await getRecordsByProjectQuery(project.id);

      // calculate used data formatted
      const usedDataFormatted = humanFileSize(project.used_data_in_bytes);

      // get invite link if exists (only needed for owners/managers)
      let inviteLink = null;
      let inviteId = null;
      if (projectAuth) {
        const inviteData = await getProjectInviteByProjectQuery(projectId);
        if (inviteData.rows.length > 0) {
          const invite = inviteData.rows[0];
          inviteId = invite.id;
          inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${invite.uuid}`;
        }
      }

      res.render("wyrld", {
        auth: req.session.user,
        projectAuth,
        project: project,
        tables: tableData.rows,
        sheets: players,
        calendars: calendars.rows,
        records: recordsData.rows,
        usedDataFormatted,
        inviteLink,
        inviteId,
      });
    } catch (err) {
      next(err);
    }
  },
);

interface GetProjectUsersByProjectReturnUser extends User {
  project_user_id: number;
  is_editor: boolean;
}

router.get(
  "/wyrldsettings",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/forbidden")) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectOwnerOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;

      const projectInviteData = await getProjectInviteByProjectQuery(
        project.id,
      );
      // invite
      let inviteLink = null;
      let inviteId = null;
      if (projectInviteData.rows.length) {
        const invite = projectInviteData.rows[0];
        inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${
          invite.uuid
        }`;
        inviteId = invite.id;
      }

      // project users
      const projectUsersData = await getProjectUsersByProjectQuery(project.id);

      const usersList = [];

      for (const projectUser of projectUsersData.rows) {
        const userData = await getUserByIdQuery(projectUser.user_id);
        const user = userData.rows[0];
        (user as GetProjectUsersByProjectReturnUser).project_user_id =
          projectUser.id;
        (user as GetProjectUsersByProjectReturnUser).is_editor =
          projectUser.is_editor;
        usersList.push(user);
      }

      return res.render("wyrldsettings", {
        auth: req.session.user,
        inviteLink,
        inviteId,
        project,
        users: usersList,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/sharedwyrldsettings",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/forbidden")) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectMemberOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;

      const projectUserData = await getProjectUserByUserAndProjectQuery(
        req.session.user,
        project.id,
      );
      if (!projectUserData.rows.length) return res.redirect("/forbidden");
      const projectUser = projectUserData.rows[0];

      return res.render("sharedwyrldsettings", {
        auth: req.session.user,
        projectUserId: projectUser.id,
        project,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldtable",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/forbidden")) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldtable", {
        auth: req.session.user,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldcalendar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/forbidden")) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldcalendar", {
        auth: req.session.user,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldrecord",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/forbidden")) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldrecord", {
        auth: req.session.user,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/newwyrld", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!requireUserOrRedirect(req, res, "/forbidden")) return;
    res.render("newwyrld", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

export default router;
