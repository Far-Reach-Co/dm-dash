import { Router, Request, Response, NextFunction } from "express";
import {
  get5eCharsGeneralByIdsQuery,
  get5eCharsGeneralByUserQuery,
} from "../api/queries/5eCharGeneral";
import { getTableViewsByUserQuery } from "../api/queries/tableViews";
import { getPlayerUsersQuery } from "../api/queries/playerUsers";
import { getProjectsByIdsQuery, getProjectsQuery } from "../api/queries/projects";
import { getProjectUsersQuery } from "../api/queries/projectUsers";
import { getRecordsByUserQuery } from "../api/queries/record";
import { getTableImageCountByUserQuery } from "../api/queries/tableImages";
import { getRecentlyViewedByUser } from "../api/queries/recentlyViewed";
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

function buildRecents<T>(
  items: T[],
  viewedIds: number[],
  getId: (item: T) => number,
  getDate: (item: T) => string | undefined,
  limit: number,
): T[] {
  const itemMap = new Map(items.map((item) => [getId(item), item]));
  // map viewed ids to items, preserving view order
  const recent: T[] = [];
  for (const id of viewedIds) {
    const item = itemMap.get(id);
    if (item) recent.push(item);
  }
  // backfill with creation-date-sorted items if under limit
  if (recent.length < limit) {
    const recentIds = new Set(recent.map(getId));
    const fallback = sortByDateDesc(items, getDate);
    for (const item of fallback) {
      if (recent.length >= limit) break;
      if (!recentIds.has(getId(item))) recent.push(item);
    }
  }
  return recent;
}

async function loadDashData(userId: string | number) {
  // get table views by user
  const tableData = await getTableViewsByUserQuery(userId);
  // get all character sheets by user
  const charData = await get5eCharsGeneralByUserQuery(userId);
  // get shared character sheets by playerUser
  const playerUsersData = await getPlayerUsersQuery(userId);
  const sharedSheetIds = [
    ...new Set(
      playerUsersData.rows
        .map((playerUser) => Number(playerUser.player_id))
        .filter((playerId) => Number.isInteger(playerId) && playerId > 0),
    ),
  ];
  const sharedSheetsData = sharedSheetIds.length
    ? await get5eCharsGeneralByIdsQuery(sharedSheetIds)
    : { rows: [] };
  const sharedSheetsById = new Map(
    sharedSheetsData.rows.map((sheet) => [Number(sheet.id), sheet]),
  );
  const sharedCharData = playerUsersData.rows
    .map((playerUser) => sharedSheetsById.get(Number(playerUser.player_id)))
    .filter(Boolean);

  // created wyrlds
  const projectData = await getProjectsQuery(userId);
  // join wyrlds
  const projectUserData = await getProjectUsersQuery(userId);
  const sharedProjectIds = [
    ...new Set(
      projectUserData.rows
        .map((projectUser) => Number(projectUser.project_id))
        .filter((projectId) => Number.isInteger(projectId) && projectId > 0),
    ),
  ];
  const sharedProjectsData = sharedProjectIds.length
    ? await getProjectsByIdsQuery(sharedProjectIds)
    : { rows: [] };
  const sharedProjectsById = new Map(
    sharedProjectsData.rows.map((project) => [Number(project.id), project]),
  );
  const sharedProjectList = projectUserData.rows
    .map((projectUser) => sharedProjectsById.get(Number(projectUser.project_id)))
    .filter(Boolean);

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

  // query recently viewed entity_ids for each type in parallel
  const [rvTables, rvRecords, rvSheets, rvWyrlds] = await Promise.all([
    getRecentlyViewedByUser(userId, "table", RECENT_LIMIT),
    getRecentlyViewedByUser(userId, "record", RECENT_LIMIT),
    getRecentlyViewedByUser(userId, "sheet", RECENT_LIMIT),
    getRecentlyViewedByUser(userId, "wyrld", RECENT_LIMIT),
  ]);

  const allSheets = [...createdSheets, ...sharedSheets];
  const allWyrlds = [...createdWyrlds, ...sharedWyrlds];

  const recentTables = buildRecents(tables, rvTables.rows.map(r => r.entity_id), (t: any) => t.id, (t: any) => t.date_created, RECENT_LIMIT);
  const recentRecords = buildRecents(records, rvRecords.rows.map(r => r.entity_id), (r: any) => r.id, (r: any) => r.created_at, RECENT_LIMIT);
  const recentSheets = buildRecents(allSheets, rvSheets.rows.map(r => r.entity_id), (s: any) => s.id, (s: any) => s.created_at, RECENT_LIMIT);
  const recentWyrlds = buildRecents(allWyrlds, rvWyrlds.rows.map(r => r.entity_id), (w: any) => w.id, (w: any) => w.date_created, RECENT_LIMIT);

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
