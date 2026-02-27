-- Up Migration
CREATE TABLE "public"."Notification" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
  "type" varchar(80) NOT NULL,
  "title" varchar(180) NOT NULL,
  "body" varchar(600) NOT NULL DEFAULT '',
  "link" varchar(600),
  "data_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "is_read" boolean NOT NULL DEFAULT false,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX notification_user_read_created_idx
ON "public"."Notification" ("user_id", "is_read", "created_at" DESC);

CREATE INDEX notification_user_created_idx
ON "public"."Notification" ("user_id", "created_at" DESC);

-- Down Migration
DROP INDEX IF EXISTS "public"."notification_user_created_idx";
DROP INDEX IF EXISTS "public"."notification_user_read_created_idx";
DROP TABLE IF EXISTS "public"."Notification";
