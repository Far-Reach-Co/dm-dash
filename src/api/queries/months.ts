import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export interface Month {
  id: number,
  calendar_id: number,
  index: number,
  title: string,
  number_of_days: number
}

async function addMonthQuery(data: {
  calendar_id: string | number,
  index: number,
  title: string,
  number_of_days: number
}) {
  const query = {
    text: /*sql*/ `insert into public."Month" (calendar_id, index, title, number_of_days) values($1,$2,$3,$4) returning *`,
    values: [
      data.calendar_id,
      data.index,
      data.title,
      data.number_of_days
    ]
  }
  return await db.query<Month>(query)
}

async function getMonthQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Month" where id = $1`,
    values: [id]
  }
  return await db.query<Month>(query)
}

async function getMonthsQuery(calendarId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."Month" where calendar_id = $1 order by index asc`,
    values: [calendarId]
  }
  return await db.query<Month>(query)
}

async function removeMonthQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."Month" where id = $1`,
    values: [id]
  }

  return await db.query<Month>(query)
}

async function editMonthQuery(id: string, data: any) {
  const query = buildUpdateQuery("Month", data, id);
  return await db.query<Month>(query);
}

export {
  addMonthQuery,
  getMonthsQuery,
  getMonthQuery,
  removeMonthQuery,
  editMonthQuery
}
