-- Up Migration
CREATE TABLE "public"."PlayerUser" ("id" serial NOT NULL,"player_id" int4 NOT NULL,"user_id" int4 NOT NULL,"is_editor" bool NOT NULL DEFAULT 'true',"date_joines" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."PlayerUser";