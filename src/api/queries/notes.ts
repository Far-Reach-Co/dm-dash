import db from "../dbconfig";

interface NoteModel {
  id: number,
  title: string,
  description: string,
  location_id: number,
  date_created: string,
  project_id: number,
  character_id: number,
  item_id: number,
  user_id: number,
  lore_id: number
}

async function addNoteQuery(data: {
  title: string, 
  description: string, 
  project_id: string, 
  location_id: string, 
  character_id: string, 
  item_id: string, 
  user_id: string, 
  lore_id: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Note" (title, description, project_id, location_id, character_id, item_id, user_id, lore_id) values($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    values: [
      data.title,
      data.description,
      data.project_id,
      data.location_id,
      data.character_id,
      data.item_id,
      data.user_id,
      data.lore_id
    ]
  }
  return await db.query<NoteModel>(query)
}

async function getNoteQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Note" where id = $1`,
    values: [id]
  }
  return await db.query<NoteModel>(query)
}

async function getAllNotesByProjectQuery(projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."Note" where project_id = $1`,
    values: [projectId]
  }
  return await db.query<NoteModel>(query)
}

async function getNotesQuery(userId: string, projectId: string, limit: string, offset: string, keyword: string) {
  let query;
  if(!keyword) {
    query = {
      text: /*sql*/ `select * from public."Note" where user_id = $1 and project_id = $2 and location_id is null and character_id is null and item_id is null and lore_id is null order by date_created desc limit $3 offset $4`,
      values: [userId, projectId, limit, offset]
    }
    return await db.query<NoteModel>(query)
  }
  query = {
    text: /*sql*/ `select * from public."Note" where user_id = $1 and project_id = $2 and position($5 in lower(title))>0 and location_id is null and character_id is null and item_id is null and lore_id is null order by date_created desc limit $3 offset $4`,
    values: [userId, projectId, limit, offset, keyword]
  }
  return await db.query<NoteModel>(query)
}

async function getNotesByLocationQuery(userId: string, locationId: string) {
  const query = {
    text: /*sql*/ `select * from public."Note" where user_id = $2 and location_id = $1 order by date_created desc`,
    values: [locationId, userId]
  }
  return await db.query<NoteModel>(query)
}

async function getNotesByCharacterQuery(userId: string, characterId: string) {
  const query = {
    text: /*sql*/ `select * from public."Note" where user_id = $2 and character_id = $1 order by date_created desc`,
    values: [characterId, userId]
  }
  return await db.query<NoteModel>(query)
}

async function getNotesByItemQuery(userId: string, itemId: string) {
  const query = {
    text: /*sql*/ `select * from public."Note" where user_id = $2 and item_id = $1 order by date_created desc`,
    values: [itemId, userId]
  }
  return await db.query<NoteModel>(query)
}

async function getNotesByLoreQuery(userId: string, loreId: string) {
  const query = {
    text: /*sql*/ `select * from public."Note" where user_id = $2 and lore_id = $1 order by date_created desc`,
    values: [loreId, userId]
  }
  return await db.query<NoteModel>(query)
}

async function removeNoteQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Note" where id = $1`,
    values: [id]
  }

  return await db.query<NoteModel>(query)
}

async function editNoteQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."Note" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<NoteModel>(query)
}

export {
  addNoteQuery,
  getNotesQuery,
  getNoteQuery,
  getNotesByLocationQuery,
  getNotesByCharacterQuery,
  getNotesByItemQuery,
  getNotesByLoreQuery,
  removeNoteQuery,
  editNoteQuery,
  getAllNotesByProjectQuery
}