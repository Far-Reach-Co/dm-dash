const db = require('../dbconfig')

async function add5eCharEquipmentQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_equipment" (general_id, title, description, quantity, weight) values($1,$2,$3,$4,$5) returning *`,
    values: [
      data.general_id,
      data.title,
      data.description,
      data.quantity,
      data.weight,
    ]
  }
  return await db.query(query)
}

async function get5eCharEquipmentQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_equipment" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharEquipmentsByGeneralQuery(generalId) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_equipment" where general_id = $1 order by LOWER(title)`,
    values: [generalId]
  }
  return await db.query(query)
}

async function remove5eCharEquipmentQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_equipment" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharEquipmentQuery(id, data) {
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
    text: /*sql*/ `update public."dnd_5e_character_equipment" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  add5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  get5eCharEquipmentQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery
}