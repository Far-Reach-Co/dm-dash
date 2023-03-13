import db from '../dbconfig.js';

async function addImageQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Image" (original_name, size, file_name) values($1,$2,$3) returning *`,
    values: [
      data.original_name,
      data.size,
      data.file_name
    ]
  }
  return await db.query(query)
}

async function getImageQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."Image" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function removeImageQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Image" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editImageQuery(id, data) {
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
    text: /*sql*/ `update public."Image" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  addImageQuery,
  getImageQuery,
  removeImageQuery,
  editImageQuery
};