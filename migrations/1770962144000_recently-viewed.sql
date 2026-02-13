-- Up Migration
CREATE TABLE "public"."RecentlyViewed" (
  "id" serial PRIMARY KEY,
  "user_id" int4 NOT NULL REFERENCES public."User" ("id") ON DELETE CASCADE,
  "entity_type" varchar(32) NOT NULL,
  "entity_id" int4 NOT NULL,
  "viewed_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "RecentlyViewed_user_entity"
  ON public."RecentlyViewed" ("user_id", "entity_type", "entity_id");
CREATE INDEX "RecentlyViewed_user_recent"
  ON public."RecentlyViewed" ("user_id", "viewed_at" DESC);

-- Down Migration
DROP TABLE "public"."RecentlyViewed";
