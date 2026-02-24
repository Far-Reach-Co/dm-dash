-- Up Migration
DROP TABLE IF EXISTS public."dnd_5e_character_other_pro_lang" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_character_equipment" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_character_feat_trait" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_character_spell" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_character_attack" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_class" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_spell_slots" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_character_background" CASCADE;
DROP TABLE IF EXISTS public."dnd_5e_character_proficiencies" CASCADE;

-- Down Migration
SELECT 1;
