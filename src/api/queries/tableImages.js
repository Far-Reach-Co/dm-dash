import db from '../dbconfig';

async function addTableImageQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."TableImage" (project_id, image_id) values($1,$2) returning *`,
    values: [
      data.project_id,
      data.image_id,
    ]
  }
  return await db.query(query)
}

async function getTableImageQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getTableImagesQuery(project_id) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where project_id = $1`,
    values: [project_id]
  }
  return await db.query(query)
}

async function removeTableImageQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."TableImage" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editTableImageQuery(id, data) {
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
    text: /*sql*/ `update public."TableImage" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addTableImageQuery,
  getTableImagesQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery
};