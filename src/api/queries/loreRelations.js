const db = require('../dbconfig')

async function addLoreRelationQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."LoreRelation" (lore_id, location_id, character_id, item_id) values($1,$2,$3,$4) returning *`,
    values: [
      data.lore_id,
      data.location_id,
      data.character_id,
      data.item_id
    ]
  }
  return await db.query(query)
}

async function getLoreRelationsByLoreQuery(loreId, type) {
  let query;

  if(type === "locations") {
    query = {
      text: /*sql*/ `select * from public."LoreRelation" where lore_id = $1 and location_id is not null`,
      values: [loreId]
    }
  }

  if(type === "characters") {
    query = {
      text: /*sql*/ `select * from public."LoreRelation" where lore_id = $1 and character_id is not null`,
      values: [loreId]
    }
  }

  if(type === "items") {
    query = {
      text: /*sql*/ `select * from public."LoreRelation" where lore_id = $1 and item_id is not null`,
      values: [loreId]
    }
  }

  return await db.query(query)
}

async function getLoreRelationsByLocationQuery(locationId) {
  const query = {
    text: /*sql*/ `select * from public."LoreRelation" where location_id = $1`,
    values: [locationId]
  }
  return await db.query(query)
}

async function getLoreRelationsByCharacterQuery(characterId) {
  const query = {
    text: /*sql*/ `select * from public."LoreRelation" where character_id = $1`,
    values: [characterId]
  }
  return await db.query(query)
}

async function getLoreRelationsByItemQuery(itemId) {
  const query = {
    text: /*sql*/ `select * from public."LoreRelation" where item_id = $1`,
    values: [itemId]
  }
  return await db.query(query)
}

async function getLoreRelationQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."LoreRelation" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getLoreRelationsQuery(loreId) {
  const query = {
    text: /*sql*/ `select * from public."LoreRelation" where lore_id = $1`,
    values: [loreId]
  }
  return await db.query(query)
}

async function removeLoreRelationQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."LoreRelation" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editLoreRelationQuery(id, data) {
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
    text: /*sql*/ `update public."LoreRelation" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addLoreRelationQuery,
  getLoreRelationQuery,
  removeLoreRelationQuery,
  editLoreRelationQuery,
  getLoreRelationsByLoreQuery,
  getLoreRelationsByLocationQuery,
  getLoreRelationsByCharacterQuery,
  getLoreRelationsByItemQuery,
  getLoreRelationsQuery
}