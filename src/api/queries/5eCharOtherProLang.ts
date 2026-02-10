import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";
import { columnNamesQuery } from "./utils";

interface DndFiveEOtherProLang {
  id: number,
  general_id: number,
  type: string,
  proficiency: string
}

async function add5eCharOtherProLangQuery(data: {
  general_id: number | string,
  type: string
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_other_pro_lang" (general_id, type) values($1,$2) returning *`,
    values: [
      data.general_id,
      data.type,
    ]
  }
  return await db.query<DndFiveEOtherProLang>(query)
}

async function duplicate5eCharOtherProLangsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const tableName = "dnd_5e_character_other_pro_lang"
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
  
  await db.query<DndFiveEOtherProLang>(query);
}

async function get5eCharOtherProLangQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_other_pro_lang" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEOtherProLang>(query)
}

async function get5eCharOtherProLangsByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_other_pro_lang" where general_id = $1 order by id`,
    values: [generalId]
  }
  return await db.query<DndFiveEOtherProLang>(query)
}

async function remove5eCharOtherProLangQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_other_pro_lang" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEOtherProLang>(query)
}

async function edit5eCharOtherProLangQuery(id: string, data: any) {
  const query = buildUpdateQuery("dnd_5e_character_other_pro_lang", data, id);
  return await db.query<DndFiveEOtherProLang>(query);
}

export {
  add5eCharOtherProLangQuery,
  get5eCharOtherProLangsByGeneralQuery,
  get5eCharOtherProLangQuery,
  remove5eCharOtherProLangQuery,
  edit5eCharOtherProLangQuery,
  duplicate5eCharOtherProLangsQuery
}
