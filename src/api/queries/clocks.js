const db = require('../dbconfig')

async function addClockQuery(data) {
  const query = {
    text: /*sql*/ `
      insert into public."Clock" (
        title,
        current_time_in_milliseconds
      ) values($1,$2)
      returning *
    `,
    values: [
      data.title,
      data.current_time_in_milliseconds,
    ]
  }
  return await db.query(query)
}

async function getClocksQuery() {
  const query = {
    text: /*sql*/ `select * from public."Clock" order by title asc`,
  }
  return await db.query(query)
}

async function removeClockQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Clock" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editClockQuery(id, data) {
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
    text: /*sql*/ `update public."Clock" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addClockQuery,
  getClocksQuery,
  removeClockQuery,
  editClockQuery
}