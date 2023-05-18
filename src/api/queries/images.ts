import db from "../dbconfig";

interface ImageModal {
  id: number,
  original_name: string,
  size: number,
  file_name: string
}

async function addImageQuery(data: {
  original_name: string,
  size: number,
  file_name: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Image" (original_name, size, file_name) values($1,$2,$3) returning *`,
    values: [
      data.original_name,
      data.size,
      data.file_name
    ]
  }
  return await db.query<ImageModal>(query)
}

async function getImageQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."Image" where id = $1`,
    values: [id]
  }
  return await db.query<ImageModal>(query)
}

async function removeImageQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."Image" where id = $1`,
    values: [id]
  }

  return await db.query<ImageModal>(query)
}

async function editImageQuery(id: string, data: any) {
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

  return await db.query<ImageModal>(query)
}

export {
  addImageQuery,
  getImageQuery,
  removeImageQuery,
  editImageQuery
}