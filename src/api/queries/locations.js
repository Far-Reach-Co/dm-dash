const db = require('../dbconfig')

async function addLocationQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Location" (project_id, title, description, is_sub, parent_location_id) values($1,$2,$3,$4,$5) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.is_sub,
      data.parent_location_id
    ]
  }
  return await db.query(query)
}

async function getLocationQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Location" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getLocationsQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."Location" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query(query)
}

async function getSubLocationsQuery(parentLocationId) {
  const query = {
    text: /*sql*/ `select * from public."Location" where parent_location_id = $1 order by title asc`,
    values: [parentLocationId]
  }
  return await db.query(query)
}

async function removeLocationQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Location" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editLocationQuery(id, data) {
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

module.exports = {
  getLocationQuery,
  addLocationQuery,
  getLocationsQuery,
  getSubLocationsQuery,
  removeLocationQuery,
  editLocationQuery
}