-- Up Migration
ALTER TABLE "public"."User"
ADD COLUMN "stripe_id" varchar;
-- Down Migration
ALTER TABLE "public"."User"
DROP COLUMN "stripe_id";