import {
  getTableViewsByProjectQuery,
  getTableViewQuery,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewQuery,
  addTableViewByUserQuery,
  getTableViewByUUIDQuery,
  getTableViewsByUserQuery,
} from "../queries/tableViews.js";
import { Request, Response, NextFunction } from "express";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { getUserByIdQuery } from "../queries/users.js";

async function addTableView(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addTableViewQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function addTableViewByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    req.body.user_id = req.session.user;
    await addTableViewByUserQuery(req.body);
    res.set("HX-Redirect", `/dash`).send("Form submission was successful.");
  } catch (err) {
    next(err);
  }
}

async function getTableViewsByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getTableViewsByProjectQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getTableViewsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getTableViewsByUserQuery(req.session.user);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getTableView(req: Request, res: Response, next: NextFunction) {
  try {
    const tableViewData = await getTableViewQuery(req.params.id);
    const tableView = tableViewData.rows[0];

    res.send(tableView);
  } catch (err) {
    next(err);
  }
}

async function getTableViewByUUID(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tableViewData = await getTableViewByUUIDQuery(req.params.uuid);
    const tableView = tableViewData.rows[0];

    res.send(tableView);
  } catch (err) {
    next(err);
  }
}

async function removeTableView(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await removeTableViewQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableView(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editTableViewQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addTableView,
  addTableViewByUser,
  getTableViewsByUser,
  getTableViewsByProject,
  getTableViewByUUID,
  getTableView,
  removeTableView,
  editTableView,
};
