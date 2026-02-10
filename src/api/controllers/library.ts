import {
  getTableImagesWithImageByUserPaginatedQuery,
  getTableImagesWithImageByProjectPaginatedQuery,
  getTableImageCountByUserQuery,
  getTableImageCountByProjectQuery,
  getTableImagesWithImageByUserInFolderQuery,
  getTableImagesWithImageByProjectInFolderQuery,
  getTableImageCountsByUserQuery,
  getTableImageCountsByProjectQuery,
  TableImageWithImage,
} from "../queries/tableImages";
import { Request, Response, NextFunction } from "express";
import { getSignedUrls } from "./s3";

interface TableImageWithSignedUrl extends TableImageWithImage {
  src: string;
}

async function getLibraryImagesByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [data, countData] = await Promise.all([
      getTableImagesWithImageByUserPaginatedQuery(req.session.user, limit, offset),
      getTableImageCountByUserQuery(req.session.user),
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
    if (!req.session.user) throw new Error("User is not logged in");

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [data, countData] = await Promise.all([
      getTableImagesWithImageByProjectPaginatedQuery(req.params.project_id, limit, offset),
      getTableImageCountByProjectQuery(req.params.project_id),
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
    if (!req.session.user) throw new Error("User is not logged in");

    const folderParam = req.params.folder_id;
    const parsedFolderId = parseInt(folderParam);
    const folderId =
      folderParam === "unsorted" || Number.isNaN(parsedFolderId)
        ? null
        : parsedFolderId;

    const data = await getTableImagesWithImageByUserInFolderQuery(
      req.session.user,
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
    if (!req.session.user) throw new Error("User is not logged in");

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
    if (!req.session.user) throw new Error("User is not logged in");

    const countsData = await getTableImageCountsByUserQuery(req.session.user);
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
    if (!req.session.user) throw new Error("User is not logged in");

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
