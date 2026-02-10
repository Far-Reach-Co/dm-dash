import { Router, Request, Response, NextFunction } from "express";
import {
  get5eCharGeneralUserIdQuery,
  get5eCharNamesQuery,
} from "../api/queries/5eCharGeneral";
import { getPlayerUserByUserAndPlayerQuery } from "../api/queries/playerUsers";
import { getPlayerInviteByUUIDQuery } from "../api/queries/playerInvites";
import { getProjectQuery } from "../api/queries/projects";
import { getProjectUserByUserAndProjectQuery } from "../api/queries/projectUsers";
import { requireUserOrRedirect } from "../lib/authz";

const router = Router();

router.get(
  "/5eplayer",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireUserOrRedirect(req, res, "/login")) return;
      if (!req.query.id) return res.redirect("/dash");
      const playerSheetid = req.query.id as string;
      // get id
      const playerSheetUserIdData = await get5eCharGeneralUserIdQuery(
        playerSheetid,
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
          playerSheetid,
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
              projectId,
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
  },
);

router.get("/newsheet", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!requireUserOrRedirect(req, res, "/forbidden")) return;
    res.render("newsheet", {
      auth: req.session.user,
      wyrld_id: req.query.wyrld_id || null,
      wyrld_title: req.query.wyrld_title || null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
