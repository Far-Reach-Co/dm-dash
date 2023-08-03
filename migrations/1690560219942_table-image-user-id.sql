-- Up Migration
ALTER TABLE "public"."TableImage" ALTER COLUMN "project_id" DROP NOT NULL;
ALTER TABLE "public"."TableImage"
ADD COLUMN "user_id" int4;
-- Down Migration
ALTER TABLE "public"."TableImage" ALTER COLUMN "project_id" SET NOT NULL;
ALTER TABLE "public"."TableImage"
DROP COLUMN "user_id";