-- Up Migration
ALTER TABLE "public"."User"
ADD COLUMN "is_pro" bool NOT NULL DEFAULT 'FALSE';
-- Down Migration
ALTER TABLE "public"."User"
DROP COLUMN "is_pro";