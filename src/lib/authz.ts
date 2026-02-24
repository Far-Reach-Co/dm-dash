import { Request } from "express";
import { Response } from "express";
import { Project } from "../api/queries/projects";
import { Record } from "../api/queries/record";
import {
  getProjectAccessForProject,
  getProjectAccessForUser,
  getProjectOrThrow as getProjectOrThrowCore,
} from "./projectAccessCore";

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
  return await getProjectOrThrowCore(projectId, {
    onNotFound: () => new Error("Project not found"),
  });
}

async function getProjectAccessOrThrow(
  userId: string | number,
  projectId: string | number,
) {
  return await getProjectAccessForUser(userId, projectId, {
    onNotFound: () => new Error("Project not found"),
  });
}

async function getProjectAccessForLoadedProject(
  userId: string | number,
  project: Project,
) {
  return await getProjectAccessForProject(userId, project);
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
    const role = await getProjectAccessOrThrow(userId, projectId);
    if (!role.isOwner) {
      res.redirect(redirectTo);
      return null;
    }
    return role.project;
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
    const role = await getProjectAccessOrThrow(userId, projectId);
    if (!role.isEditor) {
      res.redirect(redirectTo);
      return null;
    }
    return role.project;
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
    const role = await getProjectAccessOrThrow(userId, projectId);
    if (!role.isMember) {
      res.redirect(redirectTo);
      return null;
    }
    return role.project;
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
  const role = await getProjectAccessOrThrow(userId, projectId);
  if (!role.isOwner) {
    throw new Error("User is not owner");
  }
  return role.project;
}

export async function requireProjectEditor(
  req: Request,
  projectId: string | number,
) {
  const userId = requireUser(req);
  const role = await getProjectAccessOrThrow(userId, projectId);
  if (!role.isEditor) {
    throw new Error("User is not authorized");
  }
  return role.project;
}

export async function getProjectUserForViewer(
  req: Request,
  projectId: string | number,
): Promise<{ project: Project; isOwner: boolean; isEditor: boolean } | null> {
  const userId = requireUser(req);
  const role = await getProjectAccessOrThrow(userId, projectId);
  if (!role.isMember) return null;
  return {
    project: role.project,
    isOwner: role.isOwner,
    isEditor: role.isEditor,
  };
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
  const role = await getProjectAccessOrThrow(userId, projectId);
  if (!role.isMember) return null;
  return role;
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

  if (!record.project_id || String(record.project_id) !== String(projectId)) {
    res.redirect(redirectTo);
    return null;
  }

  let project: Project;
  try {
    project = await getProjectOrThrow(projectId);
  } catch {
    res.redirect(redirectTo);
    return null;
  }

  const canViewFeaturedRecord =
    options.mode === "view" &&
    project.is_pro &&
    project.is_public_listed &&
    project.featured_record_id !== null &&
    String(project.featured_record_id) === String(record.id);

  if (!req.session?.user) {
    if (canViewFeaturedRecord) {
      return { canEdit: false, projectId };
    }
    res.redirect(redirectTo);
    return null;
  }

  const userId = req.session.user;
  const role = await getProjectAccessForLoadedProject(userId, project);

  if (options.mode === "edit") {
    if (!role.isEditor) {
      res.redirect(redirectTo);
      return null;
    }
    return { canEdit: true, projectId };
  }

  if (role.isMember) {
    if (!role.isEditor && !record.is_public && !canViewFeaturedRecord) {
      res.redirect(redirectTo);
      return null;
    }
    return { canEdit: role.isEditor, projectId };
  }

  if (canViewFeaturedRecord) {
    return { canEdit: false, projectId };
  }

  res.redirect(redirectTo);
  return null;
}
