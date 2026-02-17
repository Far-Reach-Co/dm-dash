import {
  addTableFolderByUserQuery,
  addTableFolderByProjectQuery,
  getTableFoldersByUserQuery,
  getTableFoldersByProjectQuery,
  getTableFolderQuery,
  removeTableFolderQuery,
  editTableFolderQuery,
  getTableFoldersByParentQuery,
} from "../queries/tableFolders";
import { Request, Response, NextFunction } from "express";
import {
  editTableImageQuery,
  getTableImagesByFolderQuery,
} from "../queries/tableImages";
import { getTableViewQuery } from "../queries/tableViews";
import { getProjectAccess, requireUser } from "../../lib/authz";
import {
  assertTableCapability,
  requireTablePermission,
} from "../../lib/tableAuthz";

function forbiddenError() {
  const err: any = new Error("Forbidden");
  err.status = 403;
  return err;
}

function badRequestError(message: string) {
  const err: any = new Error(message);
  err.status = 400;
  return err;
}

function notFoundError(message: string) {
  const err: any = new Error(message);
  err.status = 404;
  return err;
}

async function getTableViewByIdOrThrow(id: string | number) {
  const tableData = await getTableViewQuery(id);
  const table = tableData.rows[0];
  if (!table) throw notFoundError("Table view not found");
  return table;
}

async function getFolderByIdOrThrow(id: string | number) {
  const folderData = await getTableFolderQuery(String(id));
  const folder = folderData.rows[0];
  if (!folder) throw notFoundError("Folder not found");
  return folder;
}

async function ensureFolderEditable(req: Request, folder: any) {
  if (folder.project_id) {
    const access = await getProjectAccess(req, folder.project_id);
    if (!access?.isEditor) throw forbiddenError();
    return;
  }
  const userId = requireUser(req);
  if (String(folder.user_id) !== String(userId)) throw forbiddenError();
}

async function ensureProjectEditor(req: Request, projectId: string | number) {
  if (!projectId) throw badRequestError("project_id is required");
  const access = await getProjectAccess(req, projectId);
  if (!access?.isEditor) throw forbiddenError();
}

async function getOptionalTableAuthForFolderMutation(req: Request) {
  const tableViewIdRaw =
    req.body?.table_view_id ??
    req.query?.table_view_id;
  if (typeof tableViewIdRaw === "undefined") return null;
  const tableViewId = Number(tableViewIdRaw);
  if (Number.isNaN(tableViewId) || tableViewId <= 0) {
    throw badRequestError("table_view_id must be a valid number");
  }
  const table = await getTableViewByIdOrThrow(tableViewId);
  const auth = await requireTablePermission(req, table, "edit");
  assertTableCapability(auth, "canManageFolders");
  return { table, auth };
}

async function addTableFolderByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await getOptionalTableAuthForFolderMutation(req);
    await ensureProjectEditor(req, req.body.project_id);
    const data = await addTableFolderByProjectQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function addTableFolderByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw { message: "User is not logged in" };
    await getOptionalTableAuthForFolderMutation(req);
    req.body.user_id = req.session.user;

    const data = await addTableFolderByUserQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getTableFoldersByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const access = await getProjectAccess(req, req.params.project_id);
    if (!access) throw forbiddenError();
    const data = await getTableFoldersByProjectQuery(req.params.project_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getTableFoldersByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireUser(req);
    const data = await getTableFoldersByUserQuery(userId);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeTableFolder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await getOptionalTableAuthForFolderMutation(req);
    // get folder data
    const folder = await getFolderByIdOrThrow(req.params.id);
    await ensureFolderEditable(req, folder);
    // remove table images folder_id or replace with parent folder id
    const tableImages = await getTableImagesByFolderQuery(req.params.id);
    for (const tableImage of tableImages.rows) {
      await editTableImageQuery(tableImage.id, {
        folder_id: folder.parent_folder_id,
      });
    }
    // remove all sub folders and do the same tasks to the table images
    const subFoldersData = await getTableFoldersByParentQuery(req.params.id);
    for (const subFolder of subFoldersData.rows) {
      const subFolderTableImages = await getTableImagesByFolderQuery(
        subFolder.id
      );
      for (const subTableImage of subFolderTableImages.rows) {
        await editTableImageQuery(subTableImage.id, {
          folder_id: folder.parent_folder_id,
        });
      }

      await removeTableFolderQuery(subFolder.id);
    }
    // remove
    await removeTableFolderQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableFolderTitle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await getOptionalTableAuthForFolderMutation(req);
    const folder = await getFolderByIdOrThrow(req.params.id);
    await ensureFolderEditable(req, folder);
    const data = await editTableFolderQuery(req.params.id, {
      title: req.body.title,
    });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getTableFoldersByProject,
  getTableFoldersByUser,
  addTableFolderByProject,
  addTableFolderByUser,
  removeTableFolder,
  editTableFolderTitle,
};
