-- Up Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER TABLE "public"."TableView"
ADD COLUMN "uuid" varchar NOT NULL DEFAULT uuid_generate_v4 ();
-- Down Migration
ALTER TABLE "public"."TableView"
DROP COLUMN "uuid" ;