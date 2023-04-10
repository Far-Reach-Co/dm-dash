-- Up Migration
CREATE TABLE "public"."LoreRelation" ("id" serial,"lore_id" int4 NOT NULL,"location_id" int4,"character_id" int4,"item_id" int4, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."LoreRelation";