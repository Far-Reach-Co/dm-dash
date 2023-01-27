-- Up Migration
ALTER TABLE public."ProjectInvite"
ADD CONSTRAINT UC_Project UNIQUE (project_id);
-- Down Migration
ALTER TABLE public."ProjectInvite"
DROP CONSTRAINT UC_Project UNIQUE (project_id);
