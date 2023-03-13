import db from '../dbconfig';

async function addMonthQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Month" (calendar_id, index, title, number_of_days) values($1,$2,$3,$4) returning *`,
    values: [
      data.calendar_id,
      data.index,
      data.title,
      data.number_of_days
    ]
  }
  return await db.query(query)
}

async function getMonthQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Month" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getMonthsQuery(calendarId) {
  const query = {
    text: /*sql*/ `select * from public."Month" where calendar_id = $1 order by index asc`,
    values: [calendarId]
  }
  return await db.query(query)
}

async function removeMonthQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Month" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editMonthQuery(id, data) {
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
    text: /*sql*/ `update public."Month" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addMonthQuery,
  getMonthsQuery,
  getMonthQuery,
  removeMonthQuery,
  editMonthQuery
};