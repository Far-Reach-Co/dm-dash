import db from '../dbconfig.js';

async function add5eCharProQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_proficiencies" (general_id) values($1) returning *`,
    values: [
      data.general_id,
    ]
  }
  return await db.query(query)
}

async function get5eCharProQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_proficiencies" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharProByGeneralQuery(generalId) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_proficiencies" where general_id = $1`,
    values: [generalId]
  }
  return await db.query(query)
}

async function remove5eCharProQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_proficiencies" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharProQuery(id, data) {
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
    text: /*sql*/ `update public."dnd_5e_character_proficiencies" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export default {
  add5eCharProQuery,
  get5eCharProByGeneralQuery,
  get5eCharProQuery,
  remove5eCharProQuery,
  edit5eCharProQuery
};