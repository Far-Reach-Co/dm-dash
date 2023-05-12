-- Up Migration
ALTER TABLE "public"."dnd_5e_character_general"
ADD COLUMN "wisdom_mod" int2;
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_general"
DROP COLUMN "wisdom_mod";