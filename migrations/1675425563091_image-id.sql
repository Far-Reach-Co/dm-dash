-- Up Migration
ALTER TABLE "public"."Location"
ADD COLUMN "image_id" int4;
-- Down Migration
ALTER TABLE "public"."Location"
DROP COLUMN "image_id";