import {
  addTableImageByUserQuery,
  addTableImageByProjectQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery,
  getTableImagesWithImageByProjectQuery,
  getTableImagesWithImageByUserQuery,
  TableImageWithImage,
} from "../queries/tableImages";
import { Request, Response, NextFunction } from "express";
import { getTableViewQuery } from "../queries/tableViews";
import { getSignedUrls } from "./s3";
import { requireProjectEditor, requireUser } from "../../lib/authz";
import {
  assertTableCapability,
  requireTablePermission,
} from "../../lib/tableAuthz";

function badRequest(message: string) {
  const err: any = new Error(message);
  err.status = 400;
  return err;
}

function tableNotFoundError() {
  const err: any = new Error("Table view not found");
  err.status = 404;
  return err;
}

function tableImageNotFoundError() {
  const err: any = new Error("Table image not found");
  err.status = 404;
  return err;
}

function forbiddenError(message = "Forbidden") {
  const err: any = new Error(message);
  err.status = 403;
  return err;
}

async function getTableViewByIdOrThrow(id: string | number) {
  const data = await getTableViewQuery(id);
  const table = data.rows[0];
  if (!table) throw tableNotFoundError();
  return table;
}

async function getTableImageByIdOrThrow(id: string | number) {
  const data = await getTableImageQuery(String(id));
  const tableImage = data.rows[0];
  if (!tableImage) throw tableImageNotFoundError();
  return tableImage;
}

async function getOptionalTableAuthForAssetMutation(req: Request) {
  const tableViewIdRaw =
    req.body?.table_view_id ??
    req.query?.table_view_id;
  if (typeof tableViewIdRaw === "undefined") return null;

  const tableViewId = Number(tableViewIdRaw);
  if (Number.isNaN(tableViewId) || tableViewId <= 0) {
    throw badRequest("table_view_id must be a valid number");
  }
  const table = await getTableViewByIdOrThrow(tableViewId);
  const auth = await requireTablePermission(req, table, "edit");
  assertTableCapability(auth, "canManageImageAssets");
  return { table, auth };
}

async function ensureTableImageEditable(
  req: Request,
  tableImage: {
    project_id?: string | number | null;
    user_id?: string | number | null;
  },
  tableAuth: {
    table: { project_id?: string | number | null; user_id?: string | number | null };
  } | null,
) {
  if (tableAuth) {
    if (tableImage.project_id) {
      if (
        String(tableImage.project_id) !== String(tableAuth.table.project_id)
      ) {
        throw forbiddenError();
      }
      return;
    }
    if (tableImage.user_id) {
      if (String(tableImage.user_id) !== String(tableAuth.table.user_id)) {
        throw forbiddenError();
      }
      return;
    }
    throw forbiddenError();
  }

  if (tableImage.project_id) {
    await requireProjectEditor(req, tableImage.project_id);
    return;
  }

  if (tableImage.user_id) {
    const userId = requireUser(req);
    if (String(tableImage.user_id) !== String(userId)) throw forbiddenError();
    return;
  }

  throw forbiddenError();
}

async function addTableImageByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tableAuth = await getOptionalTableAuthForAssetMutation(req);
    if (tableAuth) {
      if (!tableAuth.table.project_id) {
        throw badRequest("table_view_id is not a project table");
      }
      req.body.project_id = tableAuth.table.project_id;
    } else {
      if (!req.body.project_id) throw badRequest("project_id is required");
      await requireProjectEditor(req, req.body.project_id);
    }
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
    const tableAuth = await getOptionalTableAuthForAssetMutation(req);
    if (tableAuth) {
      if (!tableAuth.table.user_id) {
        throw badRequest("table_view_id is not a user table");
      }
      req.body.user_id = tableAuth.table.user_id;
    } else {
      req.body.user_id = req.session.user;
    }
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
    const tableData = await getTableViewByIdOrThrow(req.params.table_id);
    await requireTablePermission(req, tableData, "view");
    if (!tableData.project_id) {
      throw badRequest("table_id is not a project table");
    }
    const data = await getTableImagesWithImageByProjectQuery(
      tableData.project_id,
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
    const tableData = await getTableViewByIdOrThrow(req.params.table_id);
    await requireTablePermission(req, tableData, "view");
    if (!tableData.user_id) {
      throw badRequest("table_id is not a user table");
    }
    const data = await getTableImagesWithImageByUserQuery(
      tableData.user_id,
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
    const tableImage = await getTableImageByIdOrThrow(req.params.id);
    const tableAuth = await getOptionalTableAuthForAssetMutation(req);
    await ensureTableImageEditable(req, tableImage, tableAuth);
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
    await ensureTableImageEditable(req, tableImage, tableAuth);
    const payload: Record<string, unknown> = {};
    if (typeof req.body.folder_id !== "undefined") {
      payload.folder_id = req.body.folder_id;
    }
    if (!Object.keys(payload).length) {
      throw badRequest("No editable fields supplied");
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
