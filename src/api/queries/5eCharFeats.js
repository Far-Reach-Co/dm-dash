import db from '../dbconfig';

async function add5eCharFeatQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_feat_trait" (general_id, title, description, type) values($1,$2,$3,$4) returning *`,
    values: [
      data.general_id,
      data.title,
      data.description,
      data.type,
    ]
  }
  return await db.query(query)
}

async function get5eCharFeatQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_feat_trait" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharFeatsByGeneralQuery(generalId) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_feat_trait" where general_id = $1`,
    values: [generalId]
  }
  return await db.query(query)
}

async function remove5eCharFeatQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_feat_trait" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharFeatQuery(id, data) {
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

  return await db.query(query)
}

export default {
  add5eCharFeatQuery,
  get5eCharFeatsByGeneralQuery,
  get5eCharFeatQuery,
  remove5eCharFeatQuery,
  edit5eCharFeatQuery
};