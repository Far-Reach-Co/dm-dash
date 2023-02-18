-- Up Migration
ALTER TABLE "public"."dnd_5e_character_general"
DROP COLUMN "death_saves_successes",
DROP COLUMN "death_saves_failures";
-- Down Migration
