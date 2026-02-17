import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface TableView {
  id: number
  uuid: string
  project_id: number
  user_id: number
  data: {[key: string]: any}
  date_created: string
  title: string
  is_public: boolean
  mode: string
}

function isMissingModeColumnError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const dbErr = err as { code?: string; message?: string };
  return dbErr.code === "42703" && dbErr.message?.includes(`"mode"`) === true;
}

async function addTableViewByProjectQuery(data: {
  project_id: string | number,
  title: string,
  mode: string
}) {
  const query = {
    text: /*sql*/ `insert into public."TableView" (project_id, title, mode) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.title,
      data.mode
    ]
  }
  try {
    return await db.query<TableView>(query)
  } catch (err) {
    if (!isMissingModeColumnError(err)) throw err;
    const fallbackQuery = {
      text: /*sql*/ `insert into public."TableView" (project_id, title) values($1,$2) returning *`,
      values: [
        data.project_id,
        data.title
      ]
    };
    return await db.query<TableView>(fallbackQuery)
  }
}

async function addTableViewByUserQuery(data: {
  user_id: string | number,
  title: string,
  mode: string
}) {
  const query = {
    text: /*sql*/ `insert into public."TableView" (user_id, title, mode) values($1,$2,$3) returning *`,
    values: [
      data.user_id,
      data.title,
      data.mode
    ]
  }
  try {
    return await db.query<TableView>(query)
  } catch (err) {
    if (!isMissingModeColumnError(err)) throw err;
    const fallbackQuery = {
      text: /*sql*/ `insert into public."TableView" (user_id, title) values($1,$2) returning *`,
      values: [
        data.user_id,
        data.title
      ]
    };
    return await db.query<TableView>(fallbackQuery)
  }
}

async function getTableViewQuery(id: string | number) {
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
  try {
    return await db.query<TableView>(query);
  } catch (err) {
    if (!isMissingModeColumnError(err) || typeof data.mode === "undefined") {
      throw err;
    }

    const { mode, ...fallbackData } = data;
    if (!Object.keys(fallbackData).length) {
      return await getTableViewQuery(id);
    }

    const fallbackQuery = buildUpdateQuery("TableView", fallbackData, id);
    return await db.query<TableView>(fallbackQuery);
  }
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
