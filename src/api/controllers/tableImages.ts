import {
  addTableImageByUserQuery,
  addTableImageByProjectQuery,
  removeTableImageQuery,
  editTableImageQuery,
  getTableImagesWithImageByProjectQuery,
  getTableImagesWithImageByUserQuery,
  TableImageWithImage,
} from "../queries/tableImages";
import { Request, Response, NextFunction } from "express";
import { getTableViewQuery } from "../queries/tableViews";
import { getSignedUrls } from "./s3";

async function addTableImageByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await addTableImageByProjectQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function addTableImageByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    req.body.user_id = req.session.user;
    const data = await addTableImageByUserQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

interface TableImageWithSignedUrl extends TableImageWithImage {
  src: string;
}

async function getTableImagesWithSignedUrlsByTableProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tableData = await getTableViewQuery(req.params.table_id);
    const data = await getTableImagesWithImageByProjectQuery(
      tableData.rows[0].project_id,
    );

    // Convert to Image format for getSignedUrls
    const images = data.rows.map((row) => ({
      id: row.image_id,
      file_name: row.file_name,
      original_name: row.original_name,
      size: row.size,
      notes: row.notes,
      is_blocked: row.is_blocked,
    }));

    // Get all signed URLs in batch
    const signedUrls = await getSignedUrls(images);

    // Attach signed URLs to each row
    const result: TableImageWithSignedUrl[] = data.rows.map((row) => ({
      ...row,
      src: signedUrls[row.image_id],
    }));

    res.send(result);
  } catch (err) {
    next(err);
  }
}

async function getTableImagesWithSignedUrlsByTableUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tableData = await getTableViewQuery(req.params.table_id);
    const data = await getTableImagesWithImageByUserQuery(
      tableData.rows[0].user_id,
    );

    // Convert to Image format for getSignedUrls
    const images = data.rows.map((row) => ({
      id: row.image_id,
      file_name: row.file_name,
      original_name: row.original_name,
      size: row.size,
      notes: row.notes,
      is_blocked: row.is_blocked,
    }));

    // Get all signed URLs in batch
    const signedUrls = await getSignedUrls(images);

    // Attach signed URLs to each row
    const result: TableImageWithSignedUrl[] = data.rows.map((row) => ({
      ...row,
      src: signedUrls[row.image_id],
    }));

    res.send(result);
  } catch (err) {
    next(err);
  }
}

async function removeTableImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await removeTableImageQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableImage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editTableImageQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getTableImagesWithSignedUrlsByTableProject,
  getTableImagesWithSignedUrlsByTableUser,
  addTableImageByUser,
  addTableImageByProject,
  removeTableImage,
  editTableImage,
};
