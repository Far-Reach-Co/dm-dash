import db from "../dbconfig";

export interface DndFiveEEquipmentModel {
  id: number,
  general_id: number,
  title: string,
  description: string,
  quantity: number,
  weight: number
}

async function add5eCharEquipmentQuery(data: {
  general_id: string,
  title: string,
  description: string,
  quantity: string,
  weight: string
}) {
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
  return await db.query<DndFiveEEquipmentModel>(query)
}

async function get5eCharEquipmentQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_equipment" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEEquipmentModel>(query)
}

async function get5eCharEquipmentsByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_equipment" where general_id = $1 order by id`,
    values: [generalId]
  }
  return await db.query<DndFiveEEquipmentModel>(query)
}

async function remove5eCharEquipmentQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_equipment" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEEquipmentModel>(query)
}

async function edit5eCharEquipmentQuery(id: string, data: any) {
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

  return await db.query<DndFiveEEquipmentModel>(query)
}

export {
  add5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  get5eCharEquipmentQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery
}