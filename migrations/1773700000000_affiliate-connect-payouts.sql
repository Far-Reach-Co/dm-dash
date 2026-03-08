-- Up Migration
ALTER TABLE "public"."AffiliateCode"
ADD COLUMN "collaborator_email" varchar(255),
ADD COLUMN "stripe_connect_account_id" varchar(255),
ADD COLUMN "stripe_connect_details_submitted" boolean NOT NULL DEFAULT false,
ADD COLUMN "stripe_connect_charges_enabled" boolean NOT NULL DEFAULT false,
ADD COLUMN "stripe_connect_payouts_enabled" boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX affiliate_code_stripe_connect_account_unique_idx
ON "public"."AffiliateCode" ("stripe_connect_account_id")
WHERE "stripe_connect_account_id" IS NOT NULL;

ALTER TABLE "public"."AffiliateCommission"
ADD COLUMN "stripe_transfer_id" varchar(255),
ADD COLUMN "payout_error" text,
ADD COLUMN "payout_attempted_at" timestamp with time zone;

CREATE UNIQUE INDEX affiliate_commission_transfer_unique_idx
ON "public"."AffiliateCommission" ("stripe_transfer_id")
WHERE "stripe_transfer_id" IS NOT NULL;

-- Down Migration
DROP INDEX IF EXISTS "public"."affiliate_commission_transfer_unique_idx";

ALTER TABLE "public"."AffiliateCommission"
DROP COLUMN IF EXISTS "payout_attempted_at",
DROP COLUMN IF EXISTS "payout_error",
DROP COLUMN IF EXISTS "stripe_transfer_id";

DROP INDEX IF EXISTS "public"."affiliate_code_stripe_connect_account_unique_idx";

ALTER TABLE "public"."AffiliateCode"
DROP COLUMN IF EXISTS "stripe_connect_payouts_enabled",
DROP COLUMN IF EXISTS "stripe_connect_charges_enabled",
DROP COLUMN IF EXISTS "stripe_connect_details_submitted",
DROP COLUMN IF EXISTS "stripe_connect_account_id",
DROP COLUMN IF EXISTS "collaborator_email";
