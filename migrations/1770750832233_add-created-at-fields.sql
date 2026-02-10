-- Up Migration
ALTER TABLE public."Record"
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public."dnd_5e_character_general"
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public."Calendar"
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Down Migration
ALTER TABLE public."Calendar"
DROP COLUMN created_at;

ALTER TABLE public."dnd_5e_character_general"
DROP COLUMN created_at;

ALTER TABLE public."Record"
DROP COLUMN created_at;
