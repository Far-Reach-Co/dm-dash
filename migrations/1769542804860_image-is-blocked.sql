-- Up Migration
ALTER TABLE public."Image" ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;

-- Down Migration
ALTER TABLE public."Image" DROP COLUMN is_blocked;