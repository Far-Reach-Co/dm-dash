-- Up Migration
ALTER TABLE "public"."dnd_5e_character_spell"
ADD COLUMN "casting_time" varchar,
ADD COLUMN "duration" varchar,
ADD COLUMN "range" varchar,
ADD COLUMN "components" varchar,
ADD COLUMN "damage_type" varchar;
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_spell"
DROP COLUMN "casting_time",
DROP COLUMN "duration",
DROP COLUMN "range",
DROP COLUMN "components",
DROP COLUMN "damage_type";