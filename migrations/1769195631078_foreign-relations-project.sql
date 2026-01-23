-- Up Migration

-- Clean up orphaned data before adding constraints (order matters)
-- First clean up tables referencing Project
DELETE FROM "public"."Calendar" WHERE project_id NOT IN (SELECT id FROM "public"."Project");
DELETE FROM "public"."ProjectInvite" WHERE project_id NOT IN (SELECT id FROM "public"."Project");
DELETE FROM "public"."ProjectUser" WHERE project_id NOT IN (SELECT id FROM "public"."Project");
DELETE FROM "public"."ProjectPlayer" WHERE project_id NOT IN (SELECT id FROM "public"."Project");
-- Then clean up tables referencing Calendar (after orphaned calendars are gone)
DELETE FROM "public"."Month" WHERE calendar_id NOT IN (SELECT id FROM "public"."Calendar");
DELETE FROM "public"."Day" WHERE calendar_id NOT IN (SELECT id FROM "public"."Calendar");

-- Tables that reference Project directly
ALTER TABLE "public"."Calendar"
DROP CONSTRAINT IF EXISTS calendar_project_id_fkey,
ADD CONSTRAINT calendar_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES "public"."Project"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."ProjectInvite"
DROP CONSTRAINT IF EXISTS project_invite_project_id_fkey,
ADD CONSTRAINT project_invite_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES "public"."Project"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."ProjectUser"
DROP CONSTRAINT IF EXISTS project_user_project_id_fkey,
ADD CONSTRAINT project_user_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES "public"."Project"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."ProjectPlayer"
DROP CONSTRAINT IF EXISTS project_player_project_id_fkey,
ADD CONSTRAINT project_player_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES "public"."Project"(id)
ON DELETE CASCADE;

-- Tables that reference Calendar (nested cascade)
ALTER TABLE "public"."Month"
DROP CONSTRAINT IF EXISTS month_calendar_id_fkey,
ADD CONSTRAINT month_calendar_id_fkey
FOREIGN KEY (calendar_id)
REFERENCES "public"."Calendar"(id)
ON DELETE CASCADE;

ALTER TABLE "public"."Day"
DROP CONSTRAINT IF EXISTS day_calendar_id_fkey,
ADD CONSTRAINT day_calendar_id_fkey
FOREIGN KEY (calendar_id)
REFERENCES "public"."Calendar"(id)
ON DELETE CASCADE;

-- Down Migration

ALTER TABLE "public"."Calendar"
DROP CONSTRAINT IF EXISTS calendar_project_id_fkey;

ALTER TABLE "public"."ProjectInvite"
DROP CONSTRAINT IF EXISTS project_invite_project_id_fkey;

ALTER TABLE "public"."ProjectUser"
DROP CONSTRAINT IF EXISTS project_user_project_id_fkey;

ALTER TABLE "public"."ProjectPlayer"
DROP CONSTRAINT IF EXISTS project_player_project_id_fkey;

ALTER TABLE "public"."Month"
DROP CONSTRAINT IF EXISTS month_calendar_id_fkey;

ALTER TABLE "public"."Day"
DROP CONSTRAINT IF EXISTS day_calendar_id_fkey;
