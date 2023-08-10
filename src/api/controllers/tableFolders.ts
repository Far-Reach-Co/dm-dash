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

async function addTableFolderByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
    if (!req.session.user) throw { message: "User is not logged in" };
    const data = await getTableFoldersByUserQuery(req.session.user);
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
    // get folder data
    const folderData = await getTableFolderQuery(req.params.id);
    const folder = folderData.rows[0];
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
