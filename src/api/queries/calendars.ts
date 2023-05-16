import db from "../dbconfig";

interface CalendarModel {
  id: number,
  project_id: number,
  title: string,
  year: number,
  current_month_id: number,
  current_day: number
}

async function addCalendarQuery(data: {
  project_id: string,
  title: string,
  year: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Calendar" (project_id, title, year) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.title,
      data.year
    ]
  }
  return await db.query<CalendarModel>(query)
}

async function getCalendarQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Calendar" where id = $1`,
    values: [id]
  }
  return await db.query<CalendarModel>(query)
}

async function getCalendarsQuery(projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."Calendar" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query<CalendarModel>(query)
}

async function removeCalendarQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Calendar" where id = $1`,
    values: [id]
  }

  return await db.query<CalendarModel>(query)
}

async function editCalendarQuery(id: string, data: any) {
  let edits = ``
  let values = []
  let iterator = 1

  for(const [key, value] of Object.entries(data)) {
    edits += `${key} = $${iterator}, `;
    values.push(value)
    iterator++
  }

  edits = edits.slice(0, -2)
  values.push(id)

  const query = {
    text: /*sql*/ `update public."Calendar" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<CalendarModel>(query)
}

export {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery
}