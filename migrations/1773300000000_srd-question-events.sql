-- Up Migration
CREATE TABLE IF NOT EXISTS "public"."SrdQuestionEvent" (
  "id" bigserial PRIMARY KEY,
  "source" varchar(80) NOT NULL,
  "query_text" text NOT NULL,
  "answer_text" text,
  "is_short" boolean NOT NULL DEFAULT false,
  "request_id" varchar(120),
  "source_user_id" varchar(120),
  "source_guild_id" varchar(120),
  "client_ip" varchar(120),
  "user_agent" varchar(500),
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "srd_question_event_created_idx"
ON "public"."SrdQuestionEvent" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "srd_question_event_source_created_idx"
ON "public"."SrdQuestionEvent" ("source", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "srd_question_event_query_lower_idx"
ON "public"."SrdQuestionEvent" (lower("query_text"));

-- Down Migration
DROP INDEX IF EXISTS "public"."srd_question_event_query_lower_idx";
DROP INDEX IF EXISTS "public"."srd_question_event_source_created_idx";
DROP INDEX IF EXISTS "public"."srd_question_event_created_idx";
DROP TABLE IF EXISTS "public"."SrdQuestionEvent";
