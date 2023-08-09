import db from "../dbconfig";

interface DndFiveESpellModel {
  id: number,
  title: string,
  description: string,
  type: string,
  general_id: number,
  casting_time: string,
  duration: string,
  range: string,
  components: string,
  damage_type: string
}

async function add5eCharSpellQuery(data: {
  general_id: string,
  title: string,
  description: string,
  type: string
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_spell" (general_id, title, description, type) values($1,$2,$3,$4) returning *`,
    values: [
      data.general_id,
      data.title,
      data.description,
      data.type
    ]
  }
  return await db.query<DndFiveESpellModel>(query)
}

async function get5eCharSpellQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_spell" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveESpellModel>(query)
}

async function get5eCharSpellsByTypeQuery(generalId: string, type: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_spell" where general_id = $1 and type = $2 order by id`,
    values: [generalId, type]
  }
  return await db.query<DndFiveESpellModel>(query)
}

async function get5eCharSpellsByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_spell" where general_id = $1`,
    values: [generalId]
  }
  return await db.query<DndFiveESpellModel>(query)
}

async function remove5eCharSpellQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_spell" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveESpellModel>(query)
}

async function edit5eCharSpellQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."dnd_5e_character_spell" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<DndFiveESpellModel>(query)
}

export {
  add5eCharSpellQuery,
  get5eCharSpellsByTypeQuery,
  get5eCharSpellsByGeneralQuery,
  get5eCharSpellQuery,
  remove5eCharSpellQuery,
  edit5eCharSpellQuery
}