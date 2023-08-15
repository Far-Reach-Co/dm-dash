import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { UserModel, getUserByIdQuery } from "./api/queries/users";
import {
  get5eCharGeneralQuery,
  get5eCharGeneralUserIdQuery,
  get5eCharsGeneralByUserQuery,
} from "./api/queries/5eCharGeneral";
import {
  getTableViewByUUIDQuery,
  getTableViewsByProjectQuery,
  getTableViewsByUserQuery,
} from "./api/queries/tableViews";
import {
  getPlayerUserByUserAndPlayerQuery,
  getPlayerUsersQuery,
} from "./api/queries/playerUsers";
import { getProjectQuery, getProjectsQuery } from "./api/queries/projects";
import {
  addProjectUserQuery,
  getProjectUserByUserAndProjectQuery,
  getProjectUsersByProjectQuery,
  getProjectUsersQuery,
} from "./api/queries/projectUsers";
import { getProjectPlayersByProjectQuery } from "./api/queries/projectPlayers";
import { getPlayerInviteByUUIDQuery } from "./api/queries/playerInvites";
import {
  getProjectInviteByProjectQuery,
  getProjectInviteByUUIDQuery,
} from "./api/queries/projectInvites";
import { getCalendarsQuery } from "./api/queries/calendars";

var router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/index", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    if (req.session.user) {
      res.redirect("/dash");
    } else {
      res.render("index", { auth: req.session.user });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    const csrfToken = req.csrfToken();
    res.render("login", { auth: req.session.user, csrfToken });
  } catch (err) {
    next(err);
  }
});

