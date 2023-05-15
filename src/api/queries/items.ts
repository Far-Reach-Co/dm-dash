import db from "../dbconfig";

async function addItemQuery(data: {
  project_id: string,
  title: string,
  description: string,
  type: string,
  location_id: string,
  character_id: string,
  image_id: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Item" (project_id, title, description, type, location_id, character_id, image_id) values($1,$2,$3,$4,$5,$6,$7) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.type,
      data.location_id,
      data.character_id,
      data.image_id
    ]
  }
  return await db.query(query)
}

async function getItemQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Item" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getItemsWithKeywordAndFilterQuery(
  {projectId, limit, offset, keyword, filter}: {projectId: string, limit: string, offset: string, keyword: string, filter: string}
) {
  const query = {
    text: /*sql*/ `select * from public."Item" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword, filter]
  }
  return await db.query(query)
}
async function getItemsWithKeywordQuery({projectId, limit, offset, keyword}: {projectId: string, limit: string, offset: string, keyword: string}) {
  const query = {
    text: /*sql*/ `select * from public."Item" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword]
  }
  return await db.query(query)
}
async function getItemsWithFilterQuery({projectId, limit, offset, filter}: {projectId: string, limit: string, offset: string, filter: string}) {
  const query = {
    text: /*sql*/ `select * from public."Item" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, filter]
  }
  return await db.query(query)
}

async function getItemsQuery({projectId, limit, offset}: {projectId: string, limit: string | number, offset: string | number}) {
  const query = {
    text: /*sql*/ `select * from public."Item" where project_id = $1 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset]
  }
  return await db.query(query)
}

async function getItemsByLocationQuery(locationId: string) {
  const query = {
    text: /*sql*/ `select * from public."Item" where location_id = $1 order by title asc`,
    values: [locationId]
  }
  return await db.query(query)
}

async function getItemsByCharacterQuery(characterId: string) {
  const query = {
    text: /*sql*/ `select * from public."Item" where character_id = $1 order by title asc`,
    values: [characterId]
  }
  return await db.query(query)
}

async function removeItemQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Item" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editItemQuery(id: string, data: any) {
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

export {
  addItemQuery,
  getItemsQuery,
  getItemQuery,
  getItemsWithFilterQuery,
  getItemsWithKeywordQuery,
  getItemsWithKeywordAndFilterQuery,
  getItemsByLocationQuery,
  getItemsByCharacterQuery,
  removeItemQuery,
  editItemQuery
}