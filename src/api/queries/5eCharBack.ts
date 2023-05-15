import db from "../dbconfig";

async function add5eCharBackQuery(data: {
  general_id: any
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_background" (general_id) values($1) returning *`,
    values: [
      data.general_id,
    ]
  }
  return await db.query(query)
}

async function get5eCharBackQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_background" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function get5eCharBackByGeneralQuery(generalId: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_background" where general_id = $1`,
    values: [generalId]
  }
  return await db.query(query)
}

async function remove5eCharBackQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_background" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function edit5eCharBackQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."dnd_5e_character_background" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

export {
  add5eCharBackQuery,
  get5eCharBackByGeneralQuery,
  get5eCharBackQuery,
  remove5eCharBackQuery,
  edit5eCharBackQuery
}