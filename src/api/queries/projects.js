const db = require('../dbconfig')

async function addProjectQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Project" (title, user_id) values($1,$2) returning *`,
    values: [
      data.title,
      data.user_id,
    ]
  }
  return await db.query(query)
}

async function getProjectsQuery(userId) {
  const query = {
    text: /*sql*/ `select * from public."Project" where user_id = $1 order by title asc`,
    values: [userId]
  }
  return await db.query(query)
}

async function removeProjectQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Project" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editProjectQuery(id, data) {
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
    text: /*sql*/ `update public."Project" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addProjectQuery,
  getProjectsQuery,
  removeProjectQuery,
  editProjectQuery
}