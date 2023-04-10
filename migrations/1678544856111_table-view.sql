-- Up Migration
CREATE TABLE "public"."TableView" ("id" serial,"project_id" int4 NOT NULL,"data" jsonb NOT NULL DEFAULT '{}', PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."TableView";