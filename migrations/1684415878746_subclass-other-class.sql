-- Up Migration
ALTER TABLE "public"."dnd_5e_character_general"
ADD COLUMN "subclass" varchar,
ADD COLUMN "other_class" varchar;
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_general"
DROP COLUMN "subclass",
DROP COLUMN "other_class";