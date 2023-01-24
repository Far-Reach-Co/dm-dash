-- Up Migration
ALTER TABLE "public"."User"
ADD COLUMN "name" varchar,
ADD COLUMN "phone" varchar;
-- Down Migration
ALTER TABLE "public"."User"
DROP COLUMN "name",
DROP COLUMN "phone";