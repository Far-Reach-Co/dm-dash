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
import { User, getUserByIdQuery } from "../queries/users.js";
import { Request, Response, NextFunction } from "express";
import { requireApiUser, requireProjectOwnerAccess } from "./accessControl";
import { EventType, logEventAsync } from "../../lib/eventLogger";
import { notifyProjectUserRemovedAsync } from "../../lib/emailNotifications";
import {
  notifyCapacityStateForOwner,
  notifyProjectOwner,
  notifySilently,
  notifyUser,
} from "../../lib/notifications";

async function addProjectUserByInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireApiUser(req);

    const inviteId = req.body.invite_id;
    const inviteData = await getProjectInviteQuery(inviteId);
    const invite = inviteData.rows[0];
    if (!invite) throw { status: 404, message: "Invite not found" };
    const projectData = await getProjectQuery(invite.project_id);
    const project = projectData.rows[0];
    if (!project) throw { status: 404, message: "Project not found" };
    if (project.user_id == userId)
      throw new Error("You already own this wyrld");
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      userId,
      project.id
    );
    if (projectUserData.rows.length)
      throw new Error("You are already a member of this wyrld");

    req.body.is_editor = false;
    req.body.user_id = userId;
    req.body.project_id = project.id;

    const data = await addProjectUserQuery(req.body);
    const projectUser = data.rows[0];
    logEventAsync({
      userId,
      projectId: project.id,
      eventType: EventType.PROJECT_USER_CREATED,
      eventData: {
        projectUserId: projectUser.id,
        joiningUserId: userId,
        source: "invite_id",
        outcome: "success",
        reason: null,
      },
      req,
    });
    logEventAsync({
      userId,
      projectId: project.id,
      eventType: EventType.PROJECT_INVITE_USED,
      eventData: {
        inviteId: invite.id,
        inviteUuid: invite.uuid,
        projectUserId: projectUser.id,
        joiningUserId: userId,
        source: "invite_id",
        outcome: "success",
        reason: null,
      },
      req,
    });
    notifySilently(
      Promise.all([
        notifyProjectOwner({
          projectId: project.id,
          type: "project.invite_used",
          title: "A player joined your wyrld by invite",
          body: "A new member accepted your invite and joined.",
          link: `/wyrld?id=${project.id}`,
          data: { projectId: Number(project.id), joiningUserId: Number(userId) },
          excludeUserIds: [userId],
        }),
        notifyUser({
          userId,
          type: "project.membership_joined",
          title: `You joined ${project.title}`,
          body: "Welcome to the wyrld.",
          link: `/wyrld?id=${project.id}`,
          data: { projectId: Number(project.id), source: "invite" },
        }),
        notifyCapacityStateForOwner({
          projectId: project.id,
          trigger: "member_joined",
        }),
      ]),
      "Failed to create in-app notifications for invite join",
      { projectId: project.id, joiningUserId: userId },
    );
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

interface GetProjectUsersByProjectReturnUser extends User {
  project_user_id: number;
  is_editor: boolean;
}

