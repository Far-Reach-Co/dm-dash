const db = require('../dbconfig')

async function addLoreQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Lore" (project_id, title, description, type, location_id, character_id, item_id, image_id) values($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.type,
      data.location_id,
      data.character_id,
      data.item_id,
      data.image_id
    ]
  }
  return await db.query(query)
}

async function getLoreQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getLoresWithKeywordAndFilterQuery({projectId, limit, offset, keyword, filter}) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword, filter]
  }
  return await db.query(query)
}
async function getLoresWithKeywordQuery({projectId, limit, offset, keyword}) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword]
  }
  return await db.query(query)
}
async function getLoresWithFilterQuery({projectId, limit, offset, filter}) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, filter]
  }
  return await db.query(query)
}

async function getLoresQuery({projectId, limit, offset}) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset]
  }
  return await db.query(query)
}

async function getLoresByLocationQuery(locationId) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where location_id = $1 order by title asc`,
    values: [locationId]
  }
  return await db.query(query)
}

async function getLoresByCharacterQuery(characterId) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where character_id = $1 order by title asc`,
    values: [characterId]
  }
  return await db.query(query)
}

async function getLoresByItemQuery(itemId) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where item_id = $1 order by title asc`,
    values: [itemId]
  }
  return await db.query(query)
}

async function removeLoreQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Lore" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editLoreQuery(id, data) {
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
    text: /*sql*/ `update public."Lore" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addLoreQuery,
  getLoresQuery,
  getLoreQuery,
  getLoresWithFilterQuery,
  getLoresWithKeywordQuery,
  getLoresWithKeywordAndFilterQuery,
  getLoresByLocationQuery,
  getLoresByCharacterQuery,
  getLoresByItemQuery,
  removeLoreQuery,
  editLoreQuery
}