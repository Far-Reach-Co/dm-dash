import {
  getTableViewsByProjectQuery,
  getTableViewQuery,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewByProjectQuery,
  addTableViewByUserQuery,
  getTableViewByUUIDQuery,
  getTableViewsByUserQuery,
} from "../queries/tableViews.js";
import { Request, Response, NextFunction } from "express";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { getUserByIdQuery } from "../queries/users.js";

async function addTableViewByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");

    await addTableViewByProjectQuery({
      title: req.body.title,
      project_id: req.params.project_id,
    });
    res
      .set("HX-Redirect", `/wyrld?id=${req.params.project_id}`)
      .send("Form submission was successful.");
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

async function editTableViewData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await editTableViewQuery(req.params.id, {
      data: req.body.data,
    });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editTableViewTitle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await editTableViewQuery(req.params.id, {
      title: req.body.title,
    });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addTableViewByProject,
  addTableViewByUser,
  getTableViewsByUser,
  getTableViewsByProject,
  getTableViewByUUID,
  getTableView,
  removeTableView,
  editTableViewData,
  editTableViewTitle,
};
