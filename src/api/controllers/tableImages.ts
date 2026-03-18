import {
  addTableImageByUserQuery,
  addTableImageByProjectQuery,
  getTableImageByProjectAndImageQuery,
  getTableImageByUserAndImageQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery,
  getTableImagesWithImageByProjectQuery,
  getTableImagesWithImageByUserQuery,
  TableImageWithImage,
} from "../queries/tableImages";
import { Request, Response, NextFunction } from "express";
import { getSignedUrls } from "./s3";
import {
  requireApiUser,
  requireProjectEditorAccess,
} from "./accessControl";
import {
  badRequestError,
  ensureScopedResourceEditable,
  getOptionalTableEditAuth,
  requireProjectIdFromTable,
  requireTablePermissionById,
  requireUserIdFromTable,
  notFoundError,
} from "./tableResourceUtils";

function tableImageNotFoundError() {
  return notFoundError("Table image not found");
}

async function getTableImageByIdOrThrow(id: string | number) {
  const data = await getTableImageQuery(String(id));
  const tableImage = data.rows[0];
  if (!tableImage) throw tableImageNotFoundError();
  return tableImage;
}

async function getOptionalTableAuthForAssetMutation(req: Request) {
  return await getOptionalTableEditAuth(req, "canManageImageAssets");
}

async function addTableImageByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tableAuth = await getOptionalTableAuthForAssetMutation(req);
    if (tableAuth) {
      req.body.project_id = requireProjectIdFromTable(tableAuth.table);
    } else {
      if (!req.body.project_id) throw badRequestError("project_id is required");
      await requireProjectEditorAccess(req, req.body.project_id);
    }
    const existingData = await getTableImageByProjectAndImageQuery(
      req.body.project_id,
      req.body.image_id,
    );
    const existing = existingData.rows[0];
    if (existing) {
      res.status(200).json(existing);
      return;
    }

    try {
      const data = await addTableImageByProjectQuery(req.body);
      res.status(201).json(data.rows[0]);
    } catch (err: any) {
      if (err?.code === "23505") {
        const retryData = await getTableImageByProjectAndImageQuery(
          req.body.project_id,
          req.body.image_id,
        );
        const retryExisting = retryData.rows[0];
        if (retryExisting) {
          res.status(200).json(retryExisting);
          return;
        }
      }
      throw err;
    }
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
    const userId = requireApiUser(req);
    const tableAuth = await getOptionalTableAuthForAssetMutation(req);
    if (tableAuth) {
      req.body.user_id = requireUserIdFromTable(tableAuth.table);
    } else {
      req.body.user_id = userId;
    }
    const existingData = await getTableImageByUserAndImageQuery(
      req.body.user_id,
      req.body.image_id,
    );
    const existing = existingData.rows[0];
    if (existing) {
      res.status(200).json(existing);
      return;
    }

    try {
      const data = await addTableImageByUserQuery(req.body);
      res.status(201).json(data.rows[0]);
    } catch (err: any) {
      if (err?.code === "23505") {
        const retryData = await getTableImageByUserAndImageQuery(
          req.body.user_id,
          req.body.image_id,
        );
        const retryExisting = retryData.rows[0];
        if (retryExisting) {
          res.status(200).json(retryExisting);
          return;
        }
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

interface TableImageWithSignedUrl extends TableImageWithImage {
  src: string;
}

type ImageForSignedUrl = {
  id: number;
  file_name: string;
  original_name: string;
  size: number;
  notes: string;
  is_blocked: boolean;
};

function toSignedUrlInput(rows: TableImageWithImage[]): ImageForSignedUrl[] {
  return rows.map((row) => ({
    id: row.image_id,
    file_name: row.file_name,
    original_name: row.original_name,
    size: row.size,
    notes: row.notes,
    is_blocked: row.is_blocked,
  }));
}

function withSignedUrls(
  rows: TableImageWithImage[],
  signedUrls: Record<string, string>,
): TableImageWithSignedUrl[] {
  return rows.map((row) => ({
    ...row,
    src: signedUrls[row.image_id],
  }));
}

async function getTableImagesWithSignedUrlsByTableProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { table: tableData } = await requireTablePermissionById(
      req,
      req.params.table_id,
      "view",
    );
    const projectId = requireProjectIdFromTable(tableData, "table_id");
    const data = await getTableImagesWithImageByProjectQuery(projectId);

    const signedUrls = await getSignedUrls(toSignedUrlInput(data.rows));
    const result = withSignedUrls(data.rows, signedUrls);

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
    const { table: tableData } = await requireTablePermissionById(
      req,
      req.params.table_id,
      "view",
    );
    const userId = requireUserIdFromTable(tableData, "table_id");
    const data = await getTableImagesWithImageByUserQuery(userId);

    const signedUrls = await getSignedUrls(toSignedUrlInput(data.rows));
    const result = withSignedUrls(data.rows, signedUrls);

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
    const tableImage = await getTableImageByIdOrThrow(req.params.id);
    const tableAuth = await getOptionalTableAuthForAssetMutation(req);
    await ensureScopedResourceEditable(req, tableImage, tableAuth);
    await removeTableImageQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableImage(req: Request, res: Response, next: NextFunction) {
  try {
    const tableImage = await getTableImageByIdOrThrow(req.params.id);
    const tableAuth = await getOptionalTableAuthForAssetMutation(req);
    await ensureScopedResourceEditable(req, tableImage, tableAuth);
    const payload: Record<string, unknown> = {};
    if (typeof req.body.folder_id !== "undefined") {
      payload.folder_id = req.body.folder_id;
    }
    if (!Object.keys(payload).length) {
      throw badRequestError("No editable fields supplied");
    }
    const data = await editTableImageQuery(req.params.id, payload);
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
