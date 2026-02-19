import { Request } from "express";
import { requireUser } from "../../lib/authz";
import { getProjectQuery } from "../queries/projects";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers";
import { get5eCharGeneralQuery } from "../queries/5eCharGeneral";
import { getPlayerUserByUserAndPlayerQuery } from "../queries/playerUsers";
import { getProjectPlayersByPlayerQuery } from "../queries/projectPlayers";
import { getRecordQuery } from "../queries/record";
import { getCalendarQuery } from "../queries/calendars";
import { getMonthQuery } from "../queries/months";
import { getDayQuery } from "../queries/days";

function apiError(status: number, message: string) {
  return { status, message };
}

export function requireApiUser(req: Request): string | number {
  try {
    return requireUser(req);
  } catch {
    throw apiError(401, "User is not logged in");
  }
}

export async function getProjectOrThrow(projectId: string | number) {
  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  if (!project) throw apiError(404, "Project not found");
  return project;
}

export async function getProjectRole(req: Request, projectId: string | number) {
  const userId = requireApiUser(req);
  const project = await getProjectOrThrow(projectId);
  const isOwner = String(project.user_id) === String(userId);
  if (isOwner) {
    return { userId, project, isOwner: true, isEditor: true, isMember: true };
  }

  const projectUserData = await getProjectUserByUserAndProjectQuery(
    userId,
    project.id,
  );
  const projectUser = projectUserData.rows[0];
  if (!projectUser) {
    return {
      userId,
      project,
      isOwner: false,
      isEditor: false,
      isMember: false,
    };
  }

  return {
    userId,
    project,
    isOwner: false,
    isEditor: Boolean(projectUser.is_editor),
    isMember: true,
  };
}

export async function requireProjectMemberAccess(
  req: Request,
  projectId: string | number,
) {
  const role = await getProjectRole(req, projectId);
  if (!role.isMember) throw apiError(403, "Forbidden");
  return role;
}

export async function requireProjectEditorAccess(
  req: Request,
  projectId: string | number,
) {
  const role = await getProjectRole(req, projectId);
  if (!role.isEditor) throw apiError(403, "Forbidden");
  return role;
}

export async function requireProjectOwnerAccess(
  req: Request,
  projectId: string | number,
) {
  const role = await getProjectRole(req, projectId);
  if (!role.isOwner) throw apiError(403, "Forbidden");
  return role;
}

export async function requireSheetOwnerAccess(
  req: Request,
  generalId: string | number,
) {
  const userId = requireApiUser(req);
  const generalData = await get5eCharGeneralQuery(generalId);
  const general = generalData.rows[0];
  if (!general) throw apiError(404, "Character not found");
  if (String(general.user_id) !== String(userId)) {
    throw apiError(403, "Forbidden");
  }
  return { userId, general };
}

export async function getSheetAccess(
  req: Request,
  generalId: string | number,
) {
  const userId = requireApiUser(req);
  const generalData = await get5eCharGeneralQuery(generalId);
  const general = generalData.rows[0];
  if (!general) throw apiError(404, "Character not found");

  if (String(general.user_id) === String(userId)) {
    return {
      userId,
      general,
      isOwner: true,
      isViewer: true,
      isEditor: true,
    };
  }

  const playerUserData = await getPlayerUserByUserAndPlayerQuery(
    userId,
    general.id,
  );
  const playerUser = playerUserData.rows[0];
  if (playerUser) {
    return {
      userId,
      general,
      isOwner: false,
      isViewer: true,
      isEditor: Boolean(playerUser.is_editor),
    };
  }

  const projectPlayersData = await getProjectPlayersByPlayerQuery(general.id);
  const checkedProjectIds = new Set<string>();
  for (const projectPlayer of projectPlayersData.rows) {
    const projectId = String(projectPlayer.project_id);
    if (checkedProjectIds.has(projectId)) continue;
    checkedProjectIds.add(projectId);

    const role = await getProjectRole(req, projectId);
    if (role.isEditor) {
      return {
        userId,
        general,
        isOwner: false,
        isViewer: true,
        isEditor: true,
      };
    }
  }

  return {
    userId,
    general,
    isOwner: false,
    isViewer: false,
    isEditor: false,
  };
}

export async function requireSheetViewAccess(
  req: Request,
  generalId: string | number,
) {
  const access = await getSheetAccess(req, generalId);
  if (!access.isViewer) throw apiError(403, "Forbidden");
  return access;
}

export async function requireSheetEditAccess(
  req: Request,
  generalId: string | number,
) {
  const access = await getSheetAccess(req, generalId);
  if (!access.isEditor) throw apiError(403, "Forbidden");
  return access;
}

export async function getRecordOrThrow(recordId: string | number) {
  const recordData = await getRecordQuery(recordId);
  const record = recordData.rows[0];
  if (!record) throw apiError(404, "Record not found");
  return record;
}

export async function requireRecordViewAccess(
  req: Request,
  record: { project_id?: number | null; user_id?: number | null },
) {
  if (record.project_id) {
    return await requireProjectMemberAccess(req, record.project_id);
  }
  const userId = requireApiUser(req);
  if (String(record.user_id) !== String(userId)) {
    throw apiError(403, "Forbidden");
  }
  return { userId };
}

export async function requireRecordEditAccess(
  req: Request,
  record: { project_id?: number | null; user_id?: number | null },
) {
  if (record.project_id) {
    return await requireProjectEditorAccess(req, record.project_id);
  }
  const userId = requireApiUser(req);
  if (String(record.user_id) !== String(userId)) {
    throw apiError(403, "Forbidden");
  }
  return { userId };
}

export async function resolveProjectIdByCalendarId(calendarId: string | number) {
  const calendarData = await getCalendarQuery(String(calendarId));
  const calendar = calendarData.rows[0];
  if (!calendar) throw apiError(404, "Calendar not found");
  return { projectId: calendar.project_id, calendar };
}

export async function resolveProjectIdByMonthId(monthId: string | number) {
  const monthData = await getMonthQuery(String(monthId));
  const month = monthData.rows[0];
  if (!month) throw apiError(404, "Month not found");
  const { projectId, calendar } = await resolveProjectIdByCalendarId(
    month.calendar_id,
  );
  return { projectId, month, calendar };
}

export async function resolveProjectIdByDayId(dayId: string | number) {
  const dayData = await getDayQuery(String(dayId));
  const day = dayData.rows[0];
  if (!day) throw apiError(404, "Day not found");
  const { projectId, calendar } = await resolveProjectIdByCalendarId(
    day.calendar_id,
  );
  return { projectId, day, calendar };
}
