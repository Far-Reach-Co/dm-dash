import db from "../dbconfig";

interface EventModel {
  id: number,
  title: string,
  description: string,
  location_id: number,
  date_created: string,
  calendar_date: string,
  calendar_id: number,
  clock_time_in_milliseconds: number,
  clock_id: number,
  project_id: number,
  character_id: number,
  item_id: number,
  lore_id: number
}

async function addEventQuery(data: {
  title: string,
  description?: string,
  project_id: string | number,
  location_id?: string | number,
  character_id?: string | number,
  item_id?: string | number,
  lore_id?: string | number
}) {
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
  return await db.query<EventModel>(query)
}

async function getEventQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Event" where id = $1`,
    values: [id]
  }
  return await db.query<EventModel>(query)
}

async function getEventsQuery({projectId, limit, offset}: {projectId: string, limit: string | number, offset: string | number}) {
  const query = {
    text: /*sql*/ `select * from public."Event" where project_id = $1 order by date_created desc limit $2 offset $3`,
    values: [projectId, limit, offset]
  }
  return await db.query<EventModel>(query)
}

async function getEventsByLocationQuery(locationId: string) {
  const query = {
    text: /*sql*/ `select * from public."Event" where location_id = $1 order by date_created desc`,
    values: [locationId]
  }
  return await db.query<EventModel>(query)
}

async function getEventsByCharacterQuery(characterId: string) {
  const query = {
    text: /*sql*/ `select * from public."Event" where character_id = $1 order by date_created desc`,
    values: [characterId]
  }
  return await db.query<EventModel>(query)
}

async function getEventsByItemQuery(itemId: string) {
  const query = {
    text: /*sql*/ `select * from public."Event" where item_id = $1 order by date_created desc`,
    values: [itemId]
  }
  return await db.query<EventModel>(query)
}

async function getEventsByLoreQuery(loreId: string) {
  const query = {
    text: /*sql*/ `select * from public."Event" where lore_id = $1 order by date_created desc`,
    values: [loreId]
  }
  return await db.query<EventModel>(query)
}

async function removeEventQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Event" where id = $1`,
    values: [id]
  }

  return await db.query<EventModel>(query)
}

async function editEventQuery(id: string, data: any) {
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

  return await db.query<EventModel>(query)
}

export {
  addEventQuery,
  getEventsQuery,
  getEventQuery,
  getEventsByLocationQuery,
  getEventsByCharacterQuery,
  getEventsByItemQuery,
  getEventsByLoreQuery,
  removeEventQuery,
  editEventQuery
}