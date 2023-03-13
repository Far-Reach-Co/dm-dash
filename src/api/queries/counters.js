import db from '../dbconfig.js';

async function addCounterQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Counter" (user_id, project_id, current_count, title) values($1,$2,$3,$4) returning *`,
    values: [
      data.user_id,
      data.project_id,
      data.current_count,
      data.title
    ]
  }
  return await db.query(query)
}

async function getCounterQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Counter" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getCountersQuery(userId, projectId) {
  const query = {
    text: /*sql*/ `select * from public."Counter" where user_id = $1 and project_id = $2 order by title asc`,
    values: [userId, projectId]
  }
  return await db.query(query)
}

async function getAllCountersByProjectQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."Counter" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query(query)
}

async function removeCounterQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Counter" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editCounterQuery(id, data) {
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
    text: /*sql*/ `update public."Counter" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addCounterQuery,
  getCountersQuery,
  getCounterQuery,
  getAllCountersByProjectQuery,
  removeCounterQuery,
  editCounterQuery
};