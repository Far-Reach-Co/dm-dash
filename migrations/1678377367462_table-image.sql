-- Up Migration
CREATE TABLE "public"."TableImage" ("id" serial,"project_id" int4 NOT NULL,"image_id" int4 NOT NULL, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."TableImage";