import { Router, Request, Response, NextFunction } from "express";
import {
  get5eCharGeneralQuery,
  get5eCharsGeneralByUserQuery,
} from "../api/queries/5eCharGeneral";
import { getTableViewsByUserQuery } from "../api/queries/tableViews";
import { getPlayerUsersQuery } from "../api/queries/playerUsers";
import { getProjectsQuery, getProjectQuery } from "../api/queries/projects";
import { getProjectUsersQuery } from "../api/queries/projectUsers";
import { getRecordsByUserQuery } from "../api/queries/record";
import { requireUserOrRedirect } from "../lib/authz";

const router = Router();

router.get("/dash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!requireUserOrRedirect(req, res, "/login")) return;
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

export default router;
