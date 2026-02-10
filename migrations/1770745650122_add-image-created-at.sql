-- Up Migration
ALTER TABLE public."Image"
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Down Migration
ALTER TABLE public."Image"
DROP COLUMN created_at;
