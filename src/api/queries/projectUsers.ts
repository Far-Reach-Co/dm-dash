import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface ProjectUser {
  id: number,
  project_id: number,
  user_id: number,
  is_editor: boolean,
  date_joined: string
}

async function addProjectUserQuery(data: {project_id: string | number, user_id: string | number, is_editor: boolean}) {
  const query = {
    text: /*sql*/ `insert into public."ProjectUser" (project_id, user_id, is_editor) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.user_id,
      data.is_editor
    ]
  }
  return await db.query<ProjectUser>(query)
}

async function getProjectUsersQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where user_id = $1`,
    values: [userId]
  }
  return await db.query<ProjectUser>(query)
}

async function getProjectUserByUserAndProjectQuery(userId: string | number, projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where user_id = $1 and project_id = $2`,
    values: [userId, projectId]
  }
  return await db.query<ProjectUser>(query)
}

async function getProjectUsersByProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where project_id = $1 order by id`,
    values: [projectId]
  }
  return await db.query<ProjectUser>(query)
}

async function getProjectUserQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where id = $1`,
    values: [id]
  }
  return await db.query<ProjectUser>(query)
}

async function removeProjectUserQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."ProjectUser" where id = $1`,
    values: [id]
  }

  return await db.query<ProjectUser>(query)
}

async function editProjectUserQuery(id: string, data: any) {
  const query = buildUpdateQuery("ProjectUser", data, id);
  return await db.query<ProjectUser>(query);
}

export {
  addProjectUserQuery,
  getProjectUserQuery,
  getProjectUsersQuery,
  getProjectUsersByProjectQuery,
  removeProjectUserQuery,
  editProjectUserQuery,
  getProjectUserByUserAndProjectQuery
}
