const db = require('../dbconfig')

async function addItemQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Item" (project_id, title, description, type, location_id, character_id) values($1,$2,$3,$4,$5,$6) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.type,
      data.location_id,
      data.character_id
    ]
  }
  return await db.query(query)
}

async function getItemsQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."Item" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query(query)
}

async function getItemsByLocationQuery(locationId) {
  const query = {
    text: /*sql*/ `select * from public."Item" where location_id = $1 order by title asc`,
    values: [locationId]
  }
  return await db.query(query)
}

async function getItemsByCharacterQuery(characterId) {
  const query = {
    text: /*sql*/ `select * from public."Item" where character_id = $1 order by title asc`,
    values: [characterId]
  }
  return await db.query(query)
}

async function removeItemQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Item" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editItemQuery(id, data) {
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
    text: /*sql*/ `update public."Item" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addItemQuery,
  getItemsQuery,
  getItemsByLocationQuery,
  getItemsByCharacterQuery,
  removeItemQuery,
  editItemQuery
}