import db from '../dbconfig.js';

async function addClockQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Clock" (title, current_time_in_milliseconds, project_id) values($1,$2,$3) returning *`,
    values: [
      data.title,
      data.current_time_in_milliseconds,
      data.project_id
    ]
  }
  return await db.query(query)
}

async function getClockQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Clock" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getClocksQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."Clock" where project_id = $1 order by title asc`,
    values: [projectId]
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

export {
  addClockQuery,
  getClocksQuery,
  getClockQuery,
  removeClockQuery,
  editClockQuery
};