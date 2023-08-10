import db from "../dbconfig";

interface TableImageModel {
  id: number,
  project_id?: number,
  user_id?: number,
  image_id: number
  folder_id?: number
}

async function addTableImageByProjectQuery(data: {project_id: string, image_id: string, folder_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."TableImage" (project_id, image_id, folder_id) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.image_id,
      data.folder_id
    ]
  }
  return await db.query<TableImageModel>(query)
}

async function addTableImageByUserQuery(data: {user_id: string, image_id: string, folder_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."TableImage" (user_id, image_id, folder_id) values($1,$2,$3) returning *`,
    values: [
      data.user_id,
      data.image_id,
      data.folder_id
    ]
  }
  return await db.query<TableImageModel>(query)
}

async function getTableImageQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where id = $1`,
    values: [id]
  }
  return await db.query<TableImageModel>(query)
}

async function getTableImagesByFolderQuery(folder_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where folder_id = $1`,
    values: [folder_id]
  }
  return await db.query<TableImageModel>(query)
}

async function getTableImagesByProjectQuery(project_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where project_id = $1`,
    values: [project_id]
  }
  return await db.query<TableImageModel>(query)
}

async function getTableImagesByUserQuery(user_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where user_id = $1`,
    values: [user_id]
  }
  return await db.query<TableImageModel>(query)
}

async function removeTableImageQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."TableImage" where id = $1`,
    values: [id]
  }

  return await db.query<TableImageModel>(query)
}

async function editTableImageQuery(id: string | number, data: any) {
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

  return await db.query<TableImageModel>(query)
}

export {
  addTableImageByProjectQuery,
  addTableImageByUserQuery,
  getTableImagesByProjectQuery,
  getTableImagesByUserQuery,
  getTableImagesByFolderQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery
}