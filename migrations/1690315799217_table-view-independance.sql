-- Up Migration
ALTER TABLE "public"."TableView" ALTER COLUMN "project_id" DROP NOT NULL;
ALTER TABLE "public"."TableView"
ADD COLUMN "user_id" int4;

-- Down Migration
ALTER TABLE "public"."TableView" ALTER COLUMN "project_id" SET NOT NULL;
ALTER TABLE "public"."TableView"
DROP COLUMN "user_id";