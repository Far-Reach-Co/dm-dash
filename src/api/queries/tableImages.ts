import db from "../dbconfig";

interface TableImage {
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
  return await db.query<TableImage>(query)
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
  return await db.query<TableImage>(query)
}

async function getTableImageQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where id = $1`,
    values: [id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImagesByFolderQuery(folder_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where folder_id = $1`,
    values: [folder_id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImagesByProjectQuery(project_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where project_id = $1`,
    values: [project_id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImagesByUserQuery(user_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where user_id = $1`,
    values: [user_id]
  }
  return await db.query<TableImage>(query)
}

interface TableImageWithImage extends TableImage {
  original_name: string;
  size: number;
  file_name: string;
  notes: string;
  is_blocked: boolean;
}

async function getTableImagesWithImageByProjectQuery(project_id: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, ri.record_id, r.title, r.description
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
    `,
    values: [project_id]
  }
  return await db.query<TableImageWithImage>(query)
}

async function getTableImagesWithImageByUserQuery(user_id: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, ri.record_id, r.title AS record_title, r.description AS record_desc
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
    `,
    values: [user_id]
  }
  return await db.query<TableImageWithImage>(query)
}

async function removeTableImageQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."TableImage" where id = $1`,
    values: [id]
  }

  return await db.query<TableImage>(query)
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

  return await db.query<TableImage>(query)
}

export {
  addTableImageByProjectQuery,
  addTableImageByUserQuery,
  getTableImagesByProjectQuery,
  getTableImagesByUserQuery,
  getTableImagesByFolderQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery,
  getTableImagesWithImageByProjectQuery,
  getTableImagesWithImageByUserQuery,
  TableImageWithImage
}