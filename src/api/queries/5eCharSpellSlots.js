import db from '../dbconfig.js';

async function add5eCharSpellSlotInfoQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_spell_slots" (general_id) values($1) returning *`,
    values: [
      data.general_id,
    ]
  }
  return await db.query(query)
}

async function get5eCharSpellSlotInfoQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_spell_slots" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharSpellSlotInfosByGeneralQuery(generalId) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_spell_slots" where general_id = $1`,
    values: [generalId]
  }
  return await db.query(query)
}

async function remove5eCharSpellSlotInfoQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_spell_slots" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharSpellSlotInfoQuery(id, data) {
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
    text: /*sql*/ `update public."dnd_5e_spell_slots" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  add5eCharSpellSlotInfoQuery,
  get5eCharSpellSlotInfosByGeneralQuery,
  get5eCharSpellSlotInfoQuery,
  remove5eCharSpellSlotInfoQuery,
  edit5eCharSpellSlotInfoQuery
};