import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";
import { columnNamesQuery } from "./utils";

interface DndFiveESpell {
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
  general_id: number | string,
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
  return await db.query<DndFiveESpell>(query)
}

async function duplicate5eCharSpellsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const tableName = "dnd_5e_character_spell"
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
  
  await db.query<DndFiveESpell>(query);
}

async function get5eCharSpellQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_spell" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveESpell>(query)
}

async function get5eCharSpellsByTypeQuery(generalId: string, type: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_spell" where general_id = $1 and type = $2 order by id`,
    values: [generalId, type]
  }
  return await db.query<DndFiveESpell>(query)
}

async function get5eCharSpellsByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_spell" where general_id = $1`,
    values: [generalId]
  }
  return await db.query<DndFiveESpell>(query)
}

async function remove5eCharSpellQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_spell" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveESpell>(query)
}

async function edit5eCharSpellQuery(id: string, data: any) {
  const query = buildUpdateQuery("dnd_5e_character_spell", data, id);
  return await db.query<DndFiveESpell>(query);
}

export {
  add5eCharSpellQuery,
  get5eCharSpellsByTypeQuery,
  get5eCharSpellsByGeneralQuery,
  get5eCharSpellQuery,
  remove5eCharSpellQuery,
  edit5eCharSpellQuery,
  duplicate5eCharSpellsQuery
}
