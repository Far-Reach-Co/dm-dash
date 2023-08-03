-- Up Migration
CREATE TABLE "public"."PlayerInvite" ("id" serial NOT NULL,"player_id" int4 NOT NULL,"uuid" varchar NOT NULL, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."PlayerInvite";