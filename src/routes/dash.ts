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
import { getTableImageCountByUserQuery } from "../api/queries/tableImages";
import { requireUserOrRedirect } from "../lib/authz";

const router = Router();

router.get("/dash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/login");
    if (!userId) return;
    // get table views by user
    const tableData = await getTableViewsByUserQuery(userId);
    // get all character sheets by user
    const charData = await get5eCharsGeneralByUserQuery(userId);
    // get shared character sheets by playerUser
    const sharedCharData = [];
    const playerUsersData = await getPlayerUsersQuery(userId);
    if (playerUsersData.rows.length) {
      for (const playerUser of playerUsersData.rows) {
        const puCharData = await get5eCharGeneralQuery(playerUser.player_id);
        sharedCharData.push(puCharData.rows[0]);
      }
    }

    // created wyrlds
    const projectData = await getProjectsQuery(userId);
    // join wyrlds
    const sharedProjectList = [];
    const projectUserData = await getProjectUsersQuery(userId);
    for (const projectUser of projectUserData.rows) {
      const sharedProjectData = await getProjectQuery(projectUser.project_id);
      sharedProjectList.push(sharedProjectData.rows[0]);
    }

    // records
    const recordsData = await getRecordsByUserQuery(userId);

    // image count
    const imageCountData = await getTableImageCountByUserQuery(userId);
    const imageCount = parseInt(imageCountData.rows[0].count);

    res.render("dash", {
      auth: userId,
      tables: tableData.rows,
      sheets: charData.rows,
      sharedSheets: sharedCharData,
      projects: projectData.rows,
      sharedProjects: sharedProjectList,
      records: recordsData.rows,
      imageCount,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
