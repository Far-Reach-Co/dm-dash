-- Up Migration
ALTER TABLE "public"."User"
ADD COLUMN "notify_wyrld_join" bool NOT NULL DEFAULT TRUE,
ADD COLUMN "notify_sheet_link" bool NOT NULL DEFAULT TRUE,
ADD COLUMN "notify_product_updates" bool NOT NULL DEFAULT TRUE,
ADD COLUMN "email_unsubscribed_all" bool NOT NULL DEFAULT FALSE,
ADD COLUMN "email_unsubscribed_at" timestamptz;

-- Down Migration
ALTER TABLE "public"."User"
DROP COLUMN "email_unsubscribed_at",
DROP COLUMN "email_unsubscribed_all",
DROP COLUMN "notify_product_updates",
DROP COLUMN "notify_sheet_link",
DROP COLUMN "notify_wyrld_join";
