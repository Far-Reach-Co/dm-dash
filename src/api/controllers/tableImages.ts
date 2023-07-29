import {
  addTableImageByUserQuery,
  addTableImageByProjectQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery,
  getTableImagesByUserQuery,
  getTableImagesByProjectQuery,
} from "../queries/tableImages";
import { Request, Response, NextFunction } from "express";
import { getTableViewQuery } from "../queries/tableViews";

async function addTableImageByProject(
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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

async function getTableImagesByTableUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tableData = await getTableViewQuery(req.params.table_id);
    const data = await getTableImagesByUserQuery(tableData.rows[0].user_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getTableImagesByTableProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tableData = await getTableViewQuery(req.params.table_id);
    const data = await getTableImagesByProjectQuery(
      tableData.rows[0].project_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeTableImage(
  req: Request,
  res: Response,
  next: NextFunction
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
  getTableImagesByTableUser,
  getTableImagesByTableProject,
  addTableImageByUser,
  addTableImageByProject,
  removeTableImage,
  editTableImage,
};
