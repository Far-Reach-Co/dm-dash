import { getProjectInviteQuery } from "../queries/projectInvites.js";
import {
  addProjectUserQuery,
  getProjectUserQuery,
  getProjectUserByUserAndProjectQuery,
  getProjectUsersByProjectQuery,
  removeProjectUserQuery,
  editProjectUserQuery,
} from "../queries/projectUsers.js";
import { getProjectQuery } from "../queries/projects.js";
import { UserModel, getUserByIdQuery } from "../queries/users.js";
import { Request, Response, NextFunction } from "express";

async function addProjectUserByInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");

    const inviteId = req.body.invite_id;
    const inviteData = await getProjectInviteQuery(inviteId);
    const invite = inviteData.rows[0];
    const projectData = await getProjectQuery(invite.project_id);
    const project = projectData.rows[0];
    if (project.user_id == req.session.user)
      throw new Error("You already own this wyrld");
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      req.session.user,
      project.id
    );
    if (projectUserData.rows.length)
      throw new Error("You are already a member of this wyrld");

    req.body.is_editor = false;
    req.body.user_id = req.session.user;
    req.body.project_id = project.id;

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
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getProjectUserByUserAndProjectQuery(
      req.session.user,
      req.params.project_id
    );
    res.status(200).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

interface GetProjectUsersByProjectReturnUserModel extends UserModel {
  project_user_id: number;
  is_editor: boolean;
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
      (user as GetProjectUsersByProjectReturnUserModel).project_user_id =
        projectUser.id;
      (user as GetProjectUsersByProjectReturnUserModel).is_editor =
        projectUser.is_editor;
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

async function editProjectUserIsEditor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // handle boolean from checkbox
    let is_editor = req.body.is_editor === "on";

    const data = await editProjectUserQuery(req.params.id, { is_editor });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addProjectUserByInvite,
  getProjectUserByUserAndProject,
  getProjectUsersByProject,
  removeProjectUser,
  editProjectUserIsEditor,
};
