import { getProjectQuery, Project } from "../api/queries/projects";
import { getProjectUserByUserAndProjectQuery } from "../api/queries/projectUsers";

type NotFoundErrorFactory = () => unknown;

export interface ProjectAccessCore {
  project: Project;
  isOwner: boolean;
  isEditor: boolean;
  isMember: boolean;
  projectUserId: number | null;
}

export function isProjectOwner(
  project: Project,
  userId: string | number,
): boolean {
  return String(project.user_id) === String(userId);
}

export async function getProjectById(
  projectId: string | number,
): Promise<Project | null> {
  const projectData = await getProjectQuery(projectId);
  return projectData.rows[0] || null;
}

export async function getProjectOrThrow(
  projectId: string | number,
  options?: { onNotFound?: NotFoundErrorFactory },
): Promise<Project> {
  const project = await getProjectById(projectId);
  if (!project) {
    if (options?.onNotFound) throw options.onNotFound();
    throw new Error("Project not found");
  }
  return project;
}

export async function getProjectAccessForProject(
  userId: string | number,
  project: Project,
): Promise<ProjectAccessCore> {
  if (isProjectOwner(project, userId)) {
    return {
      project,
      isOwner: true,
      isEditor: true,
      isMember: true,
      projectUserId: null,
    };
  }

  const projectUserData = await getProjectUserByUserAndProjectQuery(
    userId,
    project.id,
  );
  const projectUser = projectUserData.rows[0];

  if (!projectUser) {
    return {
      project,
      isOwner: false,
      isEditor: false,
      isMember: false,
      projectUserId: null,
    };
  }

  return {
    project,
    isOwner: false,
    isEditor: Boolean(projectUser.is_editor),
    isMember: true,
    projectUserId: projectUser.id,
  };
}

export async function getProjectAccessForUser(
  userId: string | number,
  projectId: string | number,
  options?: { onNotFound?: NotFoundErrorFactory },
): Promise<ProjectAccessCore> {
  const project = await getProjectOrThrow(projectId, options);
  return await getProjectAccessForProject(userId, project);
}
