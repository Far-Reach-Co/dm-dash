-- Up Migration
ALTER TABLE "public"."TableView"
ADD COLUMN "is_public" BOOLEAN DEFAULT true NOT NULL;

-- Down Migration
ALTER TABLE "public"."TableView"
DROP COLUMN "is_public";
