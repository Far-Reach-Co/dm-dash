-- Up Migration
CREATE TABLE "public"."TableViewTemplate" (
  "id" serial,
  "title" varchar NOT NULL DEFAULT 'New Template',
  "data" jsonb NOT NULL DEFAULT '{}',
  "mode" varchar NOT NULL DEFAULT 'standard',
  "date_created" timestamptz NOT NULL DEFAULT now(),
  "user_id" int4,
  "project_id" int4,
  "source_table_view_id" int4,
  PRIMARY KEY ("id"),
  CONSTRAINT tableview_template_mode_check CHECK ("mode" IN ('standard', 'sandbox')),
  CONSTRAINT tableview_template_scope_check CHECK (
    ("user_id" IS NOT NULL AND "project_id" IS NULL)
    OR ("user_id" IS NULL AND "project_id" IS NOT NULL)
  )
);

-- Down Migration
DROP TABLE "public"."TableViewTemplate";
