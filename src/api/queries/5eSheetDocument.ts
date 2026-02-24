import db from "../dbconfig";

export interface DndFiveESheetDocumentRow {
  id: number;
  user_id: number;
  name: string;
  sheet_data: Record<string, unknown>;
  sheet_schema_version: number;
  sheet_data_updated_at: string;
}

async function get5eSheetDocumentQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT
        id,
        user_id,
        name,
        sheet_data,
        sheet_schema_version,
        sheet_data_updated_at
      FROM public."dnd_5e_character_general"
      WHERE id = $1
      LIMIT 1
    `,
    values: [generalId],
  };
  return await db.query<DndFiveESheetDocumentRow>(query);
}

async function refresh5eSheetDocumentFromRelationalQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `
      UPDATE public."dnd_5e_character_general" g
      SET
        "sheet_data" = jsonb_build_object(
          'general',
          to_jsonb(g) - 'sheet_data' - 'sheet_schema_version' - 'sheet_data_updated_at',
          'proficiencies',
          (
            SELECT to_jsonb(p)
            FROM public."dnd_5e_character_proficiencies" p
            WHERE p.general_id = g.id
            LIMIT 1
          ),
          'background',
          (
            SELECT to_jsonb(b)
            FROM public."dnd_5e_character_background" b
            WHERE b.general_id = g.id
            LIMIT 1
          ),
          'spellSlots',
          (
            SELECT to_jsonb(ss)
            FROM public."dnd_5e_spell_slots" ss
            WHERE ss.general_id = g.id
            LIMIT 1
          ),
          'classes',
          COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(c) ORDER BY c.id)
              FROM public."dnd_5e_class" c
              WHERE c.general_id = g.id
            ),
            '[]'::jsonb
          ),
          'attacks',
          COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(a) ORDER BY a.id)
              FROM public."dnd_5e_character_attack" a
              WHERE a.general_id = g.id
            ),
            '[]'::jsonb
          ),
          'spells',
          COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(s) ORDER BY s.id)
              FROM public."dnd_5e_character_spell" s
              WHERE s.general_id = g.id
            ),
            '[]'::jsonb
          ),
          'feats',
          COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(f) ORDER BY f.id)
              FROM public."dnd_5e_character_feat_trait" f
              WHERE f.general_id = g.id
            ),
            '[]'::jsonb
          ),
          'equipment',
          COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(eq) ORDER BY eq.id)
              FROM public."dnd_5e_character_equipment" eq
              WHERE eq.general_id = g.id
            ),
            '[]'::jsonb
          ),
          'otherProLangs',
          COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(opl) ORDER BY opl.id)
              FROM public."dnd_5e_character_other_pro_lang" opl
              WHERE opl.general_id = g.id
            ),
            '[]'::jsonb
          )
        ),
        "sheet_schema_version" = 1,
        "sheet_data_updated_at" = now()
      WHERE g.id = $1
      RETURNING
        g.id,
        g.user_id,
        g.name,
        g.sheet_data,
        g.sheet_schema_version,
        g.sheet_data_updated_at
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
          to_jsonb(g) - 'sheet_data' - 'sheet_schema_version' - 'sheet_data_updated_at',
          true
        ),
        "sheet_schema_version" = 1,
        "sheet_data_updated_at" = now()
      WHERE g.id = $1
      RETURNING
        g.id,
        g.user_id,
        g.name,
        g.sheet_data,
        g.sheet_schema_version,
        g.sheet_data_updated_at
    `,
    values: [generalId],
  };
  return await db.query<DndFiveESheetDocumentRow>(query);
}

async function save5eSheetDocumentQuery(
  generalId: string | number,
  sheetData: Record<string, unknown>,
  schemaVersion = 1,
) {
  const query = {
    text: /*sql*/ `
      UPDATE public."dnd_5e_character_general"
      SET
        "sheet_data" = $2::jsonb,
        "sheet_schema_version" = $3,
        "sheet_data_updated_at" = now()
      WHERE id = $1
      RETURNING
        id,
        user_id,
        name,
        sheet_data,
        sheet_schema_version,
        sheet_data_updated_at
    `,
    values: [generalId, JSON.stringify(sheetData), schemaVersion],
  };
  return await db.query<DndFiveESheetDocumentRow>(query);
}

export {
  get5eSheetDocumentQuery,
  refresh5eSheetDocumentFromRelationalQuery,
  sync5eSheetGeneralSectionQuery,
  save5eSheetDocumentQuery,
};
