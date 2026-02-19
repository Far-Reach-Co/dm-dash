import {
  getTableImagesWithImageByUserPaginatedQuery,
  getTableImagesWithImageByProjectPaginatedQuery,
  getTableImageCountByUserQuery,
  getTableImageCountByProjectQuery,
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

async function getLibraryImagesByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await resolveLibraryUserId(req);

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const q = (req.query.q as string) || null;
    const sort = (req.query.sort as string) || "name";
    const folderParam = req.query.folder_id as string | undefined;
    const parsedFolderId = folderParam ? parseInt(folderParam) : NaN;
    const folderId =
      typeof folderParam === "undefined"
        ? undefined
        : folderParam === "unsorted" || Number.isNaN(parsedFolderId)
          ? null
          : parsedFolderId;

    const [data, countData] = await Promise.all([
      getTableImagesWithImageByUserPaginatedQuery(userId, {
        limit,
        offset,
        q,
        sort: sort as "newest" | "name" | "size",
        folderId,
      }),
      getTableImageCountByUserFilteredQuery(userId, { q, folderId }),
    ]);

    const images = data.rows.map((row) => ({
      id: row.image_id,
      file_name: row.file_name,
      original_name: row.original_name,
      size: row.size,
      notes: row.notes,
      is_blocked: row.is_blocked,
    }));

    const signedUrls = await getSignedUrls(images);

    const result: TableImageWithSignedUrl[] = data.rows.map((row) => ({
      ...row,
      src: signedUrls[row.image_id],
    }));

    res.send({
      images: result,
      total: parseInt(countData.rows[0].count),
      limit,
      offset,
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
    await requireProjectMemberAccess(req, req.params.project_id);

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const q = (req.query.q as string) || null;
    const sort = (req.query.sort as string) || "name";
    const folderParam = req.query.folder_id as string | undefined;
    const parsedFolderId = folderParam ? parseInt(folderParam) : NaN;
    const folderId =
      typeof folderParam === "undefined"
        ? undefined
        : folderParam === "unsorted" || Number.isNaN(parsedFolderId)
          ? null
          : parsedFolderId;

    const [data, countData] = await Promise.all([
      getTableImagesWithImageByProjectPaginatedQuery(req.params.project_id, {
        limit,
        offset,
        q,
        sort: sort as "newest" | "name" | "size",
        folderId,
      }),
      getTableImageCountByProjectFilteredQuery(req.params.project_id, {
        q,
        folderId,
      }),
    ]);

    const images = data.rows.map((row) => ({
      id: row.image_id,
      file_name: row.file_name,
      original_name: row.original_name,
      size: row.size,
      notes: row.notes,
      is_blocked: row.is_blocked,
    }));

    const signedUrls = await getSignedUrls(images);

    const result: TableImageWithSignedUrl[] = data.rows.map((row) => ({
      ...row,
      src: signedUrls[row.image_id],
    }));

    res.send({
      images: result,
      total: parseInt(countData.rows[0].count),
      limit,
      offset,
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
    const userId = await resolveLibraryUserId(req);

    const folderParam = req.params.folder_id;
    const parsedFolderId = parseInt(folderParam);
    const folderId =
      folderParam === "unsorted" || Number.isNaN(parsedFolderId)
        ? null
        : parsedFolderId;

    const data = await getTableImagesWithImageByUserInFolderQuery(
      userId,
      folderId
    );

    const images = data.rows.map((row) => ({
      id: row.image_id,
      file_name: row.file_name,
      original_name: row.original_name,
      size: row.size,
      notes: row.notes,
      is_blocked: row.is_blocked,
    }));

    const signedUrls = await getSignedUrls(images);

    const result: TableImageWithSignedUrl[] = data.rows.map((row) => ({
      ...row,
      src: signedUrls[row.image_id],
    }));

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
    await requireProjectMemberAccess(req, req.params.project_id);

    const folderParam = req.params.folder_id;
    const parsedFolderId = parseInt(folderParam);
    const folderId =
      folderParam === "unsorted" || Number.isNaN(parsedFolderId)
        ? null
        : parsedFolderId;

    const data = await getTableImagesWithImageByProjectInFolderQuery(
      req.params.project_id,
      folderId
    );

    const images = data.rows.map((row) => ({
      id: row.image_id,
      file_name: row.file_name,
      original_name: row.original_name,
      size: row.size,
      notes: row.notes,
      is_blocked: row.is_blocked,
    }));

    const signedUrls = await getSignedUrls(images);

    const result: TableImageWithSignedUrl[] = data.rows.map((row) => ({
      ...row,
      src: signedUrls[row.image_id],
    }));

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
    const userId = await resolveLibraryUserId(req);

    const countsData = await getTableImageCountsByUserQuery(userId);
    const by_folder: Record<string, number> = {};
    let total = 0;
    let unsorted = 0;

    for (const row of countsData.rows) {
      total += row.count;
      if (row.folder_id === null) {
        unsorted = row.count;
      } else {
        by_folder[String(row.folder_id)] = row.count;
      }
    }

    res.send({ total, unsorted, by_folder });
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
    await requireProjectMemberAccess(req, req.params.project_id);

    const countsData = await getTableImageCountsByProjectQuery(
      req.params.project_id
    );
    const by_folder: Record<string, number> = {};
    let total = 0;
    let unsorted = 0;

    for (const row of countsData.rows) {
      total += row.count;
      if (row.folder_id === null) {
        unsorted = row.count;
      } else {
        by_folder[String(row.folder_id)] = row.count;
      }
    }

    res.send({ total, unsorted, by_folder });
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
