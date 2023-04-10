-- Up Migration
UPDATE "dnd_5e_character_general" SET "hit_dice"= 0;
ALTER TABLE "dnd_5e_character_general" ALTER COLUMN "hit_dice" TYPE numeric USING "hit_dice"::smallint;
ALTER TABLE "public"."dnd_5e_character_general" ALTER COLUMN "hit_dice" SET DATA TYPE int2;

ALTER TABLE "public"."dnd_5e_character_general" ALTER COLUMN "hit_dice_total" SET DATA TYPE varchar;
-- Down Migration
UPDATE "dnd_5e_character_general" SET "hit_dice_total"= 0;
ALTER TABLE "dnd_5e_character_general" ALTER COLUMN "hit_dice_total" TYPE numeric USING "hit_dice_total"::smallint;
ALTER TABLE "public"."dnd_5e_character_general" ALTER COLUMN "hit_dice_total" SET DATA TYPE int2;

ALTER TABLE "public"."dnd_5e_character_general" ALTER COLUMN "hit_dice" SET DATA TYPE varchar;