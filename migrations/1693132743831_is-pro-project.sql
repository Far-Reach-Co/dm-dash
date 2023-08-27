-- Up Migration
ALTER TABLE "public"."Project"
ADD COLUMN "is_pro" bool NOT NULL DEFAULT 'false';
-- Down Migration
ALTER TABLE "public"."Project"
DROP COLUMN "is_pro";