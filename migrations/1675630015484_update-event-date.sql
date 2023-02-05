-- Up Migration
ALTER TABLE "public"."Event" ALTER COLUMN "date_created" SET DATA TYPE timestamptz;
-- Down Migration
ALTER TABLE "public"."Event" ALTER COLUMN "date_created" SET DATA TYPE date;