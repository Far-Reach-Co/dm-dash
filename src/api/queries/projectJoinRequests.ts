import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export type ProjectJoinRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ProjectJoinRequest {
  id: number;
  project_id: number;
  requester_user_id: number;
  message: string;
  status: ProjectJoinRequestStatus;
  reviewer_user_id: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectJoinRequestWithUser extends ProjectJoinRequest {
  requester_username: string;
}

async function addProjectJoinRequestQuery(data: {
  project_id: number | string;
  requester_user_id: number | string;
  message: string;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."ProjectJoinRequest" (
        project_id,
        requester_user_id,
        message
      )
      values ($1, $2, $3)
      returning *
    `,
    values: [data.project_id, data.requester_user_id, data.message],
  };
  return await db.query<ProjectJoinRequest>(query);
}

async function getProjectJoinRequestQuery(id: number | string) {
  const query = {
    text: /*sql*/ `select * from public."ProjectJoinRequest" where id = $1`,
    values: [id],
  };
  return await db.query<ProjectJoinRequest>(query);
}

async function getPendingProjectJoinRequestByProjectAndUserQuery(
  projectId: number | string,
  userId: number | string,
) {
  const query = {
    text: /*sql*/ `
      select *
      from public."ProjectJoinRequest"
      where project_id = $1
        and requester_user_id = $2
        and status = 'pending'
      order by id desc
      limit 1
    `,
    values: [projectId, userId],
  };
  return await db.query<ProjectJoinRequest>(query);
}

async function getPendingProjectJoinRequestsByProjectQuery(projectId: number | string) {
  const query = {
    text: /*sql*/ `
      select
        pjr.*,
        u.username as requester_username
      from public."ProjectJoinRequest" pjr
      join public."User" u
        on u.id = pjr.requester_user_id
      where pjr.project_id = $1
        and pjr.status = 'pending'
      order by pjr.created_at asc
    `,
    values: [projectId],
  };
  return await db.query<ProjectJoinRequestWithUser>(query);
}

async function getPendingProjectJoinRequestsByRequesterQuery(
  userId: number | string,
) {
  const query = {
    text: /*sql*/ `
      select *
      from public."ProjectJoinRequest"
      where requester_user_id = $1
        and status = 'pending'
      order by id desc
    `,
    values: [userId],
  };
  return await db.query<ProjectJoinRequest>(query);
}

async function getLatestProjectJoinRequestByProjectAndUserQuery(
  projectId: number | string,
  userId: number | string,
) {
  const query = {
    text: /*sql*/ `
      select *
      from public."ProjectJoinRequest"
      where project_id = $1
        and requester_user_id = $2
      order by created_at desc, id desc
      limit 1
    `,
    values: [projectId, userId],
  };
  return await db.query<ProjectJoinRequest>(query);
}

async function getPendingJoinRequestCountByProjectQuery(projectId: number | string) {
  const query = {
    text: /*sql*/ `
      select count(*)::int as count
      from public."ProjectJoinRequest"
      where project_id = $1
        and status = 'pending'
    `,
    values: [projectId],
  };
  return await db.query<{ count: number }>(query);
}

async function editProjectJoinRequestQuery(
  id: number | string,
  data: Partial<{
    message: string;
    status: ProjectJoinRequestStatus;
    reviewer_user_id: number | null;
    reviewed_at: string | null;
    updated_at: string;
  }>,
) {
  const query = buildUpdateQuery("ProjectJoinRequest", data, id);
  return await db.query<ProjectJoinRequest>(query);
}

export {
  addProjectJoinRequestQuery,
  getProjectJoinRequestQuery,
  getPendingProjectJoinRequestByProjectAndUserQuery,
  getPendingProjectJoinRequestsByProjectQuery,
  getPendingProjectJoinRequestsByRequesterQuery,
  getLatestProjectJoinRequestByProjectAndUserQuery,
  getPendingJoinRequestCountByProjectQuery,
  editProjectJoinRequestQuery,
};
