import db from '../dbconfig';

async function addEventQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Event" (title, description, project_id, location_id, character_id, item_id, lore_id) values($1,$2,$3,$4,$5,$6,$7) returning *`,
    values: [
      data.title,
      data.description,
      data.project_id,
      data.location_id,
      data.character_id,
      data.item_id,
      data.lore_id
    ]
  }
  return await db.query(query)
}

async function getEventQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Event" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getEventsQuery({projectId, limit, offset}) {
  const query = {
    text: /*sql*/ `select * from public."Event" where project_id = $1 order by date_created desc limit $2 offset $3`,
    values: [projectId, limit, offset]
  }
  return await db.query(query)
}

async function getEventsByLocationQuery(locationId) {
  const query = {
    text: /*sql*/ `select * from public."Event" where location_id = $1 order by date_created desc`,
    values: [locationId]
  }
  return await db.query(query)
}

async function getEventsByCharacterQuery(characterId) {
  const query = {
    text: /*sql*/ `select * from public."Event" where character_id = $1 order by date_created desc`,
    values: [characterId]
  }
  return await db.query(query)
}

async function getEventsByItemQuery(item) {
  const query = {
    text: /*sql*/ `select * from public."Event" where item_id = $1 order by date_created desc`,
    values: [item]
  }
  return await db.query(query)
}

async function getEventsByLoreQuery(lore) {
  const query = {
    text: /*sql*/ `select * from public."Event" where lore_id = $1 order by date_created desc`,
    values: [lore]
  }
  return await db.query(query)
}

async function removeEventQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Event" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editEventQuery(id, data) {
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
    text: /*sql*/ `update public."Event" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addEventQuery,
  getEventsQuery,
  getEventQuery,
  getEventsByLocationQuery,
  getEventsByCharacterQuery,
  getEventsByItemQuery,
  getEventsByLoreQuery,
  removeEventQuery,
  editEventQuery
};