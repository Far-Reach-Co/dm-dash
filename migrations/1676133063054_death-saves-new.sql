-- Up Migration
ALTER TABLE "public"."dnd_5e_character_general"
ADD COLUMN "ds_success_1" bool DEFAULT 'false',
ADD COLUMN "ds_success_2" bool DEFAULT 'false',
ADD COLUMN "ds_success_3" bool DEFAULT 'false',
ADD COLUMN "ds_failure_1" bool DEFAULT 'false',
ADD COLUMN "ds_failure_2" bool DEFAULT 'false',
ADD COLUMN "ds_failure_3" bool DEFAULT 'false';
-- Down Migration
ALTER TABLE "public"."dnd_5e_character_general"
DROP COLUMN "ds_success_1",
DROP COLUMN "ds_success_2",
DROP COLUMN "ds_success_3",
DROP COLUMN "ds_failure_1",
DROP COLUMN "ds_failure_2",
DROP COLUMN "ds_failure_3";