import {
  getTableViewsQuery,
  getTableViewQuery,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewQuery,
} from "../queries/tableViews.js";
import { Request, Response, NextFunction } from "express";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { getUserByIdQuery } from "../queries/users.js";

async function addTableView(req: Request, res: Response, next: NextFunction) {
  try {
    // check if user is pro
    const tableViewsData = await getTableViewsQuery(req.body.project_id);
    // limit to two campaigns
    if (tableViewsData.rows.length >= 5) {
      if (!req.session.user) throw new Error("User is not logged in");
      const { rows } = await getUserByIdQuery(req.session.user);
      if (!rows[0].is_pro)
        throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
    }

    const data = await addTableViewQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getTableViews(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getTableViewsQuery(req.params.project_id);

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
  getTableViews,
  getTableView,
  removeTableView,
  editTableView,
};
