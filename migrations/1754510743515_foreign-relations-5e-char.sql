-- Up Migration

ALTER TABLE "public"."dnd_5e_character_proficiencies"
DROP CONSTRAINT IF EXISTS dnd_5e_character_proficiencies_general_id_fkey,
ADD CONSTRAINT dnd_5e_character_proficiencies_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."dnd_5e_character_background"
DROP CONSTRAINT IF EXISTS dnd_5e_character_background_general_id_fkey,
ADD CONSTRAINT dnd_5e_character_background_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."dnd_5e_character_attack"
DROP CONSTRAINT IF EXISTS dnd_5e_character_attack_general_id_fkey,
ADD CONSTRAINT dnd_5e_character_attack_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."dnd_5e_character_equipment"
DROP CONSTRAINT IF EXISTS dnd_5e_character_equipment_general_id_fkey,
ADD CONSTRAINT dnd_5e_character_equipment_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."dnd_5e_character_feat_trait"
DROP CONSTRAINT IF EXISTS dnd_5e_character_feat_trait_general_id_fkey,
ADD CONSTRAINT dnd_5e_character_feat_trait_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."dnd_5e_character_other_pro_lang"
DROP CONSTRAINT IF EXISTS dnd_5e_character_other_pro_lang_general_id_fkey,
ADD CONSTRAINT dnd_5e_character_other_pro_lang_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."dnd_5e_spell_slots"
DROP CONSTRAINT IF EXISTS dnd_5e_spell_slots_general_id_fkey,
ADD CONSTRAINT dnd_5e_spell_slots_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."dnd_5e_character_spell"
DROP CONSTRAINT IF EXISTS dnd_5e_character_spell_general_id_fkey,
ADD CONSTRAINT dnd_5e_character_spell_general_id_fkey
FOREIGN KEY (general_id)
REFERENCES "public"."dnd_5e_character_general"(id)
ON DELETE CASCADE;

-- Down Migration

ALTER TABLE "public"."dnd_5e_character_proficiencies"
DROP CONSTRAINT IF EXISTS dnd_5e_character_proficiencies_general_id_fkey;

ALTER TABLE "public"."dnd_5e_character_background"
DROP CONSTRAINT IF EXISTS dnd_5e_character_background_general_id_fkey;

ALTER TABLE "public"."dnd_5e_character_attack"
DROP CONSTRAINT IF EXISTS dnd_5e_character_attack_general_id_fkey;

ALTER TABLE "public"."dnd_5e_character_equipment"
DROP CONSTRAINT IF EXISTS dnd_5e_character_equipment_general_id_fkey;

ALTER TABLE "public"."dnd_5e_character_feat_trait"
DROP CONSTRAINT IF EXISTS dnd_5e_character_feat_trait_general_id_fkey;

ALTER TABLE "public"."dnd_5e_character_other_pro_lang"
DROP CONSTRAINT IF EXISTS dnd_5e_character_other_pro_lang_general_id_fkey;

ALTER TABLE "public"."dnd_5e_spell_slots"
DROP CONSTRAINT IF EXISTS dnd_5e_spell_slots_general_id_fkey;

ALTER TABLE "public"."dnd_5e_character_spell"
DROP CONSTRAINT IF EXISTS dnd_5e_character_spell_general_id_fkey;
