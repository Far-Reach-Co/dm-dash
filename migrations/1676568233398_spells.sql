-- Up Migration
CREATE TABLE "public"."dnd_5e_character_spell" ("id" serial,"general_id" int4 NOT NULL,"title" varchar NOT NULL,"description" varchar NOT NULL,"type" varchar NOT NULL, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."dnd_5e_character_spell";