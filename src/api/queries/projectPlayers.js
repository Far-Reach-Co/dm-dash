const db = require('../dbconfig')

async function addProjectPlayerQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."ProjectPlayer" (project_id, player_id) values($1,$2) returning *`,
    values: [
      data.project_id,
      data.player_id,
    ]
  }
  return await db.query(query)
}

async function getProjectPlayersByProjectQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where project_id = $1`,
    values: [projectId]
  }
  return await db.query(query)
}

async function getProjectPlayersByPlayerQuery(playerId) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where player_id = $1`,
    values: [playerId]
  }
  return await db.query(query)
}

async function getProjectPlayerQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function removeProjectPlayerQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."ProjectPlayer" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editProjectPlayerQuery(id, data) {
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
    text: /*sql*/ `update public."ProjectPlayer" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addProjectPlayerQuery,
  getProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
  getProjectPlayersByPlayerQuery,
  removeProjectPlayerQuery,
  editProjectPlayerQuery,
}