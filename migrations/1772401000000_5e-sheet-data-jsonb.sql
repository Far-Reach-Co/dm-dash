-- Up Migration
ALTER TABLE public."dnd_5e_character_general"
ADD COLUMN IF NOT EXISTS "sheet_data" jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "sheet_schema_version" int4 NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "sheet_data_updated_at" timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS "dnd_5e_character_general_sheet_data_gin_idx"
  ON public."dnd_5e_character_general"
  USING GIN ("sheet_data");

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
  "sheet_data_updated_at" = now();

-- Down Migration
DROP INDEX IF EXISTS "dnd_5e_character_general_sheet_data_gin_idx";

ALTER TABLE public."dnd_5e_character_general"
DROP COLUMN IF EXISTS "sheet_data",
DROP COLUMN IF EXISTS "sheet_schema_version",
DROP COLUMN IF EXISTS "sheet_data_updated_at";
