import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { editUserQuery, getUserByIdQuery } from "./api/queries/users";
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
import { getProjectQuery } from "./api/queries/projects";
import { getProjectUserByUserAndProjectQuery } from "./api/queries/projectUsers";
import { getProjectPlayersByProjectQuery } from "./api/queries/projectPlayers";
import { getPlayerInviteByUUIDQuery } from "./api/queries/playerInvites";

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
    res.render("login", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/register", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("register", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/forgotpassword",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("forgotpassword", { auth: req.session.user });
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
      res.render("resetpassword", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/invite", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("invite", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      if (!req.session.user) return res.redirect("/login");
      const { rows } = await getUserByIdQuery(req.session.user);
      res.render("account", { auth: req.session.user, user: rows[0] });
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

    res.render("dash", {
      auth: req.session.user,
      tables: tableData.rows,
      sheets: charData.rows,
      sharedSheets: sharedCharData,
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

      res.render("wyrld", {
        auth: req.session.user,
        project: project,
        tables: tableData.rows,
        sheets: players,
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
      return res.render("vtt", { auth: req.session.user });
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

router.post(
  "/update_username",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/forbidden");
      await editUserQuery(req.session.user, {
        username: req.body.username,
      });
      res.send("Saved!");
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/update_email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/forbidden");
      await editUserQuery(req.session.user, {
        email: req.body.email,
      });
      res.send("Saved!");
    } catch (err) {
      next(err);
    }
  }
);

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