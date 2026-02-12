-- Up Migration
CREATE TABLE "public"."LocationPin" (
  "id" serial PRIMARY KEY,
  "table_view_id" int4 NOT NULL REFERENCES public."TableView" ("id") ON DELETE CASCADE,
  "canvas_object_id" varchar(256) NOT NULL,
  "title" varchar NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "image_id" int4 REFERENCES public."Image" ("id"),
  "portal_table_view_ids" int4[] NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "LocationPin_table_object" ON public."LocationPin" ("table_view_id", "canvas_object_id");

-- Down Migration
DROP TABLE "public"."LocationPin";
