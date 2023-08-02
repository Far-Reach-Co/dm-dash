-- Up Migration
ALTER TABLE "public"."dnd_5e_character_general"
ADD COLUMN "copper" int4,
ADD COLUMN "silver" int4,
ADD COLUMN "electrum" int4,
ADD COLUMN "gold" int4,
ADD COLUMN "platinum" int4;
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_general"
DROP COLUMN "copper",
DROP COLUMN "silver",
DROP COLUMN "electrum",
DROP COLUMN "gold",
DROP COLUMN "platinum";