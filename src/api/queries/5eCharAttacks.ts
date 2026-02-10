import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";
import { columnNamesQuery } from "./utils";

interface DndFiveEAttack {
  id: number,
  title: string,
  description: string,
  range: string,
  damage_type: string,
  bonus: string,
  general_id: number,
  duration: string
}

async function add5eCharAttackQuery(data: {
  general_id: number | string,
  title: string
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_attack" (general_id, title) values($1,$2) returning *`,
    values: [
      data.general_id,
      data.title,
    ]
  }
  return await db.query<DndFiveEAttack>(query)
}

async function get5eCharAttackQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_attack" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEAttack>(query)
}

async function duplicate5eCharAttacksQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const tableName = "dnd_5e_character_attack"
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
  
  await db.query<DndFiveEAttack>(query);
}

async function get5eCharAttacksByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_attack" where general_id = $1 order by id`,
    values: [generalId]
  }
  return await db.query<DndFiveEAttack>(query)
}

async function remove5eCharAttackQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_attack" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEAttack>(query)
}

async function edit5eCharAttackQuery(id: string, data: any) {
  const query = buildUpdateQuery("dnd_5e_character_attack", data, id);
  return await db.query<DndFiveEAttack>(query);
}

export {
  add5eCharAttackQuery,
  get5eCharAttacksByGeneralQuery,
  get5eCharAttackQuery,
  remove5eCharAttackQuery,
  edit5eCharAttackQuery,
  duplicate5eCharAttacksQuery
}
