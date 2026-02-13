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
import { getProjectQuery } from "../queries/projects.js";
import { logEventAsync, EventType } from "../../lib/eventLogger";

async function addTableViewByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");

    const tableViewsData = await getTableViewsByProjectQuery(
      req.params.project_id
    );
    if (tableViewsData.rows.length >= 10) {
      const projectData = await getProjectQuery(req.params.project_id);
      if (!projectData.rows[0].is_pro) {
        throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
      }
    }

    const data = await addTableViewByProjectQuery({
      title: req.body.title,
      project_id: req.params.project_id,
    });
    // Log table creation event
    logEventAsync({
      userId: req.session.user,
      projectId: req.params.project_id,
      eventType: EventType.TABLE_CREATED,
      eventData: { tableId: data.rows[0].id, title: req.body.title },
      req,
    });
    res.status(201).json({ redirect: `/wyrld?id=${req.params.project_id}` });
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
    const tableViewsData = await getTableViewsByUserQuery(req.session.user);
    if (tableViewsData.rows.length >= 10) {
      const userData = await getUserByIdQuery(req.session.user);
      if (!userData.rows[0].is_pro) {
        throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
      }
    }
    req.body.user_id = req.session.user;
    const data = await addTableViewByUserQuery(req.body);
    // Log table creation event
    logEventAsync({
      userId: req.session.user,
      eventType: EventType.TABLE_CREATED,
      eventData: { tableId: data.rows[0].id, title: req.body.title },
      req,
    });
    res.status(201).json({ redirect: "/dash" });
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

async function editTableView(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editTableViewQuery(req.params.id, req.body);
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
  editTableView,
};
