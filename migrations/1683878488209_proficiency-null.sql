-- Up Migration
ALTER TABLE "public"."dnd_5e_character_other_pro_lang" ALTER COLUMN "proficiency" DROP NOT NULL;
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_other_pro_lang" ALTER COLUMN "proficiency" SET NOT NULL;