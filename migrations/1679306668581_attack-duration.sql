-- Up Migration
ALTER TABLE "public"."dnd_5e_character_attack"
ADD COLUMN "duration" varchar;
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_attack"
DROP COLUMN "duration";