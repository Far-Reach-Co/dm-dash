const db = require('../dbconfig')

async function add5eCharAttackQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_attack" (general_id, title, description, range, damage_type, bonus) values($1,$2,$3,$4,$5,$6) returning *`,
    values: [
      data.general_id,
      data.title,
      data.description,
      data.range,
      data.damage_type,
      data.bonus,
    ]
  }
  return await db.query(query)
}

async function get5eCharAttackQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_attack" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharAttacksByGeneralQuery(generalId) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_attack" where general_id = $1`,
    values: [generalId]
  }
  return await db.query(query)
}

async function remove5eCharAttackQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_attack" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharAttackQuery(id, data) {
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
    text: /*sql*/ `update public."dnd_5e_character_attack" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  add5eCharAttackQuery,
  get5eCharAttacksByGeneralQuery,
  get5eCharAttackQuery,
  remove5eCharAttackQuery,
  edit5eCharAttackQuery
}