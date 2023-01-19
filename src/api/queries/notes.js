const db = require('../dbconfig')

async function addNoteQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Note" (title, description, project_id, location_id, character_id, item_id, user_id) values($1,$2,$3,$4,$5,$6,$7) returning *`,
    values: [
      data.title,
      data.description,
      data.project_id,
      data.location_id,
      data.character_id,
      data.item_id,
      data.user_id
    ]
  }
  return await db.query(query)
}

async function getNotesQuery(userId, projectId, limit, offset, keyword) {
  let query;
  if(!keyword) {
    query = {
      text: /*sql*/ `select * from public."Note" where user_id = $1 and project_id = $2 and location_id is null and character_id is null and item_id is null order by date_created desc limit $3 offset $4`,
      values: [userId, projectId, limit, offset]
    }
    return await db.query(query)
  }
  query = {
    text: /*sql*/ `select * from public."Note" where user_id = $1 and project_id = $2 and position($5 in lower(title))>0 and location_id is null and character_id is null and item_id is null order by date_created desc limit $3 offset $4`,
    values: [userId, projectId, limit, offset, keyword]
  }
  return await db.query(query)
}

async function getNotesByLocationQuery(userId, locationId) {
  const query = {
    text: /*sql*/ `select * from public."Note" where user_id = $2 and location_id = $1 order by date_created desc`,
    values: [locationId, userId]
  }
  return await db.query(query)
}

async function getNotesByCharacterQuery(userId, characterId) {
  const query = {
    text: /*sql*/ `select * from public."Note" where user_id = $2 and character_id = $1 order by date_created desc`,
    values: [characterId, userId]
  }
  return await db.query(query)
}

async function getNotesByItemQuery(userId, item) {
  const query = {
    text: /*sql*/ `select * from public."Note" where user_id = $2 and item_id = $1 order by date_created desc`,
    values: [item, userId]
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
  getNotesByItemQuery,
  removeNoteQuery,
  editNoteQuery
}