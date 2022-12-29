const db = require('../dbconfig')

async function addNoteQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Note" (title, description, project_id, location_id, character_id) values($1,$2,$3,$4,$5) returning *`,
    values: [
      data.title,
      data.description,
      data.project_id,
      data.location_id,
      data.character_id
    ]
  }
  return await db.query(query)
}

async function getNotesQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."Note" where project_id = $1 order by date_created desc`,
    values: [projectId]
  }
  return await db.query(query)
}

async function getNotesByLocationQuery(locationId) {
  const query = {
    text: /*sql*/ `select * from public."Note" where location_id = $1 order by date_created desc`,
    values: [locationId]
  }
  return await db.query(query)
}

async function getNotesByCharacterQuery(characterId) {
  const query = {
    text: /*sql*/ `select * from public."Note" where character_id = $1 order by date_created desc`,
    values: [characterId]
  }
  return await db.query(query)
}

async function removeNoteQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Note" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editNoteQuery(id, data) {
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
    text: /*sql*/ `update public."Note" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addNoteQuery,
  getNotesQuery,
  getNotesByLocationQuery,
  getNotesByCharacterQuery,
  removeNoteQuery,
  editNoteQuery
}