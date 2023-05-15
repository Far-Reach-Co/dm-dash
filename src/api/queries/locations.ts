import db from "../dbconfig";

async function addLocationQuery(data: {
  project_id: string,
  title: string,
  description: string,
  is_sub: boolean,
  parent_location_id: string,
  type: string,
  image_id: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Location" (project_id, title, description, is_sub, parent_location_id, type, image_id) values($1,$2,$3,$4,$5,$6,$7) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.is_sub,
      data.parent_location_id,
      data.type,
      data.image_id
    ]
  }
  return await db.query(query)
}

async function getLocationQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Location" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getLocationsWithKeywordAndFilterQuery(
  {projectId, limit, offset, keyword, filter}: {projectId: string, limit: string, offset: string, keyword: string, filter: string}
) {
  const query = {
    text: /*sql*/ `select * from public."Location" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword, filter]
  }
  return await db.query(query)
}
async function getLocationsWithKeywordQuery({projectId, limit, offset, keyword}: {projectId: string, limit: string, offset: string, keyword: string}) {
  const query = {
    text: /*sql*/ `select * from public."Location" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword]
  }
  return await db.query(query)
}
async function getLocationsWithFilterQuery({projectId, limit, offset, filter}: {projectId: string, limit: string, offset: string, filter: string}) {
  const query = {
    text: /*sql*/ `select * from public."Location" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, filter]
  }
  return await db.query(query)
}

async function getLocationsQuery({projectId, limit, offset}: {projectId: string, limit: string | number, offset: string | number}) {
  const query = {
    text: /*sql*/ `select * from public."Location" where project_id = $1 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset]
  }
  return await db.query(query)
}

async function getSubLocationsQuery(parentLocationId: string) {
  const query = {
    text: /*sql*/ `select * from public."Location" where parent_location_id = $1 order by title asc`,
    values: [parentLocationId]
  }
  return await db.query(query)
}

async function removeLocationQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Location" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editLocationQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."Location" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export {
  getLocationQuery,
  addLocationQuery,
  getLocationsQuery,
  getLocationsWithFilterQuery,
  getLocationsWithKeywordQuery,
  getLocationsWithKeywordAndFilterQuery,
  getSubLocationsQuery,
  removeLocationQuery,
  editLocationQuery
}