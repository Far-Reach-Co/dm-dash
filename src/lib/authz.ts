import { Request } from "express";
import { Response } from "express";
import { getProjectQuery, Project } from "../api/queries/projects";
import { getProjectUserByUserAndProjectQuery } from "../api/queries/projectUsers";
import { Record } from "../api/queries/record";

export function requireUser(req: Request): string | number {
  if (!req.session?.user) throw new Error("User is not logged in");
  return req.session.user;
}

export function requireUserOrRedirect(
  req: Request,
  res: Response,
  redirectTo: string,
): string | number | null {
  if (!req.session?.user) {
    res.redirect(redirectTo);
    return null;
  }
  return req.session.user;
}

async function getProjectOrThrow(projectId: string | number): Promise<Project> {
  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  if (!project) throw new Error("Project not found");
  return project;
}

function isProjectOwner(project: Project, userId: string | number): boolean {
  return String(project.user_id) === String(userId);
}

async function getProjectUser(
  userId: string | number,
  projectId: string | number,
) {
  const projectUserData = await getProjectUserByUserAndProjectQuery(
    userId,
    projectId,
  );
  return projectUserData.rows[0] || null;
}

export async function requireProjectOwnerOrRedirect(
  req: Request,
  res: Response,
  projectId: string | number,
  redirectTo = "/forbidden",
): Promise<Project | null> {
  const userId = requireUserOrRedirect(req, res, redirectTo);
  if (!userId) return null;
  try {
    const project = await getProjectOrThrow(projectId);
    if (!isProjectOwner(project, userId)) {
      res.redirect(redirectTo);
      return null;
    }
    return project;
  } catch {
    res.redirect(redirectTo);
    return null;
  }
}

export async function requireProjectEditorOrRedirect(
  req: Request,
  res: Response,
  projectId: string | number,
  redirectTo = "/forbidden",
): Promise<Project | null> {
  const userId = requireUserOrRedirect(req, res, redirectTo);
  if (!userId) return null;
  try {
    const project = await getProjectOrThrow(projectId);
    if (isProjectOwner(project, userId)) return project;
    const projectUser = await getProjectUser(userId, projectId);
    if (!projectUser || !projectUser.is_editor) {
      res.redirect(redirectTo);
      return null;
    }
    return project;
  } catch {
    res.redirect(redirectTo);
    return null;
  }
}

export async function requireProjectMemberOrRedirect(
  req: Request,
  res: Response,
  projectId: string | number,
  redirectTo = "/forbidden",
): Promise<Project | null> {
  const userId = requireUserOrRedirect(req, res, redirectTo);
  if (!userId) return null;
  try {
    const project = await getProjectOrThrow(projectId);
    if (isProjectOwner(project, userId)) return project;
    const projectUser = await getProjectUser(userId, projectId);
    if (!projectUser) {
      res.redirect(redirectTo);
      return null;
    }
    return project;
  } catch {
    res.redirect(redirectTo);
    return null;
  }
}

export async function requireProjectOwner(
  req: Request,
  projectId: string | number,
) {
  const userId = requireUser(req);
  const project = await getProjectOrThrow(projectId);
  if (!isProjectOwner(project, userId)) {
    throw new Error("User is not owner");
  }
  return project;
}

export async function requireProjectEditor(
  req: Request,
  projectId: string | number,
) {
  const userId = requireUser(req);
  const project = await getProjectOrThrow(projectId);
  if (isProjectOwner(project, userId)) return project;
  const projectUser = await getProjectUser(userId, projectId);
  if (!projectUser || !projectUser.is_editor) {
    throw new Error("User is not authorized");
  }
  return project;
}

export async function getProjectUserForViewer(
  req: Request,
  projectId: string | number,
): Promise<{ project: Project; isOwner: boolean; isEditor: boolean } | null> {
  const userId = requireUser(req);
  const project = await getProjectOrThrow(projectId);
  if (isProjectOwner(project, userId)) {
    return { project, isOwner: true, isEditor: true };
  }
  const projectUser = await getProjectUser(userId, projectId);
  if (!projectUser) return null;
  return { project, isOwner: false, isEditor: !!projectUser.is_editor };
}

export async function getProjectAccess(
  req: Request,
  projectId: string | number,
): Promise<
  | {
      project: Project;
      isOwner: boolean;
      isEditor: boolean;
      isMember: boolean;
      projectUserId: number | null;
    }
  | null
> {
  const userId = requireUser(req);
  const project = await getProjectOrThrow(projectId);
  if (isProjectOwner(project, userId)) {
    return {
      project,
      isOwner: true,
      isEditor: true,
      isMember: true,
      projectUserId: null,
    };
  }
  const projectUser = await getProjectUser(userId, projectId);
  if (!projectUser) return null;
  return {
    project,
    isOwner: false,
    isEditor: !!projectUser.is_editor,
    isMember: true,
    projectUserId: projectUser.id,
  };
}

export async function requireTableAccessOrRedirect(
  req: Request,
  res: Response,
  table: {
    project_id?: number | null;
    user_id?: number | null;
    is_public?: boolean;
    mode?: string | null;
  },
  redirectTo = "/forbidden",
): Promise<{ projectAuth: boolean } | null> {
  if (!table.project_id) {
    if (table.is_public) return { projectAuth: false };
    const userId = requireUserOrRedirect(req, res, redirectTo);
    if (!userId) return null;
    if (String(table.user_id) === String(userId)) return { projectAuth: false };
    res.redirect(redirectTo);
    return null;
  }

  const userId = requireUserOrRedirect(req, res, redirectTo);
  if (!userId) return null;
  const access = await getProjectAccess(req, table.project_id);
  if (!access) {
    res.redirect(redirectTo);
    return null;
  }

  if (!table.is_public && !access.isEditor) {
    res.redirect(redirectTo);
    return null;
  }
  return { projectAuth: access.isEditor };
}

export async function requireRecordAccessOrRedirect(
  req: Request,
  res: Response,
  record: Record,
  options: {
    mode: "view" | "edit";
    projectId?: string | number | null;
    redirectTo?: string;
  },
): Promise<{ canEdit: boolean; projectId: string | number | null } | null> {
  const redirectTo = options.redirectTo || "/forbidden";
  const projectId = options.projectId ?? null;
  if (!projectId) {
    if (options.mode === "view" && record.is_public && !req.session?.user) {
      return { canEdit: false, projectId: null };
    }
    const userId = requireUserOrRedirect(req, res, redirectTo);
    if (!userId) return null;
    const isOwner = String(record.user_id) === String(userId);
    if (options.mode === "edit" && !isOwner) {
      res.redirect(redirectTo);
      return null;
    }
    if (!record.is_public && !isOwner) {
      res.redirect(redirectTo);
      return null;
    }
    return { canEdit: isOwner, projectId: null };
  }

  const userId = requireUserOrRedirect(req, res, redirectTo);
  if (!userId) return null;
  const access = await getProjectAccess(req, projectId);
  if (!access) {
    res.redirect(redirectTo);
    return null;
  }
  if (options.mode === "edit") {
    if (!access.isEditor) {
      res.redirect(redirectTo);
      return null;
    }
    return { canEdit: true, projectId };
  }
  if (!access.isEditor && !record.is_public) {
    res.redirect(redirectTo);
    return null;
  }
  return { canEdit: access.isEditor, projectId };
}
