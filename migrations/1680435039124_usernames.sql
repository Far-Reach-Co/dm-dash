-- Up Migration
ALTER TABLE "public"."User"
ADD COLUMN "username" varchar;
-- Down Migration
ALTER TABLE "public"."User"
DROP COLUMN "username";