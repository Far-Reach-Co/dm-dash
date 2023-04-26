-- Up Migration
ALTER TABLE "public"."Project"
ADD COLUMN "image_id" int4;
-- Down Migration
ALTER TABLE "public"."Project"
DROP COLUMN "image_id";