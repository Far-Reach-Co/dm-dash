const db = require('../dbconfig')

async function add5eCharOtherProLangQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_other_pro_lang" (general_id, type) values($1,$2) returning *`,
    values: [
      data.general_id,
      data.type,
    ]
  }
  return await db.query(query)
}

async function get5eCharOtherProLangQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_other_pro_lang" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharOtherProLangsByGeneralQuery(generalId) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_other_pro_lang" where general_id = $1`,
    values: [generalId]
  }
  return await db.query(query)
}

async function remove5eCharOtherProLangQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_other_pro_lang" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharOtherProLangQuery(id, data) {
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
    text: /*sql*/ `update public."dnd_5e_character_other_pro_lang" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  add5eCharOtherProLangQuery,
  get5eCharOtherProLangsByGeneralQuery,
  get5eCharOtherProLangQuery,
  remove5eCharOtherProLangQuery,
  edit5eCharOtherProLangQuery
}