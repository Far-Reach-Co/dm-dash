-- Up Migration
CREATE TABLE "public"."EmailCampaignSend" (
  "id" serial PRIMARY KEY,
  "campaign_slug" varchar(120) NOT NULL,
  "user_id" int4 NOT NULL REFERENCES public."User" ("id") ON DELETE CASCADE,
  "email" varchar NOT NULL,
  "sent_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "idx_email_campaign_send_unique"
  ON "public"."EmailCampaignSend" ("campaign_slug", "user_id");

CREATE INDEX "idx_email_campaign_send_campaign"
  ON "public"."EmailCampaignSend" ("campaign_slug", "sent_at" DESC);

-- Down Migration
DROP TABLE "public"."EmailCampaignSend";
