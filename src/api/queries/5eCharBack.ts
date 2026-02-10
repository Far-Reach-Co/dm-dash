import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";
import { columnNamesQuery } from "./utils";

export interface DndFiveEBackground {
  id: number,
  general_id: number,
  personality_traits: string,
  ideals: string,
  bonds: string,
  flaws: string,
  backstory: string,
  age: number,
  height: string,
  weight: string,
  eyes: string,
  skin: string,
  hair: string,
  other_info: string,
  background: string,
  alignment: string,
  appearance: string,
  allies_and_organizations: string
}

async function add5eCharBackQuery(data: {
  general_id: any
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_background" (general_id) values($1) returning *`,
    values: [
      data.general_id,
    ]
  }
  return await db.query<DndFiveEBackground>(query)
}

async function duplicate5eCharBackQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const tableName = "dnd_5e_character_background"
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
  
  await db.query<DndFiveEBackground>(query);
}

async function get5eCharBackQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_background" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEBackground>(query)
}

async function get5eCharBackByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_background" where general_id = $1`,
    values: [generalId]
  }
  return await db.query<DndFiveEBackground>(query)
}

async function remove5eCharBackQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_background" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEBackground>(query)
}

async function edit5eCharBackQuery(id: string, data: any) {
  const query = buildUpdateQuery("dnd_5e_character_background", data, id);
  return await db.query<DndFiveEBackground>(query);
}

export {
  add5eCharBackQuery,
  get5eCharBackByGeneralQuery,
  get5eCharBackQuery,
  remove5eCharBackQuery,
  edit5eCharBackQuery,
  duplicate5eCharBackQuery
}
