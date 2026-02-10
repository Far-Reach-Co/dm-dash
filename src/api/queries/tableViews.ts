import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface TableView {
  id: number
  project_id: number
  user_id: number
  data: {[key: string]: any}
  date_created: string
  title: string
  is_public: boolean
}

async function addTableViewByProjectQuery(data: {project_id: string | number, title: string}) {
  const query = {
    text: /*sql*/ `insert into public."TableView" (project_id, title) values($1,$2) returning *`,
    values: [
      data.project_id,
      data.title
    ]
  }
  return await db.query<TableView>(query)
}

async function addTableViewByUserQuery(data: {user_id: string | number, title: string}) {
  const query = {
    text: /*sql*/ `insert into public."TableView" (user_id, title) values($1,$2) returning *`,
    values: [
      data.user_id,
      data.title
    ]
  }
  return await db.query<TableView>(query)
}

async function getTableViewQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where id = $1`,
    values: [id]
  }
  return await db.query<TableView>(query)
}

async function getTableViewByUUIDQuery(uuid: string) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where uuid = $1`,
    values: [uuid]
  }
  return await db.query<TableView>(query)
}

async function getTableViewsByProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where project_id = $1`,
    values: [projectId]
  }
  return await db.query<TableView>(query)
}

async function getTableViewsByUserQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where user_id = $1`,
    values: [userId]
  }
  return await db.query<TableView>(query)
}

async function removeTableViewQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."TableView" where id = $1`,
    values: [id]
  }

  return await db.query<TableView>(query)
}

async function editTableViewQuery(id: string, data: any) {
  const query = buildUpdateQuery("TableView", data, id);
  return await db.query<TableView>(query);
}

export {
  addTableViewByProjectQuery,
  getTableViewsByProjectQuery,
  getTableViewByUUIDQuery,
  getTableViewQuery,
  getTableViewsByUserQuery,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewByUserQuery
}
