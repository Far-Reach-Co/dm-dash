import db from '../dbconfig';

async function addCalendarQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Calendar" (project_id, title, year) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.title,
      data.year
    ]
  }
  return await db.query(query)
}

async function getCalendarQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Calendar" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getCalendarsQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."Calendar" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query(query)
}

async function removeCalendarQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Calendar" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editCalendarQuery(id, data) {
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

  return await db.query(query)
}

export default {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery
};