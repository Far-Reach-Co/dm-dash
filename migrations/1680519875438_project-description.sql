-- Up Migration
ALTER TABLE "public"."Project"
ADD COLUMN "description" varchar NOT NULL DEFAULT 'This is a placeholder description for your project';

-- Down Migration
ALTER TABLE "public"."Project"
DROP COLUMN "description";