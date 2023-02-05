-- Up Migration
ALTER TABLE "public"."Note"
ADD COLUMN "lore_id" int4;
-- Down Migration
ALTER TABLE "public"."Note"
DROP COLUMN "lore_id";