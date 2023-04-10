const db = require('../dbconfig')

async function addCharacterQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Character" (project_id, title, description, type, location_id, image_id) values($1,$2,$3,$4,$5,$6) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.type,
      data.location_id,
      data.image_id
    ]
  }
  return await db.query(query)
}

async function getCharacterQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Character" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getCharactersWithKeywordAndFilterQuery({projectId, limit, offset, keyword, filter}) {
  const query = {
    text: /*sql*/ `select * from public."Character" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword, filter]
  }
  return await db.query(query)
}
async function getCharactersWithKeywordQuery({projectId, limit, offset, keyword}) {
  const query = {
    text: /*sql*/ `select * from public."Character" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword]
  }
  return await db.query(query)
}
async function getCharactersWithFilterQuery({projectId, limit, offset, filter}) {
  const query = {
    text: /*sql*/ `select * from public."Character" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, filter]
  }
  return await db.query(query)
}

async function getCharactersQuery({projectId, limit, offset}) {
  const query = {
    text: /*sql*/ `select * from public."Character" where project_id = $1 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset]
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
  getCharacterQuery,
  getCharactersQuery,
  getCharactersWithFilterQuery,
  getCharactersWithKeywordQuery,
  getCharactersWithKeywordAndFilterQuery,
  getCharactersByLocationQuery,
  removeCharacterQuery,
  editCharacterQuery
}