const db = require('../dbconfig')

async function addCharacterQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Character" (project_id, title, description, type, location_id) values($1,$2,$3,$4,$5) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.type,
      data.location_id
    ]
  }
  return await db.query(query)
}

async function getCharactersQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."Character" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query(query)
}

async function getCharactersByLocationQuery(locationId) {
  const query = {
    text: /*sql*/ `select * from public."Character" where location_id = $1 order by title asc`,
    values: [locationId]
  }
  return await db.query(query)
}

async function removeCharacterQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Character" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editCharacterQuery(id, data) {
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
    text: /*sql*/ `update public."Character" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addCharacterQuery,
  getCharactersQuery,
  getCharactersByLocationQuery,
  removeCharacterQuery,
  editCharacterQuery
}