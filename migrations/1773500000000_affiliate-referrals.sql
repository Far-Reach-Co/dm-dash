-- Up Migration
CREATE TABLE "public"."AffiliateCode" (
  "id" serial PRIMARY KEY,
  "code" varchar(64) NOT NULL UNIQUE,
  "collaborator_name" varchar(255) NOT NULL,
  "notes" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "public"."AffiliateCommission" (
  "id" serial PRIMARY KEY,
  "stripe_subscription_id" varchar(255) NOT NULL UNIQUE,
  "stripe_invoice_id" varchar(255),
  "affiliate_code_id" integer NOT NULL REFERENCES "public"."AffiliateCode"("id") ON DELETE RESTRICT,
  "user_id" integer NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
  "project_id" integer REFERENCES "public"."Project"("id") ON DELETE SET NULL,
  "scope" varchar(16) NOT NULL CHECK ("scope" IN ('user', 'project')),
  "amount_cents" integer NOT NULL CHECK ("amount_cents" > 0),
  "status" varchar(16) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'paid', 'void')),
  "payout_note" text,
  "paid_by_user_id" integer REFERENCES "public"."User"("id") ON DELETE SET NULL,
  "paid_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT affiliate_commission_scope_project_check CHECK (
    ("scope" = 'user' AND "project_id" IS NULL)
    OR ("scope" = 'project' AND "project_id" IS NOT NULL)
  )
);

CREATE INDEX affiliate_code_active_idx
ON "public"."AffiliateCode" ("is_active", "created_at" DESC);

CREATE INDEX affiliate_commission_status_created_idx
ON "public"."AffiliateCommission" ("status", "created_at" DESC);

CREATE INDEX affiliate_commission_code_status_idx
ON "public"."AffiliateCommission" ("affiliate_code_id", "status");

CREATE INDEX affiliate_commission_user_created_idx
ON "public"."AffiliateCommission" ("user_id", "created_at" DESC);

CREATE UNIQUE INDEX affiliate_commission_invoice_unique_idx
ON "public"."AffiliateCommission" ("stripe_invoice_id")
WHERE "stripe_invoice_id" IS NOT NULL;

-- Down Migration
DROP INDEX IF EXISTS "public"."affiliate_commission_invoice_unique_idx";
DROP INDEX IF EXISTS "public"."affiliate_commission_user_created_idx";
DROP INDEX IF EXISTS "public"."affiliate_commission_code_status_idx";
DROP INDEX IF EXISTS "public"."affiliate_commission_status_created_idx";
DROP INDEX IF EXISTS "public"."affiliate_code_active_idx";

DROP TABLE IF EXISTS "public"."AffiliateCommission";
DROP TABLE IF EXISTS "public"."AffiliateCode";
