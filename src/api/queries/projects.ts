import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export interface Project {
  id: number;
  title: string;
  user_id: number;
  date_created: string;
  used_data_in_bytes: number;
  description: string;
  image_id: number;
  is_pro: boolean;
}

async function addProjectQuery(data: {title: string, user_id: string | number}) {
  const query = {
    text: /*sql*/ `insert into public."Project" (title, user_id) values($1,$2) returning *`,
    values: [
      data.title,
      data.user_id,
    ]
  }
  return await db.query<Project>(query)
}

async function getProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."Project" where id = $1`,
    values: [projectId]
  }
  return await db.query<Project>(query)
}

async function removeProjectQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Project" where id = $1`,
    values: [id]
  }

  return await db.query<Project>(query)
}

async function getProjectsQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."Project" where user_id = $1 order by id`,
    values: [userId]
  }
  return await db.query<Project>(query)
}

async function getProjectsByIdsQuery(projectIds: (string | number)[]) {
  const query = {
    text: /*sql*/ `select * from public."Project" where id = ANY($1) order by id`,
    values: [projectIds],
  }
  return await db.query<Project>(query)
}

async function editProjectQuery(id: string | number, data: any) {
  const query = buildUpdateQuery("Project", data, id);
  return await db.query<Project>(query);
}

export {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  getProjectsByIdsQuery,
  removeProjectQuery,
  editProjectQuery
}
