import {
  getTableViewsQuery,
  getTableViewQuery,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewQuery,
} from "../queries/tableViews.js";

import { getProjectQuery } from "../queries/projects.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers.js";

async function addTableView(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    const data = await addTableViewQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getTableViews(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getTableViewsQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeTableView(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get clock to get project id
    const tableViewData = await getTableViewQuery(req.params.id);
    const tableView = tableViewData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(tableView.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    await removeTableViewQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableView(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get clock to get project id
    const tableViewData = await getTableViewQuery(req.params.id);
    const tableView = tableViewData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(tableView.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }
    const data = await editTableViewQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addTableView,
  getTableViews,
  removeTableView,
  editTableView,
};
