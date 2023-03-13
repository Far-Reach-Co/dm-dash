import db from '../dbconfig.js';

async function addTableViewQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."TableView" (project_id) values($1) returning *`,
    values: [
      data.project_id,
    ]
  }
  return await db.query(query)
}

async function getTableViewQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getTableViewsQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where project_id = $1`,
    values: [projectId]
  }
  return await db.query(query)
}

async function removeTableViewQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."TableView" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editTableViewQuery(id, data) {
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
    text: /*sql*/ `update public."TableView" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addTableViewQuery,
  getTableViewsQuery,
  getTableViewQuery,
  removeTableViewQuery,
  editTableViewQuery
};