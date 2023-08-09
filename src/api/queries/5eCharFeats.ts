import db from "../dbconfig";

interface DndFiveEFeatModel {
  id: number,
  type: string,
  title: string,
  description: string,
  general_id: number
}

async function add5eCharFeatQuery(data: {
  general_id: string,
  title: string,
  description: string,
  type: string
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_feat_trait" (general_id, title, description, type) values($1,$2,$3,$4) returning *`,
    values: [
      data.general_id,
      data.title,
      data.description,
      data.type,
    ]
  }
  return await db.query<DndFiveEFeatModel>(query)
}

async function get5eCharFeatQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_feat_trait" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEFeatModel>(query)
}

async function get5eCharFeatsByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_feat_trait" where general_id = $1 order by id`,
    values: [generalId]
  }
  return await db.query<DndFiveEFeatModel>(query)
}

async function remove5eCharFeatQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_feat_trait" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEFeatModel>(query)
}

async function edit5eCharFeatQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."dnd_5e_character_feat_trait" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<DndFiveEFeatModel>(query)
}

export {
  add5eCharFeatQuery,
  get5eCharFeatsByGeneralQuery,
  get5eCharFeatQuery,
  remove5eCharFeatQuery,
  edit5eCharFeatQuery
}