import {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  getProjectsByIdsQuery,
  removeProjectQuery,
  editProjectQuery,
  Project,
} from "../queries/projects.js";
import {
  ProjectInvite,
  getProjectInvitesByProjectIdsQuery,
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
  getTableImagesByImageQuery,
  removeTableImageQuery,
} from "../queries/tableImages.js";
import { Request, Response, NextFunction } from "express";
import { getUserByIdQuery } from "../queries/users.js";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { requireProjectOwner, requireUser } from "../../lib/authz";
import { getSignedUrls } from "./s3.js";
import { requireProjectMemberAccess } from "./accessControl";
import { subscriptionPlanLimits } from "../../lib/subscription";

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
    const userId = requireUser(req);
    // check if user is pro, hard limit project creation to 2
    const projectsByUserData = await getProjectsQuery(userId);

    if (projectsByUserData.rows.length >= subscriptionPlanLimits.freeOwnedWyrlds) {
      const userData = await getUserByIdQuery(userId);
      if (!userData.rows[0].is_pro)
        throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
    }
    req.body.user_id = userId;
    const data = await addProjectQuery(req.body);
    // add first project table view
    await addTableViewByProjectQuery({
      project_id: data.rows[0].id,
      title: "First Wyrld Table",
      mode: "standard",
    });
    // Log project creation event
    logEventAsync({
      userId,
      projectId: data.rows[0].id,
      eventType: EventType.PROJECT_CREATED,
      eventData: { title: data.rows[0].title },
      req,
    });
    res.status(201).json({ redirect: `/wyrld?id=${data.rows[0].id}` });
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
    const access = await requireProjectMemberAccess(req, req.params.id);
    const project = access.project;
    if (!access.isOwner) {
      const projectUsersData = await getProjectUserByUserAndProjectQuery(
        access.userId,
        project.id
      );
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
    const userId = requireUser(req);
    const projectsData = await getProjectsQuery(userId);
    const ownedProjects = projectsData.rows;
    const ownedIds = new Set(ownedProjects.map((p) => String(p.id)));

    // get joined projects in a single query
    const projectUserData = await getProjectUsersQuery(userId);
    const projectUsers = projectUserData?.rows || [];
    const joinedProjectIds = projectUsers
      .map((pu) => pu.project_id)
      .filter((id) => !ownedIds.has(String(id)));

    let joinedProjects: Project[] = [];
    if (joinedProjectIds.length) {
      const joinedProjectsData = await getProjectsByIdsQuery(joinedProjectIds);
      joinedProjects = joinedProjectsData.rows;

      const projectUserByProjectId = new Map(
        projectUsers.map((pu) => [String(pu.project_id), pu]),
      );

      for (const project of joinedProjects) {
        const projectUser = projectUserByProjectId.get(String(project.id));
        if (projectUser) {
          (project as GetProjectResponseData).was_joined = true;
          (project as GetProjectResponseData).project_user_id = projectUser.id;
          (project as GetProjectResponseData).date_joined =
            projectUser.date_joined;
          (project as GetProjectResponseData).is_editor = projectUser.is_editor;
        }
      }
    }

    const allProjects = ownedProjects.concat(joinedProjects);

    // batch fetch project invites
    if (allProjects.length) {
      const inviteData = await getProjectInvitesByProjectIdsQuery(
        allProjects.map((p) => p.id),
      );
      const inviteByProjectId = new Map<string, ProjectInvite>();
      for (const invite of inviteData.rows) {
        const key = String(invite.project_id);
        if (!inviteByProjectId.has(key)) {
          inviteByProjectId.set(key, invite);
        }
      }
      for (const project of allProjects) {
        const invite = inviteByProjectId.get(String(project.id));
        if (invite)
          (project as GetProjectResponseData).project_invite = invite;
      }
    }

    res.send(allProjects);
  } catch (err) {
    next(err);
  }
}

async function removeProject(req: Request, res: Response, next: NextFunction) {
  try {
    await requireProjectOwner(req, req.params.id);

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

    res.status(200).json({ redirect: "/dash" });
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
    await requireProjectOwner(req, req.params.id);

    await editProjectQuery(req.params.id, {
      title: req.body.title,
    });
    res.send("Saved");
  } catch (err) {
    next(err);
  }
}

const PROJECT_DESCRIPTION_MAX_LENGTH = 1200;

async function editProjectDescription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireProjectOwner(req, req.params.id);
    const rawDescription =
      typeof req.body?.description === "string" ? req.body.description : "";
    const description = rawDescription.trim();
    if (description.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
      throw {
        status: 400,
        message: `Description must be ${PROJECT_DESCRIPTION_MAX_LENGTH} characters or fewer`,
      };
    }

    await editProjectQuery(req.params.id, {
      description,
    });
    res.send("Saved");
  } catch (err) {
    next(err);
  }
}

async function editProjectBannerImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const project = await requireProjectOwner(req, req.params.id);
    const rawImageId = req.body.image_id;

    if (
      rawImageId === null ||
      typeof rawImageId === "undefined" ||
      rawImageId === ""
    ) {
      await editProjectQuery(req.params.id, {
        image_id: null,
      });
      res.status(200).json({ message: "Saved", image_id: null, src: null });
      return;
    }

    const imageId = Number(rawImageId);
    if (!Number.isInteger(imageId) || imageId <= 0) {
      throw { status: 400, message: "Invalid image_id" };
    }

    if (!project.is_pro) {
      throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
    }

    const tableImagesData = await getTableImagesByImageQuery(imageId);
    const isImageInProject = tableImagesData.rows.some(
      (tableImage) => String(tableImage.project_id) === String(project.id)
    );
    if (!isImageInProject) {
      throw { status: 404, message: "Image not found in this project" };
    }

    const imageData = await getImageQuery(imageId);
    const image = imageData.rows[0];
    if (!image) throw { status: 404, message: "Image not found" };

    await editProjectQuery(req.params.id, {
      image_id: imageId,
    });

    const signedUrls = await getSignedUrls([image]);
    res.status(200).json({
      message: "Saved",
      image_id: imageId,
      src: signedUrls[image.id],
      original_name: image.original_name,
    });
  } catch (err) {
    next(err);
  }
}

export {
  getProjects,
  getProject,
  addProject,
  removeProject,
  editProjectTitle,
  editProjectDescription,
  editProjectBannerImage,
};
