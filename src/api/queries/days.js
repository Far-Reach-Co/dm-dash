import db from '../dbconfig.js';

async function addDayQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Day" (calendar_id, index, title) values($1,$2,$3) returning *`,
    values: [
      data.calendar_id,
      data.index,
      data.title
    ]
  }
  return await db.query(query)
}

async function getDayQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Day" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getDaysQuery(calendarId) {
  const query = {
    text: /*sql*/ `select * from public."Day" where calendar_id = $1 order by index asc`,
    values: [calendarId]
  }
  return await db.query(query)
}

async function removeDayQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Day" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editDayQuery(id, data) {
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
    text: /*sql*/ `update public."Day" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addDayQuery,
  getDaysQuery,
  getDayQuery,
  removeDayQuery,
  editDayQuery
};