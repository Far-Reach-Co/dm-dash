import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export interface Calendar {
  id: number,
  project_id: number,
  title: string,
  year: number,
  current_month_id: number,
  current_day: number
}

async function addCalendarQuery(data: {
  project_id: string | number,
  title: string,
  year: number
}) {
  const query = {
    text: /*sql*/ `insert into public."Calendar" (project_id, title, year) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.title,
      data.year
    ]
  }
  return await db.query<Calendar>(query)
}

async function getCalendarQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Calendar" where id = $1`,
    values: [id]
  }
  return await db.query<Calendar>(query)
}

async function getCalendarsQuery(projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."Calendar" where project_id = $1 order by id`,
    values: [projectId]
  }
  return await db.query<Calendar>(query)
}

async function removeCalendarQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Calendar" where id = $1`,
    values: [id]
  }

  return await db.query<Calendar>(query)
}

async function editCalendarQuery(id: string, data: any) {
  const query = buildUpdateQuery("Calendar", data, id);
  return await db.query<Calendar>(query);
}

export {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery
}
