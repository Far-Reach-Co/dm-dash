const db = require('../dbconfig')

async function add5eCharGeneralQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_general" (user_id, name) values($1,$2) returning *`,
    values: [
      data.user_id,
      data.name,
    ]
  }
  return await db.query(query)
}

async function get5eCharGeneralQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_general" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharsGeneralByUserQuery(userId) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_general" where user_id = $1`,
    values: [userId]
  }
  return await db.query(query)
}

async function remove5eCharGeneralQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_general" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharGeneralQuery(id, data) {
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
    text: /*sql*/ `update public."dnd_5e_character_general" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  add5eCharGeneralQuery,
  get5eCharsGeneralByUserQuery,
  get5eCharGeneralQuery,
  remove5eCharGeneralQuery,
  edit5eCharGeneralQuery
}