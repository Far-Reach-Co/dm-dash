import db from "../dbconfig";
import { QueryResult } from "pg";
import { buildUpdateQuery } from "./utils";

export interface Day {
  id: number,
  title: string,
  calendar_id: number,
  index: number
}

async function addDayQuery(data: {
  calendar_id: string | number,
  index: number,
  title: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Day" (calendar_id, index, title) values($1,$2,$3) returning *`,
    values: [
      data.calendar_id,
      data.index,
      data.title
    ]
  }
  return await db.query<Day>(query)
}

async function getDayQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Day" where id = $1`,
    values: [id]
  }
  return await db.query<Day>(query)
}

async function getDaysQuery(calendarId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."Day" where calendar_id = $1 order by index asc`,
    values: [calendarId]
  }
  return await db.query<Day>(query)
}

async function getDaysByCalendarIdsQuery(calendarIds: (string | number)[]) {
  if (!calendarIds.length) {
    return {
      command: "SELECT",
      rowCount: 0,
      oid: 0,
      fields: [],
      rows: [],
    } as QueryResult<Day>;
  }
  const query = {
    text: /*sql*/ `
      select *
      from public."Day"
      where calendar_id = ANY($1)
      order by calendar_id asc, index asc
    `,
    values: [calendarIds],
  };
  return await db.query<Day>(query);
}

async function removeDayQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Day" where id = $1`,
    values: [id]
  }

  return await db.query<Day>(query)
}

async function editDayQuery(id: string, data: any) {
  const query = buildUpdateQuery("Day", data, id);
  return await db.query<Day>(query);
}

export {
  addDayQuery,
  getDaysQuery,
  getDaysByCalendarIdsQuery,
  getDayQuery,
  removeDayQuery,
  editDayQuery
}
