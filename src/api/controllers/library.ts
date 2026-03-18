import {
  getTableImagesWithImageByUserPaginatedQuery,
  getTableImagesWithImageByProjectPaginatedQuery,
  getTableImagesWithImageByUserInFolderQuery,
  getTableImagesWithImageByProjectInFolderQuery,
  getTableImageCountsByUserQuery,
  getTableImageCountsByProjectQuery,
  getTableImageCountByUserFilteredQuery,
  getTableImageCountByProjectFilteredQuery,
  TableImageWithImage,
} from "../queries/tableImages";
import { Request, Response, NextFunction } from "express";
import { getSignedUrls } from "./s3";
import { requireApiUser, requireProjectMemberAccess } from "./accessControl";
import {
  parsePositiveInt,
  requireTablePermissionById,
  requireUserIdFromTable,
} from "./tableResourceUtils";

interface TableImageWithSignedUrl extends TableImageWithImage {
  src: string;
}

type LibraryScope =
  | { kind: "user"; ownerId: string | number }
  | { kind: "project"; ownerId: string | number };

type LibraryListParams = {
  limit: number;
  offset: number;
  q: string | null;
  sort: "newest" | "name" | "size";
  folderId: number | null | undefined;
};

type LibraryCountRow = {
  folder_id: number | null;
  count: number;
};

async function resolveLibraryUserId(req: Request) {
  const tableViewId = parsePositiveInt(req.query.table_view_id, "table_view_id", {
    required: false,
  });
  if (tableViewId === null) {
    return requireApiUser(req);
  }
  const { table } = await requireTablePermissionById(req, tableViewId, "view");
  return requireUserIdFromTable(table);
}

async function resolveUserLibraryScope(req: Request): Promise<LibraryScope> {
  return {
    kind: "user",
    ownerId: await resolveLibraryUserId(req),
  };
}

async function resolveProjectLibraryScope(req: Request): Promise<LibraryScope> {
  await requireProjectMemberAccess(req, req.params.project_id);
  return {
    kind: "project",
    ownerId: req.params.project_id,
  };
}

function parseLibraryFolderId(
  rawFolderId: unknown,
  { allowUndefined = true }: { allowUndefined?: boolean } = {},
) {
  if (typeof rawFolderId === "undefined") {
    return allowUndefined ? undefined : null;
  }

  const folderValue = String(rawFolderId);
  const parsedFolderId = parseInt(folderValue, 10);
  if (folderValue === "unsorted" || Number.isNaN(parsedFolderId)) {
    return null;
  }

  return parsedFolderId;
}

function parseLibraryListParams(query: Request["query"]): LibraryListParams {
  const limit = Math.min(parseInt(String(query.limit || 50), 10) || 50, 100);
  const offset = parseInt(String(query.offset || 0), 10) || 0;
  const rawSort = String(query.sort || "name");
  return {
    limit,
    offset,
    q: typeof query.q === "string" && query.q.length ? query.q : null,
    sort:
      rawSort === "newest" || rawSort === "size" ? rawSort : "name",
    folderId: parseLibraryFolderId(query.folder_id),
  };
}

function mapRowsToImages(rows: TableImageWithImage[]) {
  return rows.map((row) => ({
    id: row.image_id,
    file_name: row.file_name,
    original_name: row.original_name,
    size: row.size,
    notes: row.notes,
    is_blocked: row.is_blocked,
  }));
}

async function attachSignedUrlsToTableImages(
  rows: TableImageWithImage[],
): Promise<TableImageWithSignedUrl[]> {
  const signedUrls = await getSignedUrls(mapRowsToImages(rows));
  return rows.map((row) => ({
    ...row,
    src: signedUrls[row.image_id],
  }));
}

