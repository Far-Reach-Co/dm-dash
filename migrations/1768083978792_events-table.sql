-- Up Migration
CREATE TABLE "public"."LogEvent" (
  "id" serial PRIMARY KEY,
  "user_id" int4 REFERENCES "User"(id) ON DELETE SET NULL,
  "project_id" int4 REFERENCES "Project"(id) ON DELETE SET NULL,
  "event_type" varchar(100) NOT NULL,
  "event_data" jsonb,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamptz DEFAULT NOW() NOT NULL
);

CREATE INDEX "idx_event_user_id" ON "public"."LogEvent"("user_id");
CREATE INDEX "idx_event_project_id" ON "public"."LogEvent"("project_id");
CREATE INDEX "idx_event_type" ON "public"."LogEvent"("event_type");
CREATE INDEX "idx_event_created_at" ON "public"."LogEvent"("created_at" DESC);
CREATE INDEX "idx_event_user_created" ON "public"."LogEvent"("user_id", "created_at" DESC);

-- Down Migration
DROP TABLE "public"."LogEvent";
