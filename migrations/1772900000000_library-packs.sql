CREATE TABLE public."LibraryPack" (
  "id" serial PRIMARY KEY,
  "owner_user_id" integer REFERENCES public."User" ("id") ON DELETE CASCADE,
  "owner_project_id" integer REFERENCES public."Project" ("id") ON DELETE CASCADE,
  "title" varchar(120) NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "visibility" varchar(24) NOT NULL DEFAULT 'private',
  "is_pro_only" boolean NOT NULL DEFAULT true,
  "is_published" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "LibraryPack_owner_scope_check"
    CHECK (
      ((CASE WHEN "owner_user_id" IS NULL THEN 0 ELSE 1 END) +
       (CASE WHEN "owner_project_id" IS NULL THEN 0 ELSE 1 END)) = 1
    ),
  CONSTRAINT "LibraryPack_visibility_check"
    CHECK ("visibility" IN ('private', 'project', 'public_pro'))
);

CREATE INDEX "LibraryPack_owner_user_idx"
  ON public."LibraryPack" ("owner_user_id");
CREATE INDEX "LibraryPack_owner_project_idx"
  ON public."LibraryPack" ("owner_project_id");
CREATE INDEX "LibraryPack_visibility_published_idx"
  ON public."LibraryPack" ("visibility", "is_published");

CREATE TABLE public."LibraryPackImage" (
  "id" serial PRIMARY KEY,
  "pack_id" integer NOT NULL REFERENCES public."LibraryPack" ("id") ON DELETE CASCADE,
  "image_id" integer NOT NULL REFERENCES public."Image" ("id") ON DELETE RESTRICT,
  "sort_order" integer NOT NULL DEFAULT 0,
  "tags" text[] NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "LibraryPackImage_pack_image_unique"
    UNIQUE ("pack_id", "image_id")
);

CREATE INDEX "LibraryPackImage_pack_idx"
  ON public."LibraryPackImage" ("pack_id");
CREATE INDEX "LibraryPackImage_image_idx"
  ON public."LibraryPackImage" ("image_id");

CREATE TABLE public."TableViewPack" (
  "id" serial PRIMARY KEY,
  "table_view_id" integer NOT NULL REFERENCES public."TableView" ("id") ON DELETE CASCADE,
  "pack_id" integer NOT NULL REFERENCES public."LibraryPack" ("id") ON DELETE CASCADE,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "TableViewPack_table_pack_unique"
    UNIQUE ("table_view_id", "pack_id")
);

CREATE INDEX "TableViewPack_table_idx"
  ON public."TableViewPack" ("table_view_id");
CREATE INDEX "TableViewPack_pack_idx"
  ON public."TableViewPack" ("pack_id");
