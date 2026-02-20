-- Up Migration
ALTER TABLE "public"."Project"
ADD COLUMN "is_public_listed" boolean NOT NULL DEFAULT false,
ADD COLUMN "public_join_mode" varchar NOT NULL DEFAULT 'invite_only',
ADD COLUMN "public_join_capacity" integer,
ADD COLUMN "featured_record_id" integer;

ALTER TABLE "public"."Project"
ADD CONSTRAINT project_public_join_mode_check
CHECK ("public_join_mode" IN ('invite_only', 'request'));

ALTER TABLE "public"."Project"
ADD CONSTRAINT project_public_join_capacity_check
CHECK ("public_join_capacity" IS NULL OR "public_join_capacity" > 0);

ALTER TABLE "public"."Project"
ADD CONSTRAINT project_featured_record_id_fk
FOREIGN KEY ("featured_record_id")
REFERENCES "public"."Record"("id")
ON DELETE SET NULL;

CREATE TABLE "public"."ProjectJoinRequest" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "public"."Project"("id") ON DELETE CASCADE,
  "requester_user_id" integer NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
  "message" varchar(800) NOT NULL DEFAULT '',
  "status" varchar NOT NULL DEFAULT 'pending',
  "reviewer_user_id" integer REFERENCES "public"."User"("id") ON DELETE SET NULL,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "public"."ProjectJoinRequest"
ADD CONSTRAINT project_join_request_status_check
CHECK ("status" IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE "public"."ProjectJoinRequest"
ADD CONSTRAINT project_join_request_reviewer_check
CHECK (
  "reviewer_user_id" IS NULL
  OR "reviewer_user_id" <> "requester_user_id"
);

CREATE UNIQUE INDEX project_join_request_pending_unique
ON "public"."ProjectJoinRequest" ("project_id", "requester_user_id")
WHERE "status" = 'pending';

CREATE INDEX project_join_request_project_status_idx
ON "public"."ProjectJoinRequest" ("project_id", "status", "created_at" DESC);

-- Down Migration
DROP INDEX IF EXISTS "public"."project_join_request_project_status_idx";
DROP INDEX IF EXISTS "public"."project_join_request_pending_unique";

ALTER TABLE "public"."ProjectJoinRequest"
DROP CONSTRAINT IF EXISTS project_join_request_reviewer_check;

ALTER TABLE "public"."ProjectJoinRequest"
DROP CONSTRAINT IF EXISTS project_join_request_status_check;

DROP TABLE IF EXISTS "public"."ProjectJoinRequest";

ALTER TABLE "public"."Project"
DROP CONSTRAINT IF EXISTS project_featured_record_id_fk;

ALTER TABLE "public"."Project"
DROP CONSTRAINT IF EXISTS project_public_join_capacity_check;

ALTER TABLE "public"."Project"
DROP CONSTRAINT IF EXISTS project_public_join_mode_check;

ALTER TABLE "public"."Project"
DROP COLUMN IF EXISTS "featured_record_id",
DROP COLUMN IF EXISTS "public_join_capacity",
DROP COLUMN IF EXISTS "public_join_mode",
DROP COLUMN IF EXISTS "is_public_listed";
