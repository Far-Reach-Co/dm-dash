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

const RECENT_LIMIT = 5;

const sortByDateDesc = <T>(
  items: T[],
  getDate: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTime = getDate(a) ? new Date(getDate(a) as string).getTime() : 0;
    const bTime = getDate(b) ? new Date(getDate(b) as string).getTime() : 0;
    return bTime - aTime;
  });
};

const sortByTitle = <T>(
  items: T[],
  getTitle: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTitle = (getTitle(a) ?? "").toLowerCase();
    const bTitle = (getTitle(b) ?? "").toLowerCase();
    return aTitle.localeCompare(bTitle);
  });
};

async function loadDashData(userId: string | number) {
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

  const tables = tableData.rows;
  const records = recordsData.rows;
  const createdSheets = charData.rows;
  const sharedSheets = sharedCharData.filter(Boolean);
  const createdWyrlds = projectData.rows;
  const sharedWyrlds = sharedProjectList.filter(Boolean);

  const recentTables = sortByDateDesc(tables, (table) => (table as any).date_created).slice(0, RECENT_LIMIT);
  const recentRecords = sortByDateDesc(records, (record) => (record as any).created_at).slice(0, RECENT_LIMIT);
  const recentSheets = sortByDateDesc(
    [...createdSheets, ...sharedSheets],
    (sheet) => (sheet as any).created_at,
  ).slice(0, RECENT_LIMIT);
  const recentWyrlds = sortByDateDesc(
    [...createdWyrlds, ...sharedWyrlds],
    (project) => (project as any).date_created,
  ).slice(0, RECENT_LIMIT);

  return {
    tables,
    records,
    sheets: createdSheets,
    sharedSheets,
    projects: createdWyrlds,
    sharedProjects: sharedWyrlds,
    imageCount,
    recentTables,
    recentRecords,
    recentSheets,
    recentWyrlds,
    tablesSorted: sortByTitle(tables, (table) => (table as any).title),
    recordsSorted: sortByTitle(records, (record) => (record as any).title),
    sheetsSorted: sortByTitle(createdSheets, (sheet) => (sheet as any).name),
    sharedSheetsSorted: sortByTitle(sharedSheets, (sheet) => (sheet as any).name),
    projectsSorted: sortByTitle(createdWyrlds, (project) => (project as any).title),
    sharedProjectsSorted: sortByTitle(sharedWyrlds, (project) => (project as any).title),
  };
}

router.get("/dash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/login");
    if (!userId) return;
    const data = await loadDashData(userId);
    res.render("dash", {
      auth: userId,
      section: "overview",
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  ["/dash/tables", "/dash/records", "/dash/sheets", "/dash/wyrlds"],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      const section = req.path.split("/")[2];
      const data = await loadDashData(userId);
      res.render("dash", {
        auth: userId,
        section,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
