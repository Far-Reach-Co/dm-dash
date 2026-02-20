-- Up Migration
CREATE TABLE "public"."ProjectDiscussionThread" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "public"."Project"("id") ON DELETE CASCADE,
  "creator_user_id" integer NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
  "title" varchar(140) NOT NULL,
  "body" text NOT NULL,
  "is_locked" boolean NOT NULL DEFAULT false,
  "is_pinned" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "public"."ProjectDiscussionPost" (
  "id" serial PRIMARY KEY,
  "thread_id" integer NOT NULL REFERENCES "public"."ProjectDiscussionThread"("id") ON DELETE CASCADE,
  "project_id" integer NOT NULL REFERENCES "public"."Project"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX project_discussion_thread_project_idx
ON "public"."ProjectDiscussionThread" ("project_id", "is_pinned" DESC, "updated_at" DESC);

CREATE INDEX project_discussion_post_thread_idx
ON "public"."ProjectDiscussionPost" ("thread_id", "created_at" ASC);

CREATE INDEX project_discussion_post_project_idx
ON "public"."ProjectDiscussionPost" ("project_id", "created_at" DESC);

-- Down Migration
DROP INDEX IF EXISTS "public"."project_discussion_post_project_idx";
DROP INDEX IF EXISTS "public"."project_discussion_post_thread_idx";
DROP INDEX IF EXISTS "public"."project_discussion_thread_project_idx";

DROP TABLE IF EXISTS "public"."ProjectDiscussionPost";
DROP TABLE IF EXISTS "public"."ProjectDiscussionThread";
