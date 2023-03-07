-- Up Migration
CREATE TABLE "public"."ProjectPlayer" ("id" serial,"project_id" int4 NOT NULL,"player_id" int4 NOT NULL, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."ProjectPlayer";