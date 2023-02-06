-- Up Migration
ALTER TABLE "public"."Lore"
DROP COLUMN "location_id",
DROP COLUMN "character_id",
DROP COLUMN "item_id";
-- Down Migration
ALTER TABLE "public"."Lore"
ADD COLUMN "location_id" int4,
ADD COLUMN "character_id" int4,
ADD COLUMN "item_id" int4;