import db from "../dbconfig";

export interface DndFiveESheetDocumentRow {
  id: number;
  user_id: number;
  name: string;
  sheet_data: Record<string, unknown>;
  sheet_schema_version?: number;
  sheet_data_updated_at?: string;
}

const DEFAULT_GENERAL_SECTION = {
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

async function get5eSheetDocumentQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT
        id,
        user_id,
        name,
        sheet_data
      FROM public."dnd_5e_character_general"
      WHERE id = $1
      LIMIT 1
    `,
    values: [generalId],
  };
  return await db.query<DndFiveESheetDocumentRow>(query);
}

async function sync5eSheetGeneralSectionQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `
      UPDATE public."dnd_5e_character_general" g
      SET
        "sheet_data" = jsonb_set(
          COALESCE(g.sheet_data, '{}'::jsonb),
          '{general}',
          (
            $2::jsonb
            || COALESCE(g.sheet_data -> 'general', '{}'::jsonb)
            || jsonb_build_object(
              'id',
              g.id,
              'user_id',
              g.user_id,
              'name',
              g.name,
              'created_at',
              COALESCE(
                g.sheet_data -> 'general' ->> 'created_at',
                to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
              )
            )
          ),
          true
        )
      WHERE g.id = $1
      RETURNING
        g.id,
        g.user_id,
        g.name,
        g.sheet_data
    `,
    values: [generalId, JSON.stringify(DEFAULT_GENERAL_SECTION)],
  };
  return await db.query<DndFiveESheetDocumentRow>(query);
}

async function save5eSheetDocumentQuery(
  generalId: string | number,
  sheetData: Record<string, unknown>,
  _schemaVersion = 1,
) {
  const query = {
    text: /*sql*/ `
      UPDATE public."dnd_5e_character_general"
      SET
        "sheet_data" = $2::jsonb,
        "name" = COALESCE(($2::jsonb -> 'general' ->> 'name'), "name")
      WHERE id = $1
      RETURNING
        id,
        user_id,
        name,
        sheet_data
    `,
    values: [generalId, JSON.stringify(sheetData)],
  };
  return await db.query<DndFiveESheetDocumentRow>(query);
}

export {
  get5eSheetDocumentQuery,
  sync5eSheetGeneralSectionQuery,
  save5eSheetDocumentQuery,
};
