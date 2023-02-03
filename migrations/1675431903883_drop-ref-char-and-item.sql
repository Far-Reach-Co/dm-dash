-- Up Migration
ALTER TABLE "public"."Item"
DROP COLUMN "image_ref";
ALTER TABLE "public"."Character"
DROP COLUMN "image_ref";
-- Down Migration