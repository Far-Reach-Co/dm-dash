import db from "../dbconfig";
import { buildUpdateQuery, columnNamesQuery } from "./utils";

export interface DndFiveEEquipment {
  id: number,
  general_id: number,
  title: string,
  description: string,
  quantity: number,
  weight: number
}

async function add5eCharEquipmentQuery(data: {
  general_id: number | string,
  title: string,
  description: string,
  quantity: number,
  weight: number
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
  return await db.query<DndFiveEEquipment>(query)
}

async function duplicate5eCharEquipmentsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const tableName = "dnd_5e_character_equipment"
  const columnNames = await columnNamesQuery(tableName)
  const columnStr = columnNames.join(", ")
  const selectStr = columnNames.map(col => {
    if (col === "general_id") return "$2";
    return col
  }).join(", ")

  const query = {
    text: /*sql*/ `
      INSERT INTO public."${tableName}" (${columnStr})
      SELECT ${selectStr}
      FROM ${tableName}
      WHERE general_id = $1
    `,
    values: [
      data.oldGeneralId,
      data.newGeneralId
    ]
  }
  
  await db.query<DndFiveEEquipment>(query);
}

async function get5eCharEquipmentQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_equipment" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEEquipment>(query)
}

async function get5eCharEquipmentsByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_equipment" where general_id = $1 order by id`,
    values: [generalId]
  }
  return await db.query<DndFiveEEquipment>(query)
}

async function remove5eCharEquipmentQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_equipment" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEEquipment>(query)
}

async function edit5eCharEquipmentQuery(id: string, data: any) {
  const query = buildUpdateQuery("dnd_5e_character_equipment", data, id);
  return await db.query<DndFiveEEquipment>(query);
}

export {
  add5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  get5eCharEquipmentQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery,
  duplicate5eCharEquipmentsQuery
}