async function getPaginatedLibraryImageRows(
  scope: LibraryScope,
  params: LibraryListParams,
) {
  if (scope.kind === "project") {
    const [data, countData] = await Promise.all([
      getTableImagesWithImageByProjectPaginatedQuery(scope.ownerId, params),
      getTableImageCountByProjectFilteredQuery(scope.ownerId, {
        q: params.q,
        folderId: params.folderId,
      }),
    ]);
    return {
      rows: data.rows,
      total: parseInt(countData.rows[0].count, 10),
    };
  }

  const [data, countData] = await Promise.all([
    getTableImagesWithImageByUserPaginatedQuery(scope.ownerId, params),
    getTableImageCountByUserFilteredQuery(scope.ownerId, {
      q: params.q,
      folderId: params.folderId,
    }),
  ]);
  return {
    rows: data.rows,
    total: parseInt(countData.rows[0].count, 10),
  };
}

async function getFolderLibraryImageRows(
  scope: LibraryScope,
  folderId: number | null,
) {
  if (scope.kind === "project") {
    return (
      await getTableImagesWithImageByProjectInFolderQuery(scope.ownerId, folderId)
    ).rows;
  }

  return (await getTableImagesWithImageByUserInFolderQuery(scope.ownerId, folderId))
    .rows;
}

async function getLibraryCountRows(scope: LibraryScope) {
  if (scope.kind === "project") {
    return (await getTableImageCountsByProjectQuery(scope.ownerId)).rows;
  }
  return (await getTableImageCountsByUserQuery(scope.ownerId)).rows;
}

function buildLibraryCountsResponse(rows: LibraryCountRow[]) {
  const by_folder: Record<string, number> = {};
  let total = 0;
  let unsorted = 0;

  for (const row of rows) {
    total += row.count;
    if (row.folder_id === null) {
      unsorted = row.count;
    } else {
      by_folder[String(row.folder_id)] = row.count;
    }
  }

  return { total, unsorted, by_folder };
}

async function getLibraryImagesByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scope = await resolveUserLibraryScope(req);
    const params = parseLibraryListParams(req.query);
    const { rows, total } = await getPaginatedLibraryImageRows(scope, params);
    const result = await attachSignedUrlsToTableImages(rows);

    res.send({
      images: result,
      total,
      limit: params.limit,
      offset: params.offset,
    });
  } catch (err) {
    next(err);
  }
}

async function getLibraryImagesByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scope = await resolveProjectLibraryScope(req);
    const params = parseLibraryListParams(req.query);
    const { rows, total } = await getPaginatedLibraryImageRows(scope, params);
    const result = await attachSignedUrlsToTableImages(rows);

    res.send({
      images: result,
      total,
      limit: params.limit,
      offset: params.offset,
    });
  } catch (err) {
    next(err);
  }
}

async function getLibraryImagesByUserInFolder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scope = await resolveUserLibraryScope(req);
    const folderId =
      parseLibraryFolderId(req.params.folder_id, {
        allowUndefined: false,
      }) ?? null;
    const rows = await getFolderLibraryImageRows(scope, folderId);
    const result = await attachSignedUrlsToTableImages(rows);

    res.send({
      images: result,
      total: result.length,
      limit: result.length,
      offset: 0,
    });
  } catch (err) {
    next(err);
  }
}

async function getLibraryImagesByProjectInFolder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scope = await resolveProjectLibraryScope(req);
    const folderId =
      parseLibraryFolderId(req.params.folder_id, {
        allowUndefined: false,
      }) ?? null;
    const rows = await getFolderLibraryImageRows(scope, folderId);
    const result = await attachSignedUrlsToTableImages(rows);

    res.send({
      images: result,
      total: result.length,
      limit: result.length,
      offset: 0,
    });
  } catch (err) {
    next(err);
  }
}

async function getLibraryImageCountsByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scope = await resolveUserLibraryScope(req);
    const rows = await getLibraryCountRows(scope);
    res.send(buildLibraryCountsResponse(rows));
  } catch (err) {
    next(err);
  }
}

async function getLibraryImageCountsByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scope = await resolveProjectLibraryScope(req);
    const rows = await getLibraryCountRows(scope);
    res.send(buildLibraryCountsResponse(rows));
  } catch (err) {
    next(err);
  }
}

export {
  getLibraryImagesByUser,
  getLibraryImagesByProject,
  getLibraryImagesByUserInFolder,
  getLibraryImagesByProjectInFolder,
  getLibraryImageCountsByUser,
  getLibraryImageCountsByProject,
};
