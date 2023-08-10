-- Up Migration
ALTER TABLE "public"."TableImage"
ADD COLUMN "folder_id" int4;
-- Down Migration
ALTER TABLE "public"."TableImage"
DROP COLUMN "folder_id";