-- Up Migration
CREATE TABLE "public"."Record" (
  "id" serial PRIMARY KEY,
  "project_id" int4,
  "user_id" int4,
  "title" varchar,
  "description" varchar
);
CREATE TABLE "public"."RecordImage" (
  "id" serial PRIMARY KEY,
  "record_id" int4 NOT NULL,
  "image_id" int4 NOT NULL
);

-- Down Migration
DROP TABLE "public"."Record";
DROP TABLE "public"."RecordImage";