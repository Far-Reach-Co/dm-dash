-- Up Migration
CREATE TABLE "public"."Lore" ("id" serial,"title" varchar NOT NULL,"description" varchar NOT NULL,"type" varchar,"image_id" int4,"location_id" int4,"character_id" int4,"item_id" int4,"project_id" int4 NOT NULL, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."Lore";