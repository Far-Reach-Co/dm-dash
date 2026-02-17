-- Up Migration
ALTER TABLE "public"."TableView"
ADD COLUMN "mode" varchar NOT NULL DEFAULT 'standard';

ALTER TABLE "public"."TableView"
ADD CONSTRAINT tableview_mode_check
CHECK ("mode" IN ('standard', 'sandbox'));

-- Down Migration
ALTER TABLE "public"."TableView"
DROP CONSTRAINT IF EXISTS tableview_mode_check;

ALTER TABLE "public"."TableView"
DROP COLUMN "mode";
