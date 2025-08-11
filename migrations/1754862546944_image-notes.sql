-- Up Migration
ALTER TABLE "public"."Image"
ADD COLUMN "notes" varchar;

-- Down Migration
ALTER TABLE "public"."Image"
DROP COLUMN "notes";