router.get("/register", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    const csrfToken = req.csrfToken();
    res.render("register", { auth: req.session.user, csrfToken });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/forgotpassword",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      const csrfToken = req.csrfToken();
      res.render("forgotpassword", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/resetpassword",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      const csrfToken = req.csrfToken();
      res.render("resetpassword", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/invite",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("forbidden");
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
        project.id
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

      // get table views by project
      const tableData = await getTableViewsByProjectQuery(project.id);
      // get all character sheets by project
      const players = [];
      const projectPlayers = await getProjectPlayersByProjectQuery(project.id);
      for (var player of projectPlayers.rows) {
        const charData = await get5eCharGeneralQuery(player.player_id);
        players.push(charData.rows[0]);
      }

      res.redirect("wyrld");
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      if (!req.session.user) return res.redirect("/login");
      const csrfToken = req.csrfToken();
      const { rows } = await getUserByIdQuery(req.session.user);
      res.render("account", {
        auth: req.session.user,
        user: rows[0],
        csrfToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/dashboard", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("dashboard", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/5eplayer",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/login");
      if (!req.query.id) return res.redirect("/dash");
      const playerSheetid = req.query.id as string;
      const playerSheetUserIdData = await get5eCharGeneralUserIdQuery(
        playerSheetid
      );
      const playerSheetUserId = playerSheetUserIdData.rows[0].user_id;
      // if not owner
      if (playerSheetUserId != req.session.user) {
        // check if is a playerUser (added by invite)
        const playerUserData = await getPlayerUserByUserAndPlayerQuery(
          req.session.user,
          playerSheetid
        );
        if (!playerUserData.rows.length) {
          // check if projectUser is manager or owner
          if (!req.query.project) {
            // check if there is no valid invite
            const invite = req.query.invite as string;
            if (!invite) {
              return res.render("forbidden", { auth: req.session.user });
            }
            const inviteData = await getPlayerInviteByUUIDQuery(invite);
            if (!inviteData.rows.length) {
              return res.render("forbidden", { auth: req.session.user });
            } else {
              return res.render("5eplayer", { auth: req.session.user });
            }
          }
          const projectId = req.query.project as string;
          const projectData = await getProjectQuery(projectId);
          if (!projectData.rows.length)
            return res.render("forbidden", { auth: req.session.user });
          const project = projectData.rows[0];
          if (req.session.user != project.user_id) {
            const projectUserData = await getProjectUserByUserAndProjectQuery(
              req.session.user,
              projectId
            );
            if (!projectUserData.rows.length)
              return res.render("forbidden", { auth: req.session.user });
            const projectUser = projectUserData.rows[0];
            if (!projectUser.is_editor) {
              return res.render("forbidden", { auth: req.session.user });
            } else {
              return res.render("5eplayer", { auth: req.session.user });
            }
          } else {
            return res.render("5eplayer", { auth: req.session.user });
          }
        } else {
          return res.render("5eplayer", { auth: req.session.user });
        }
      } else {
        return res.render("5eplayer", { auth: req.session.user });
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get("/dash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    // get table views by user
    const tableData = await getTableViewsByUserQuery(req.session.user);
    // get all character sheets by user
    const charData = await get5eCharsGeneralByUserQuery(req.session.user);
    // get shared character sheets by playerUser
    const sharedCharData = [];
    const playerUsersData = await getPlayerUsersQuery(req.session.user);
    if (playerUsersData.rows.length) {
      for (const playerUser of playerUsersData.rows) {
        const puCharData = await get5eCharGeneralQuery(playerUser.player_id);
        sharedCharData.push(puCharData.rows[0]);
      }
    }

    // created wyrlds
    const projectData = await getProjectsQuery(req.session.user);
    // join wyrlds
    const sharedProjectList = [];
    const projectUserData = await getProjectUsersQuery(req.session.user);
    for (const projectUser of projectUserData.rows) {
      const sharedProjectData = await getProjectQuery(projectUser.project_id);
      sharedProjectList.push(sharedProjectData.rows[0]);
    }

    res.render("dash", {
      auth: req.session.user,
      tables: tableData.rows,
      sheets: charData.rows,
      sharedSheets: sharedCharData,
      projects: projectData.rows,
      sharedProjects: sharedProjectList,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/wyrld",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/login");
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];

      let projectAuth = true;
      // authorize
      if (req.session.user != project.user_id) {
        // if user is not owner, check if user is projectUser
        const projectUserData = await getProjectUserByUserAndProjectQuery(
          req.session.user,
          projectId
        );
        if (!projectUserData.rows.length) {
          // send to forbidden
          return res.render("forbidden", { auth: req.session.user });
        }
        // update projectAuth for managers
        const projectUser = projectUserData.rows[0];
        projectAuth = projectUser.is_editor;
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

      res.render("wyrld", {
        auth: req.session.user,
        projectAuth,
        project: project,
        tables: tableData.rows,
        sheets: players,
        calendars: calendars.rows,
      });
    } catch (err) {
      next(err);
    }
  }
);

interface GetProjectUsersByProjectReturnUserModel extends UserModel {
  project_user_id: number;
  is_editor: boolean;
}

router.get(
  "/wyrldsettings",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/forbidden");
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];
      // if not owner of wyrld
      if (project.user_id != req.session.user) {
        return res.redirect("/forbidden");
      }

      const projectInviteData = await getProjectInviteByProjectQuery(
        project.id
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
        (user as GetProjectUsersByProjectReturnUserModel).project_user_id =
          projectUser.id;
        (user as GetProjectUsersByProjectReturnUserModel).is_editor =
          projectUser.is_editor;
        usersList.push(user);
      }

      return res.render("wyrldsettings", {
        auth: req.session.user,
        inviteLink,
        inviteId,
        project,
        users: usersList,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/sharedwyrldsettings",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/forbidden");
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];

      // project users
      const projectUserData = await getProjectUserByUserAndProjectQuery(
        req.session.user,
        project.id
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
  }
);

router.get("/newsheet", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) return res.redirect("/forbidden");
    res.render("newsheet", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/newtable", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) return res.redirect("/forbidden");
    res.render("newtable", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/newwyrldtable",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/forbidden");
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];
      // authorize
      if (req.session.user != project.user_id) {
        // if user is not owner, check if user is projectUser
        const projectUserData = await getProjectUserByUserAndProjectQuery(
          req.session.user,
          projectId
        );
        if (!projectUserData.rows.length) {
          // send to forbidden
          return res.render("forbidden", { auth: req.session.user });
        } else {
          const projectUser = projectUserData.rows[0];
          if (!projectUser.is_editor) {
            return res.render("forbidden", { auth: req.session.user });
          } else {
            res.render("newwyrldtable", {
              auth: req.session.user,
              projectId: project.id,
            });
          }
        }
      } else {
        res.render("newwyrldtable", {
          auth: req.session.user,
          projectId: project.id,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/newwyrldcalendar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/forbidden");
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];
      // authorize
      if (req.session.user != project.user_id) {
        // if user is not owner, check if user is projectUser
        const projectUserData = await getProjectUserByUserAndProjectQuery(
          req.session.user,
          projectId
        );
        if (!projectUserData.rows.length) {
          // send to forbidden
          return res.render("forbidden", { auth: req.session.user });
        } else {
          const projectUser = projectUserData.rows[0];
          if (!projectUser.is_editor) {
            return res.render("forbidden", { auth: req.session.user });
          } else {
            res.render("newwyrldcalendar", {
              auth: req.session.user,
              projectId: project.id,
            });
          }
        }
      } else {
        res.render("newwyrldcalendar", {
          auth: req.session.user,
          projectId: project.id,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get("/newwyrld", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) return res.redirect("/forbidden");
    res.render("newwyrld", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/vtt", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.query.uuid) return res.render("404", { auth: req.session.user });
    const uuid = req.query.uuid as string;
    const tableData = await getTableViewByUUIDQuery(uuid);

    // if not table
    if (!tableData.rows.length) {
      return res.render("404", { auth: req.session.user });
    }

    // check if table belongs to project
    const table = tableData.rows[0];
    if (!table.project_id) {
      return res.render("vtt", { auth: req.session.user, projectAuth: false });
    }

    // if table does not exist
    const projectData = await getProjectQuery(table.project_id);
    if (!projectData.rows.length) {
      return res.render("404", { auth: req.session.user });
    }

    // check if there is a user with an account logged in
    const project = projectData.rows[0];
    if (!req.session.user) {
      return res.render("forbidden", { auth: req.session.user });
    }

    // if user is owner
    if (project.user_id == req.session.user) {
      return res.render("vtt", { auth: req.session.user, projectAuth: true });
    }

    // check if user is a projectUser
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      req.session.user,
      project.id
    );
    if (!projectUserData.rows.length) {
      // send to forbidden
      return res.render("forbidden", { auth: req.session.user });
    }
    const projectUser = projectUserData.rows[0];
    return res.render("vtt", {
      auth: req.session.user,
      projectAuth: projectUser.is_editor,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
});

router.get("/forbidden", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("forbidden", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).render("404", { auth: req.session.user });
});

module.exports = router;
