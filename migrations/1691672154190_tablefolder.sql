-- Up Migration
CREATE TABLE "public"."TableFolder" ("id" serial,"user_id" int4,"project_id" int4,"is_sub" bool NOT NULL DEFAULT 'false',"parent_folder_id" int4,"title" varchar NOT NULL DEFAULT 'New Folder', PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."TableFolder";