-- Up Migration
ALTER TABLE "public"."User" ALTER COLUMN "username" SET NOT NULL;
-- Down Migration
ALTER TABLE "public"."User" ALTER COLUMN "username" DROP NOT NULL;