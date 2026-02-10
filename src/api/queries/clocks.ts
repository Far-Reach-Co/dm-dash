import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface Clock {
  id: number,
  title: string,
  current_time_in_milliseconds: number,
  project_id: number
}

async function addClockQuery(data: {
  title: string,
  current_time_in_milliseconds: string,
  project_id: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Clock" (title, current_time_in_milliseconds, project_id) values($1,$2,$3) returning *`,
    values: [
      data.title,
      data.current_time_in_milliseconds,
      data.project_id
    ]
  }
  return await db.query<Clock>(query)
}

async function getClockQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Clock" where id = $1`,
    values: [id]
  }
  return await db.query<Clock>(query)
}

async function getClocksQuery(projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."Clock" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query<Clock>(query)
}

async function removeClockQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Clock" where id = $1`,
    values: [id]
  }

  return await db.query<Clock>(query)
}

async function editClockQuery(id: string, data: any) {
  const query = buildUpdateQuery("Clock", data, id);
  return await db.query<Clock>(query);
}

export {
  addClockQuery,
  getClocksQuery,
  getClockQuery,
  removeClockQuery,
  editClockQuery
}
