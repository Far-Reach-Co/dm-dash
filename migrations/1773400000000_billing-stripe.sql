-- Up Migration
CREATE TABLE "public"."BillingCustomer" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL UNIQUE REFERENCES "public"."User"("id") ON DELETE CASCADE,
  "stripe_customer_id" varchar(255) NOT NULL UNIQUE,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "public"."BillingSubscription" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
  "project_id" integer REFERENCES "public"."Project"("id") ON DELETE SET NULL,
  "scope" varchar(16) NOT NULL CHECK ("scope" IN ('user', 'project')),
  "stripe_subscription_id" varchar(255) NOT NULL UNIQUE,
  "stripe_customer_id" varchar(255) NOT NULL,
  "stripe_price_id" varchar(255),
  "status" varchar(64) NOT NULL,
  "current_period_end" timestamp with time zone,
  "cancel_at_period_end" boolean NOT NULL DEFAULT false,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT billing_subscription_scope_project_check CHECK (
    ("scope" = 'user' AND "project_id" IS NULL)
    OR ("scope" = 'project' AND "project_id" IS NOT NULL)
  )
);

CREATE TABLE "public"."BillingEventLog" (
  "id" serial PRIMARY KEY,
  "stripe_event_id" varchar(255) NOT NULL UNIQUE,
  "type" varchar(120) NOT NULL,
  "payload_hash" varchar(64) NOT NULL,
  "payload_json" jsonb NOT NULL,
  "processed_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX billing_subscription_stripe_customer_idx
ON "public"."BillingSubscription" ("stripe_customer_id");

CREATE INDEX billing_subscription_user_scope_status_idx
ON "public"."BillingSubscription" ("user_id", "scope", "status");

CREATE INDEX billing_subscription_project_scope_status_idx
ON "public"."BillingSubscription" ("project_id", "scope", "status")
WHERE "project_id" IS NOT NULL;

CREATE INDEX billing_event_log_type_processed_idx
ON "public"."BillingEventLog" ("type", "processed_at" DESC);

-- Down Migration
DROP INDEX IF EXISTS "public"."billing_event_log_type_processed_idx";
DROP INDEX IF EXISTS "public"."billing_subscription_project_scope_status_idx";
DROP INDEX IF EXISTS "public"."billing_subscription_user_scope_status_idx";
DROP INDEX IF EXISTS "public"."billing_subscription_stripe_customer_idx";

DROP TABLE IF EXISTS "public"."BillingEventLog";
DROP TABLE IF EXISTS "public"."BillingSubscription";
DROP TABLE IF EXISTS "public"."BillingCustomer";
