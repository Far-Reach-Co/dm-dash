import db from "../dbconfig";

export interface TableFolderModel {
  id: number,
  title: string,
  user_id?: number,
  project_id?: number,
  is_sub: boolean,
  parent_folder_id?: number
}

async function addTableFolderByProjectQuery(data: {
  project_id: string | number,
  title: string,
  is_sub: boolean,
  parent_folder_id: string | number
}) {
  const query = {
    text: /*sql*/ `insert into public."TableFolder" (project_id, title, is_sub, parent_folder_id) values($1,$2,$3,$4) returning *`,
    values: [
      data.project_id,
      data.title,
      data.is_sub,
      data.parent_folder_id
    ]
  }
  return await db.query<TableFolderModel>(query)
}

async function addTableFolderByUserQuery(data: {
  user_id: string | number,
  title: string,
  is_sub: boolean,
  parent_folder_id: string | number
}) {
  const query = {
    text: /*sql*/ `insert into public."TableFolder" (user_id, title, is_sub, parent_folder_id) values($1,$2,$3,$4) returning *`,
    values: [
      data.user_id,
      data.title,
      data.is_sub,
      data.parent_folder_id
    ]
  }
  return await db.query<TableFolderModel>(query)
}

async function getTableFolderQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."TableFolder" where id = $1`,
    values: [id]
  }
  return await db.query<TableFolderModel>(query)
}

async function getTableFoldersByUserQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableFolder" where user_id = $1 order by id`,
    values: [userId]
  }
  return await db.query<TableFolderModel>(query)
}

async function getTableFoldersByProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableFolder" where project_id = $1 order by id`,
    values: [projectId]
  }
  return await db.query<TableFolderModel>(query)
}

async function getTableFoldersByParentQuery(parentFolderId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableFolder" where parent_folder_id = $1 order by id`,
    values: [parentFolderId]
  }
  return await db.query<TableFolderModel>(query)
}

async function removeTableFolderQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."TableFolder" where id = $1`,
    values: [id]
  }

  return await db.query<TableFolderModel>(query)
}

async function editTableFolderQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."TableFolder" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<TableFolderModel>(query)
}

export {
  addTableFolderByProjectQuery,
  addTableFolderByUserQuery,
  getTableFoldersByProjectQuery,
  getTableFoldersByUserQuery,
  getTableFoldersByParentQuery,
  getTableFolderQuery,
  removeTableFolderQuery,
  editTableFolderQuery
}