async function getProjectUsersByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireProjectOwnerAccess(req, req.params.project_id);
    const projectUsersData = await getProjectUsersByProjectQuery(
      req.params.project_id
    );

    const usersList = [];

    for (const projectUser of projectUsersData.rows) {
      const userData = await getUserByIdQuery(projectUser.user_id);
      const user = userData.rows[0];
      (user as GetProjectUsersByProjectReturnUser).project_user_id =
        projectUser.id;
      (user as GetProjectUsersByProjectReturnUser).is_editor =
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
    const projectUserData = await getProjectUserQuery(req.params.id);
    const projectUser = projectUserData.rows[0];
    if (!projectUser) throw { status: 404, message: "Project user not found" };
    const ownerRole = await requireProjectOwnerAccess(req, projectUser.project_id);
    await removeProjectUserQuery(req.params.id);
    logEventAsync({
      userId: ownerRole.userId,
      projectId: projectUser.project_id,
      eventType: EventType.PROJECT_USER_REMOVED,
      eventData: {
        removedUserId: projectUser.user_id,
        removedByUserId: ownerRole.userId,
        source: "owner_removed_member",
        outcome: "success",
        reason: null,
      },
      req,
    });
    notifyProjectUserRemovedAsync({
      projectId: projectUser.project_id,
      removedUserId: projectUser.user_id,
      removedByUserId: ownerRole.userId,
    });
    notifySilently(
      Promise.all([
        notifyUser({
          userId: projectUser.user_id,
          type: "project.membership_removed",
          title: "You were removed from a wyrld",
          body: "A manager removed your access.",
          link: "/dash/wyrlds",
          data: {
            projectId: Number(projectUser.project_id),
            removedByUserId: Number(ownerRole.userId),
          },
        }),
        notifyCapacityStateForOwner({
          projectId: projectUser.project_id,
          trigger: "member_left",
        }),
      ]),
      "Failed to create in-app notifications for removed project user",
      {
        projectId: projectUser.project_id,
        removedUserId: projectUser.user_id,
        actorUserId: ownerRole.userId,
      },
    );
    res.status(200).send();
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
    const projectUserData = await getProjectUserQuery(req.params.id);
    const projectUser = projectUserData.rows[0];
    if (!projectUser) throw { status: 404, message: "Project user not found" };
    const ownerRole = await requireProjectOwnerAccess(req, projectUser.project_id);
    const wasEditor = Boolean(projectUser.is_editor);
    const is_editor =
      req.body.is_editor === true ||
      req.body.is_editor === "true" ||
      req.body.is_editor === "on";

    const data = await editProjectUserQuery(req.params.id, { is_editor });
    if (wasEditor !== is_editor) {
      logEventAsync({
        userId: ownerRole.userId,
        projectId: projectUser.project_id,
        eventType: EventType.PROJECT_USER_ROLE_CHANGED,
        eventData: {
          targetUserId: projectUser.user_id,
          previousRole: wasEditor ? "manager" : "member",
          nextRole: is_editor ? "manager" : "member",
          outcome: "success",
          reason: null,
        },
        req,
      });
      notifySilently(
        notifyUser({
          userId: projectUser.user_id,
          type: "project.role_changed",
          title: is_editor ? "You were promoted to Manager" : "Your manager role was removed",
          body: is_editor
            ? "You can now help manage this wyrld."
            : "You are now a regular member.",
          link: `/wyrld?id=${projectUser.project_id}`,
          data: {
            projectId: Number(projectUser.project_id),
            previousRole: wasEditor ? "manager" : "member",
            nextRole: is_editor ? "manager" : "member",
            changedByUserId: Number(ownerRole.userId),
          },
        }),
        "Failed to create in-app notification for role change",
        {
          projectId: projectUser.project_id,
          targetUserId: projectUser.user_id,
          actorUserId: ownerRole.userId,
        },
      );
    }
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function leaveProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireApiUser(req);
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];
    if (!project) throw { status: 404, message: "Project not found" };
    if (String(project.user_id) === String(userId)) {
      throw { status: 409, message: "Project owner cannot leave the wyrld" };
    }

    const projectUserData = await getProjectUserByUserAndProjectQuery(
      userId,
      project.id
    );
    const projectUser = projectUserData.rows[0];
    if (!projectUser) throw { status: 404, message: "You are not a member of this wyrld" };

    await removeProjectUserQuery(String(projectUser.id));
    logEventAsync({
      userId,
      projectId: project.id,
      eventType: EventType.PROJECT_USER_REMOVED,
      eventData: {
        removedUserId: userId,
        removedByUserId: userId,
        source: "self_leave",
        outcome: "success",
        reason: null,
      },
      req,
    });
    notifySilently(
      notifyCapacityStateForOwner({
        projectId: project.id,
        trigger: "member_left",
      }),
      "Failed to create in-app notification for opened capacity slot",
      { projectId: project.id, leavingUserId: userId },
    );
    res.status(200).send({ redirect: "/dash/wyrlds" });
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
  leaveProject,
};
