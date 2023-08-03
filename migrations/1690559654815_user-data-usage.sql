-- Up Migration
ALTER TABLE "public"."User"
ADD COLUMN "used_data_in_bytes" float8 NOT NULL DEFAULT 0;
-- Down Migration
ALTER TABLE "public"."User"
DROP COLUMN "used_data_in_bytes";