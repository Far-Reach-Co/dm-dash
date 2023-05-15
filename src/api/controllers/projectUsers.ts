import {
  addProjectUserQuery,
  getProjectUserQuery,
  getProjectUserByUserAndProjectQuery,
  getProjectUsersByProjectQuery,
  removeProjectUserQuery,
  editProjectUserQuery,
} from "../queries/projectUsers.js";
import { getUserByIdQuery } from "../queries/users.js";
import { Request, Response, NextFunction } from "express";

async function addProjectUser(req: Request, res: Response, next: NextFunction) {
  try {
    req.body.is_editor = false;
    req.body.user_id = req.user.id;
    const data = await addProjectUserQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectUserByUserAndProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getProjectUserByUserAndProjectQuery(
      req.user.id,
      req.params.project_id
    );
    res.status(200).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectUsersByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectUsersData = await getProjectUsersByProjectQuery(
      req.params.project_id
    );

    const usersList = [];

    for (const projectUser of projectUsersData.rows) {
      const userData = await getUserByIdQuery(projectUser.user_id);
      const user = userData.rows[0];
      user.project_user_id = projectUser.id;
      user.is_editor = projectUser.is_editor;
      usersList.push(user);
    }

    res.status(200).json(usersList);
  } catch (err) {
    next(err);
  }
}

async function removeProjectUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await removeProjectUserQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProjectUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await editProjectUserQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addProjectUser,
  getProjectUserByUserAndProject,
  getProjectUsersByProject,
  removeProjectUser,
  editProjectUser,
};
