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
import {
  requireApiUser,
  requireProjectEditorAccess,
  requireProjectMemberAccess,
} from "./accessControl";
import {
  badRequestError,
  assertProjectIdMatchesTable,
  ensureScopedResourceEditable,
  getOptionalTableEditAuth,
  notFoundError,
  parsePositiveInt,
  requireProjectIdFromTable,
  requireTablePermissionById,
  requireUserIdFromTable,
} from "./tableResourceUtils";

async function getFolderByIdOrThrow(id: string | number) {
  const folderData = await getTableFolderQuery(String(id));
  const folder = folderData.rows[0];
  if (!folder) throw notFoundError("Folder not found");
  return folder;
}

async function getOptionalTableAuthForFolderMutation(req: Request) {
  return await getOptionalTableEditAuth(req, "canManageFolders");
}

async function addTableFolderByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tableAuth = await getOptionalTableAuthForFolderMutation(req);
    if (tableAuth) {
      const tableProjectId = requireProjectIdFromTable(tableAuth.table);
      if (typeof req.body.project_id !== "undefined") {
        assertProjectIdMatchesTable(req.body.project_id, tableProjectId);
      }
      req.body.project_id = tableProjectId;
    } else {
      if (!req.body.project_id) throw badRequestError("project_id is required");
      await requireProjectEditorAccess(req, req.body.project_id);
    }
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
    const userId = requireApiUser(req);
    const tableAuth = await getOptionalTableAuthForFolderMutation(req);
    if (tableAuth) {
      req.body.user_id = requireUserIdFromTable(tableAuth.table);
    } else {
      req.body.user_id = userId;
    }

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
    await requireProjectMemberAccess(req, req.params.project_id);
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
    const tableViewId = parsePositiveInt(req.query.table_view_id, "table_view_id", {
      required: false,
    });
    const userId =
      tableViewId === null
        ? requireApiUser(req)
        : requireUserIdFromTable(
            (await requireTablePermissionById(req, tableViewId, "view")).table,
          );
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
    const tableAuth = await getOptionalTableAuthForFolderMutation(req);
    // get folder data
    const folder = await getFolderByIdOrThrow(req.params.id);
    await ensureScopedResourceEditable(req, folder, tableAuth);
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
    const tableAuth = await getOptionalTableAuthForFolderMutation(req);
    const folder = await getFolderByIdOrThrow(req.params.id);
    await ensureScopedResourceEditable(req, folder, tableAuth);
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
