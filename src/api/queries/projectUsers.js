import db from '../dbconfig.js';

async function addProjectUserQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."ProjectUser" (project_id, user_id, is_editor) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.user_id,
      data.is_editor
    ]
  }
  return await db.query(query)
}

async function getProjectUsersQuery(userId) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where user_id = $1`,
    values: [userId]
  }
  return await db.query(query)
}

async function getProjectUserByUserAndProjectQuery(userId, projectId) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where user_id = $1 and project_id = $2`,
    values: [userId, projectId]
  }
  return await db.query(query)
}

async function getProjectUsersByProjectQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where project_id = $1`,
    values: [projectId]
  }
  return await db.query(query)
}

async function getProjectUserQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."ProjectUser" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function removeProjectUserQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."ProjectUser" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editProjectUserQuery(id, data) {
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
    text: /*sql*/ `update public."ProjectUser" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addProjectUserQuery,
  getProjectUserQuery,
  getProjectUsersQuery,
  getProjectUsersByProjectQuery,
  removeProjectUserQuery,
  editProjectUserQuery,
  getProjectUserByUserAndProjectQuery
};