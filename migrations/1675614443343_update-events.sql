-- Up Migration
ALTER TABLE "public"."Event" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "public"."Event"
ADD COLUMN "character_id" int4,
ADD COLUMN "item_id" int4,
ADD COLUMN "lore_id" int4;
-- Down Migration
ALTER TABLE "public"."Event" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "public"."Event"
DROP COLUMN "character_id",
DROP COLUMN "item_id",
DROP COLUMN "lore_id";