-- Up Migration
ALTER TABLE "public"."Location"
DROP COLUMN "image_ref";
-- Down Migration