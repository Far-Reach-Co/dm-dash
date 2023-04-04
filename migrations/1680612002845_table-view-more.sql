-- Up Migration
ALTER TABLE "public"."TableView"
ADD COLUMN "date_created" timestamptz NOT NULL DEFAULT now(),
ADD COLUMN "title" varchar NOT NULL DEFAULT 'New Campaign';
-- Down Migration
ALTER TABLE "public"."TableView"
DROP COLUMN "date_created",
DROP COLUMN "title";