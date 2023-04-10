-- Up Migration
UPDATE "dnd_5e_character_general" SET "class_resource"= 0;
ALTER TABLE "dnd_5e_character_general" ALTER COLUMN "class_resource" TYPE numeric USING "class_resource"::smallint;
ALTER TABLE "public"."dnd_5e_character_general" ALTER COLUMN "class_resource" SET DATA TYPE int2;
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_general" ALTER COLUMN "class_resource" SET DATA TYPE varchar;