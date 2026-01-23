import {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  removeProjectQuery,
  editProjectQuery,
  Project,
} from "../queries/projects.js";
import {
  ProjectInvite,
  getProjectInviteByProjectQuery,
} from "../queries/projectInvites.js";
import {
  getProjectUsersQuery,
  getProjectUserByUserAndProjectQuery,
} from "../queries/projectUsers.js";
import { getImageQuery } from "../queries/images.js";
import { removeImageFromBucket } from "./s3.js";
import {
  addTableViewByProjectQuery,
  getTableViewsByProjectQuery,
  removeTableViewQuery,
} from "../queries/tableViews.js";
import {
  getTableImagesByProjectQuery,
  removeTableImageQuery,
} from "../queries/tableImages.js";
import { Request, Response, NextFunction } from "express";
import { getUserByIdQuery } from "../queries/users.js";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { logEventAsync, EventType } from "../../lib/eventLogger";

interface addProjectRequest extends Request {
  body: {
    title: string;
    user_id: string | number;
  };
}

async function addProject(
  req: addProjectRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    // check if user is pro, hard limit project creation to 2
    const projectsByUserData = await getProjectsQuery(req.session.user);

    if (projectsByUserData.rows.length >= 2) {
      const userData = await getUserByIdQuery(req.session.user);
      if (!userData.rows[0].is_pro)
        throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
    }
    req.body.user_id = req.session.user;
    const data = await addProjectQuery(req.body);
    // add first project table view
    await addTableViewByProjectQuery({
      project_id: data.rows[0].id,
      title: "First Wyrld Table",
    });
    // Log project creation event
    logEventAsync({
      userId: req.session.user,
      projectId: data.rows[0].id,
      eventType: EventType.PROJECT_CREATED,
      eventData: { title: data.rows[0].title },
      req,
    });
    res
      .set("HX-Redirect", `/wyrld?id=${data.rows[0].id}`)
      .send("Form submission was successful.");
  } catch (err) {
    next(err);
  }
}

interface GetProjectResponseData extends Project {
  was_joined: boolean;
  project_user_id: number;
  date_joined: string;
  is_editor: boolean;
  project_invite: ProjectInvite;
}

async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const projectData = await getProjectQuery(req.params.id);
    const project = projectData.rows[0];
    if (!req.session.user) throw new Error("User is not logged in");
    const projectUsersData = await getProjectUserByUserAndProjectQuery(
      req.session.user,
      project.id
    );
    if (projectUsersData.rows.length) {
      const projectUser = projectUsersData.rows[0];
      (project as GetProjectResponseData).was_joined = true;
      (project as GetProjectResponseData).project_user_id = projectUser.id;
      (project as GetProjectResponseData).date_joined = projectUser.date_joined;
      (project as GetProjectResponseData).is_editor = projectUser.is_editor;
    }
    res.send(project);
  } catch (err) {
    next(err);
  }
}

async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const projectsData = await getProjectsQuery(req.session.user);
    // get joined projects
    const projectUserData = await getProjectUsersQuery(req.session.user);
    if (
      projectUserData &&
      projectUserData.rows &&
      projectUserData.rows.length
    ) {
      for (var projectUser of projectUserData.rows) {
        const projectData = await getProjectQuery(projectUser.project_id);
        if (projectData && projectData.rows && projectData.rows.length) {
          const project = projectData.rows[0];
          (project as GetProjectResponseData).was_joined = true;
          (project as GetProjectResponseData).project_user_id = projectUser.id;
          (project as GetProjectResponseData).date_joined =
            projectUser.date_joined;
          (project as GetProjectResponseData).is_editor = projectUser.is_editor;
          projectsData.rows.push(project);
        }
      }
    }
    // get project invites
    for (var project of projectsData.rows) {
      const projectInvites = await getProjectInviteByProjectQuery(project.id);
      if (projectInvites && projectInvites.rows && projectInvites.rows.length)
        (project as GetProjectResponseData).project_invite =
          projectInvites.rows[0];
    }

    res.send(projectsData.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProject(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const projectData = await getProjectQuery(req.params.id);
    const project = projectData.rows[0];
    if (req.session.user != project.user_id)
      throw new Error("User is not owner");

    // Clean up table images (S3 + database) - project_id is optional so no cascade
    const tableImages = await getTableImagesByProjectQuery(req.params.id);
    for (const tableImage of tableImages.rows) {
      const imageData = await getImageQuery(tableImage.image_id);
      const image = imageData.rows[0];
      await removeImageFromBucket("wyrld/images", image);
      await removeTableImageQuery(tableImage.id);
    }

    // Clean up table views - project_id is optional so no cascade
    const tableViews = await getTableViewsByProjectQuery(req.params.id);
    for (const tableView of tableViews.rows) {
      await removeTableViewQuery(tableView.id);
    }

    // Remove project - CASCADE handles Calendar, Month, Day, ProjectInvite, ProjectUser, ProjectPlayer
    await removeProjectQuery(req.params.id);

    res.setHeader("HX-Redirect", "/dash");
    res.send();
  } catch (err) {
    next(err);
  }
}

async function editProjectTitle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const projectData = await getProjectQuery(req.params.id);
    const project = projectData.rows[0];
    if (req.session.user != project.user_id)
      throw new Error("User is not owner");

    await editProjectQuery(req.params.id, {
      title: req.body.title,
    });
    res.send("Saved");
  } catch (err) {
    next(err);
  }
}

export { getProjects, getProject, addProject, removeProject, editProjectTitle };
