import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { User, getUserByIdQuery } from "./api/queries/users";
import {
  get5eCharGeneralQuery,
  get5eCharGeneralUserIdQuery,
  get5eCharNamesQuery,
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
import { humanFileSize } from "./lib/utils";
import {
  getRecordQuery,
  getRecordsByProjectQuery,
  getRecordsByUserQuery,
} from "./api/queries/record";
import { getRecordImagesByRecordQuery } from "./api/queries/recordImage";
import { getImageQuery, Image } from "./api/queries/images";
import { getSignedUrls } from "./api/controllers/s3";

// CSRF protection using base csrf package (same as csurf used internally)
import Tokens from "csrf";

const tokens = new Tokens();
const CSRF_COOKIE = "_csrf_secret";
const isProd = process.env.SERVER_ENV === "prod";

// Middleware to generate CSRF token (for GET routes that render forms)
const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get or create secret from cookie
  let secret = req.cookies[CSRF_COOKIE];
  if (!secret) {
    secret = tokens.secretSync();
    res.cookie(CSRF_COOKIE, secret, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    });
  }
  // Generate token and make available to templates
  const token = tokens.create(secret);
  res.locals.csrfToken = token;
  next();
};

// Middleware to validate CSRF token (for POST routes)
const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.cookies[CSRF_COOKIE];
  const token = req.body?._csrf || req.headers["x-csrf-token"];

  if (!secret || !token || !tokens.verify(secret, token)) {
    const err: any = new Error("Invalid CSRF token");
    err.code = "EBADCSRFTOKEN";
    err.status = 403;
    return next(err);
  }
  next();
};

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
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/about-us", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("aboutus", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/what-is-frc", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("what-is-frc", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/login",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Invalidate old session cookie
      res.clearCookie("frcsession", {
        path: "/",
        sameSite: "lax",
        secure: true,
      });

      //
      const csrfToken = res.locals.csrfToken;
      res.render("login", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/register",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      const csrfToken = res.locals.csrfToken;
      res.render("register", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/forgotpassword",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      const csrfToken = res.locals.csrfToken;
      res.render("forgotpassword", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/resetpassword",
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      const csrfToken = res.locals.csrfToken;
      res.render("resetpassword", { auth: req.session.user, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/resources", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("resources", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/preaethrend",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("preaethrend", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/attributions",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("attributions", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/privacy-policy",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("privacypolicy", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/terms-of-use",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("termsofuse", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/aether-bot",
  (_req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("aetherbot");
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

      // redirect to welcome page to set up character
      res.redirect(`/wyrld-welcome?id=${project.id}`);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/wyrld-welcome",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/login");
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
        projectPlayers.rows.map((pp) => pp.player_id)
      );

      // Filter to get unlinked sheets
      const unlinkedSheets = userSheets.rows.filter(
        (sheet) => !linkedSheetIds.has(sheet.id)
      );

      res.render("wyrld-welcome", {
        auth: req.session.user,
        project,
        unlinkedSheets,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/account",
  csrfMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      if (!req.session.user) return res.redirect("/login");
      const csrfToken = res.locals.csrfToken;
      const { rows } = await getUserByIdQuery(req.session.user);

      // calculate used data formatted
      const usedDataFormatted = humanFileSize(rows[0].used_data_in_bytes);

      res.render("account", {
        auth: req.session.user,
        user: rows[0],
        usedDataFormatted,
        csrfToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5eplayer",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) return res.redirect("/login");
      if (!req.query.id) return res.redirect("/dash");
      const playerSheetid = req.query.id as string;
      // get id
      const playerSheetUserIdData = await get5eCharGeneralUserIdQuery(
        playerSheetid
      );
      const playerSheetUserId = playerSheetUserIdData.rows[0].user_id;
      // get name
      const playerSheetNameData = await get5eCharNamesQuery([playerSheetid]);
      const playerSheetName = playerSheetNameData.rows[0].name;
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
              return res.render("5eplayer", {
                auth: req.session.user,
                playerSheetName: playerSheetName,
              });
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
              return res.render("5eplayer", {
                auth: req.session.user,
                playerSheetName: playerSheetName,
              });
            }
          } else {
            return res.render("5eplayer", {
              auth: req.session.user,
              playerSheetName: playerSheetName,
            });
          }
        } else {
          return res.render("5eplayer", {
            auth: req.session.user,
            playerSheetName: playerSheetName,
          });
        }
      } else {
        return res.render("5eplayer", {
          auth: req.session.user,
          playerSheetName: playerSheetName,
        });
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

    // records
    const recordsData = await getRecordsByUserQuery(req.session.user);

    res.render("dash", {
      auth: req.session.user,
      tables: tableData.rows,
      sheets: charData.rows,
      sharedSheets: sharedCharData,
      projects: projectData.rows,
      sharedProjects: sharedProjectList,
      records: recordsData.rows,
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
  }
);

interface GetProjectUsersByProjectReturnUser extends User {
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
    res.render("newsheet", {
      auth: req.session.user,
      wyrld_id: req.query.wyrld_id || null,
      wyrld_title: req.query.wyrld_title || null,
    });
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

router.get("/newrecord", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) return res.redirect("/forbidden");
    res.render("newrecord", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/editrecord",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.id) return res.redirect("/404");
      const recordId = req.query.id as string;
      const userId = req.session.user as string;

      const data = await getRecordQuery(recordId);
      const record = data.rows[0];

      const recordImageData = await getRecordImagesByRecordQuery(recordId);
      let imagesFromRecordImages: Image[] = [];
      let imageUrls: { [key: string]: string } = {};
      if (recordImageData.rows.length) {
        imagesFromRecordImages = await Promise.all(
          recordImageData.rows.map(async (ri) => {
            const imageData = await getImageQuery(ri.image_id);
            return imageData.rows[0];
          })
        );
        imageUrls = await getSignedUrls(imagesFromRecordImages);
        console.log(imageUrls);
      }

      // render non wyrld public or not
      if (!req.query.project_id) {
        let is_author = Number(userId) == Number(record.user_id);
        if (!is_author) return res.redirect("/forbidden");
      } else {
        const projectId = req.query.project_id as string;
        const projectData = await getProjectQuery(projectId);
        const project = projectData.rows[0];
        let is_author = Number(userId) != Number(project.user_id);
        if (!is_author) {
        }
      }

      res.render("editrecord", {
        auth: userId,
        record: record,
        imageUrls: imageUrls,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/record",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.id) return res.redirect("/404");
      const recordId = req.query.id as string;
      const userId = req.session.user as string;

      const recordData = await getRecordQuery(recordId);
      const record = recordData.rows[0];

      const recordImageData = await getRecordImagesByRecordQuery(recordId);
      let imagesFromRecordImages: Image[] = [];
      let imageUrls: { [key: string]: string } = {};
      if (recordImageData.rows.length) {
        imagesFromRecordImages = await Promise.all(
          recordImageData.rows.map(async (ri) => {
            const imageData = await getImageQuery(ri.image_id);
            return imageData.rows[0];
          })
        );
        imageUrls = await getSignedUrls(imagesFromRecordImages);
        console.log(imageUrls);
      }

      // render non wyrld public or not
      if (!req.query.project_id) {
        let is_author = Number(userId) == Number(record.user_id);
        if (!record.is_public) {
          if (is_author) {
            return res.render("record", {
              auth: userId,
              record: record,
              imageUrls: imageUrls,
              projectId: null,
              canEdit: true,
            });
          } else return res.redirect("/forbidden");
        } else {
          return res.render("record", {
            auth: userId,
            record: record,
            imageUrls: imageUrls,
            projectId: null,
            canEdit: is_author,
          });
        }
      } else {
        // handle wyrld auth
        const projectId = req.query.project_id as string;
        const projectData = await getProjectQuery(projectId);
        const project = projectData.rows[0];
        let is_author = Number(userId) == Number(project.user_id);
        if (!is_author) {
          // if user is not owner, check if user is projectUser
          const projectUserData = await getProjectUserByUserAndProjectQuery(
            userId,
            projectId
          );
          if (!projectUserData.rows.length) {
            return res.render("forbidden", { auth: userId });
          } else {
            const projectUser = projectUserData.rows[0];
            // is editor?
            if (!projectUser.is_editor) {
              // is public?
              if (!record.is_public) {
                return res.render("forbidden", { auth: userId });
              } else
                return res.render("record", {
                  auth: userId,
                  record: record,
                  imageUrls: imageUrls,
                  projectId: project.id,
                  canEdit: false,
                });
            } else {
              return res.render("record", {
                auth: userId,
                record: record,
                imageUrls: imageUrls,
                projectId: project.id,
                canEdit: true,
              });
            }
          }
        } else {
          return res.render("record", {
            auth: userId,
            record: record,
            imageUrls: imageUrls,
            projectId: project.id,
            canEdit: is_author,
          });
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

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

router.get(
  "/newwyrldrecord",
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
            res.render("newwyrldrecord", {
              auth: req.session.user,
              projectId: project.id,
            });
          }
        }
      } else {
        res.render("newwyrldrecord", {
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
      // is public?
      if (table.is_public) {
        return res.render("vtt", {
          auth: req.session.user,
          projectAuth: false,
        });
      } else if (table.user_id === req.session.user) {
        return res.render("vtt", {
          auth: req.session.user,
          projectAuth: false,
        });
      } else {
        return res.render("forbidden", { auth: req.session.user });
      }
    }

    // if project exists by id
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

    // check if public or editor
    if (!projectUser.is_editor) {
      if (!table.is_public) {
        return res.render("forbidden", { auth: req.session.user });
      } else {
        return res.render("vtt", {
          auth: req.session.user,
          projectAuth: projectUser.is_editor,
        });
      }
    }

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

export default router;
export { csrfProtection };
