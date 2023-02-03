-- Up Migration
ALTER TABLE "public"."Item"
ADD COLUMN "image_id" int4;
ALTER TABLE "public"."Character"
ADD COLUMN "image_id" int4;
-- Down Migration
ALTER TABLE "public"."Item"
DROP COLUMN "image_id";
ALTER TABLE "public"."Character"
DROP COLUMN "image_id";
