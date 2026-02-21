import db from "../dbconfig";

export interface ProjectLogEventRow {
  id: number;
  user_id: number | null;
  project_id: number | null;
  event_type: string;
  event_data: Record<string, any> | null;
  created_at: string;
  actor_username: string | null;
}

async function getProjectLogEventsQuery(
  projectId: string | number,
  opts?: { limit?: number },
) {
  const requestedLimit = Number(opts?.limit ?? 100);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(200, Math.trunc(requestedLimit)))
    : 100;

  const query = {
    text: /*sql*/ `
      select
        le.id,
        le.user_id,
        le.project_id,
        le.event_type,
        le.event_data,
        le.created_at,
        u.username as actor_username
      from public."LogEvent" le
      left join public."User" u
        on u.id = le.user_id
      where le.project_id = $1
      order by le.created_at desc, le.id desc
      limit $2
    `,
    values: [projectId, limit],
  };
  return await db.query<ProjectLogEventRow>(query);
}

export { getProjectLogEventsQuery };
