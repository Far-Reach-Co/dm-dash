import { QueryResult } from "pg";
import db from "../dbconfig";
import { columnNamesQuery } from "./utils";
import { sync5eSheetGeneralSectionQuery } from "./5eSheetDocument";
import {
  ensureSheetDataDocument,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

export interface DndFiveEGeneral {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  race: string;
  class: string;
  level: number;
  exp: number;
  inspiration: boolean;
  initiative: number;
  speed: number;
  armor_class: number;
  current_hp: number;
  temp_hp: number;
  hit_dice: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  max_hp: number;
  hit_dice_total: string;
  class_resource: number;
  class_resource_total: number;
  other_resource: string;
  other_resource_total: string;
  ds_success_1: boolean;
  ds_success_2: boolean;
  ds_success_3: boolean;
  ds_failure_1: boolean;
  ds_failure_2: boolean;
  ds_failure_3: boolean;
  class_resource_title: string;
  other_resource_title: string;
  wisdom_mod: number;
  subclass: string;
  other_class: string;
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

interface DndFiveEGeneralSheetRow {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  sheet_data: Record<string, unknown> | null;
}

const DEFAULT_GENERAL_SECTION: Omit<
  DndFiveEGeneral,
  "id" | "user_id" | "name" | "created_at"
> = {
  race: "",
  class: "",
  level: 0,
  exp: 0,
  inspiration: false,
  initiative: 0,
  speed: 0,
  armor_class: 0,
  current_hp: 0,
  temp_hp: 0,
  hit_dice: 0,
  strength: 0,
  dexterity: 0,
  constitution: 0,
  intelligence: 0,
  wisdom: 0,
  charisma: 0,
  max_hp: 0,
  hit_dice_total: "",
  class_resource: 0,
  class_resource_total: 0,
  other_resource: "",
  other_resource_total: "",
  ds_success_1: false,
  ds_success_2: false,
  ds_success_3: false,
  ds_failure_1: false,
  ds_failure_2: false,
  ds_failure_3: false,
  class_resource_title: "",
  other_resource_title: "",
  wisdom_mod: 0,
  subclass: "",
  other_class: "",
  copper: 0,
  silver: 0,
  electrum: 0,
  gold: 0,
  platinum: 0,
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toGeneralModel(row: DndFiveEGeneralSheetRow): DndFiveEGeneral {
  const sheetData = asObject(row.sheet_data) || {};
  const section = asObject(sheetData.general) || {};
  return {
    ...DEFAULT_GENERAL_SECTION,
    ...section,
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    created_at: row.created_at,
  } as DndFiveEGeneral;
}

function toQueryResult(rows: DndFiveEGeneral[]): QueryResult<DndFiveEGeneral> {
  return { rows } as QueryResult<DndFiveEGeneral>;
}

async function get5eCharGeneralSheetRowQuery(id: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT id, user_id, name, created_at, sheet_data
      FROM public."dnd_5e_character_general"
      WHERE id = $1
      LIMIT 1
    `,
    values: [id],
  };
  return await db.query<DndFiveEGeneralSheetRow>(query);
}

async function add5eCharGeneralQuery(data: {
  user_id: string,
  name: string
}) {
  const query = {
    text: /*sql*/ `
      INSERT INTO public."dnd_5e_character_general" (user_id, name)
      VALUES($1, $2)
      RETURNING id
    `,
    values: [
      data.user_id,
      data.name,
    ]
  }
  const result = await db.query<{ id: number }>(query);
  const general = result.rows[0];
  if (general?.id) {
    await sync5eSheetGeneralSectionQuery(general.id);
  }
  if (!general?.id) return toQueryResult([]);
  return await get5eCharGeneralQuery(general.id);
}

async function duplicate5eCharGeneralQuery(data: {
  generalId: number
}): Promise<QueryResult<DndFiveEGeneral>> {
  const tableName = "dnd_5e_character_general"
  const columnNames = await columnNamesQuery(tableName)
  const columnStr = columnNames.join(", ")
  const selectStr = columnNames.map(col => {
    if (col === "name") return `${col} || ' (copy)'`;
    return col
  }).join(", ")

  const query = {
    text: /*sql*/ `
      INSERT INTO public."${tableName}" (${columnStr})
      SELECT ${selectStr}
      FROM ${tableName}
      WHERE id = $1
      RETURNING *
    `,
    values: [
      data.generalId
    ]
  }
  const result = await db.query<{ id: number }>(query);
  const duplicated = result.rows[0];
  if (duplicated?.id) {
    await sync5eSheetGeneralSectionQuery(duplicated.id);
  }
  if (!duplicated?.id) return toQueryResult([]);
  return await get5eCharGeneralQuery(duplicated.id);
}

async function get5eCharGeneralQuery(id: string | number) {
  const result = await get5eCharGeneralSheetRowQuery(id);
  return toQueryResult(result.rows.map((row) => toGeneralModel(row)));
}

async function get5eCharGeneralUserIdQuery(id: string) {
  const query = {
    text: /*sql*/ `select user_id from public."dnd_5e_character_general" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEGeneral>(query)
}

async function get5eCharNamesQuery(ids: (string | number)[]) {
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');

  const query = {
    text: /*sql*/ `SELECT id, name FROM public."dnd_5e_character_general" WHERE id IN (${placeholders})`,
    values: ids,
  };
  return await db.query<DndFiveEGeneral>(query)
}

async function get5eCharsGeneralByUserQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT id, user_id, name, created_at, sheet_data
      FROM public."dnd_5e_character_general"
      WHERE user_id = $1
    `,
    values: [userId]
  }
  const result = await db.query<DndFiveEGeneralSheetRow>(query);
  return toQueryResult(result.rows.map((row) => toGeneralModel(row)));
}

async function remove5eCharGeneralQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_general" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEGeneral>(query)
}

async function edit5eCharGeneralQuery(id: string, data: any) {
  if (!data || !Object.keys(data).length) {
    throw new Error("No fields provided for update");
  }

  const currentData = await get5eCharGeneralSheetRowQuery(id);
  const current = currentData.rows[0];
  if (!current) return toQueryResult([]);

  const nextGeneral: DndFiveEGeneral = {
    ...toGeneralModel(current),
  };
  let nextName = current.name;
  for (const [key, value] of Object.entries(data)) {
    if (key === "name") {
      if (typeof value === "string") nextName = value;
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(DEFAULT_GENERAL_SECTION, key)) {
      (nextGeneral as any)[key] = value;
    }
  }
  nextGeneral.id = current.id;
  nextGeneral.user_id = current.user_id;
  nextGeneral.name = nextName;
  nextGeneral.created_at = current.created_at;

  if (nextName !== current.name) {
    await db.query({
      text: /*sql*/ `
        UPDATE public."dnd_5e_character_general"
        SET name = $1
        WHERE id = $2
      `,
      values: [nextName, id],
    });
  }

  const sheetData = ensureSheetDataDocument({
    id: current.id,
    sheet_data: current.sheet_data,
  });
  if (!sheetData) return toQueryResult([]);
  sheetData.general = nextGeneral;
  await updateSheetDataByGeneralIdQuery(id, sheetData);
  await sync5eSheetGeneralSectionQuery(id);
  return await get5eCharGeneralQuery(id);
}

export {
  add5eCharGeneralQuery,
  get5eCharGeneralUserIdQuery,
  get5eCharsGeneralByUserQuery,
  get5eCharGeneralQuery,
  remove5eCharGeneralQuery,
  edit5eCharGeneralQuery,
  get5eCharNamesQuery,
  duplicate5eCharGeneralQuery
}
