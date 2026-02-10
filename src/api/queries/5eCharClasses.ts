import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";
import { columnNamesQuery } from "./utils";

interface DndFiveEClass {
  id: number,
  general_id: number,
  class: string,
  subclass: string,
  hit_dice_type: string,
  total_hit_dice: number,
  current_hit_dice: number
}

async function add5eCharClassQuery(data: {
  general_id: number | string,
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_class" (general_id) values($1) returning *`,
    values: [
      data.general_id,
    ]
  }
  return await db.query<DndFiveEClass>(query)
}

async function get5eCharClassQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_class" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEClass>(query)
}

async function duplicate5eCharClassesQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const tableName = "dnd_5e_class"
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
  
  await db.query<DndFiveEClass>(query);
}

async function get5eCharClassesByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_class" where general_id = $1 order by id`,
    values: [generalId]
  }
  return await db.query<DndFiveEClass>(query)
}

async function remove5eCharClassQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_class" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEClass>(query)
}

async function edit5eCharClassQuery(id: string, data: any) {
  const query = buildUpdateQuery("dnd_5e_class", data, id);
  return await db.query<DndFiveEClass>(query);
}

export {
  add5eCharClassQuery,
  get5eCharClassesByGeneralQuery,
  get5eCharClassQuery,
  remove5eCharClassQuery,
  edit5eCharClassQuery,
  duplicate5eCharClassesQuery
}
