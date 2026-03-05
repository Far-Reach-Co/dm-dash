-- Up Migration

-- Keep only one project-character link per (project_id, player_id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, player_id
      ORDER BY id ASC
    ) AS rn
  FROM public."ProjectPlayer"
)
DELETE FROM public."ProjectPlayer" pp
USING ranked
WHERE pp.id = ranked.id
  AND ranked.rn > 1;

-- Keep only one sheet-collaborator link per (player_id, user_id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY player_id, user_id
      ORDER BY id ASC
    ) AS rn
  FROM public."PlayerUser"
)
DELETE FROM public."PlayerUser" pu
USING ranked
WHERE pu.id = ranked.id
  AND ranked.rn > 1;

-- Keep only one record-image link per (record_id, image_id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY record_id, image_id
      ORDER BY id ASC
    ) AS rn
  FROM public."RecordImage"
)
DELETE FROM public."RecordImage" ri
USING ranked
WHERE ri.id = ranked.id
  AND ranked.rn > 1;

-- Keep only one project-scoped table image per (project_id, image_id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, image_id
      ORDER BY id DESC
    ) AS rn
  FROM public."TableImage"
  WHERE project_id IS NOT NULL
)
DELETE FROM public."TableImage" ti
USING ranked
WHERE ti.id = ranked.id
  AND ranked.rn > 1;

-- Keep only one user-scoped table image per (user_id, image_id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, image_id
      ORDER BY id DESC
    ) AS rn
  FROM public."TableImage"
  WHERE user_id IS NOT NULL
)
DELETE FROM public."TableImage" ti
USING ranked
WHERE ti.id = ranked.id
  AND ranked.rn > 1;

-- Keep only one invite row per player (latest invite UUID wins).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY player_id
      ORDER BY id DESC
    ) AS rn
  FROM public."PlayerInvite"
)
DELETE FROM public."PlayerInvite" pi
USING ranked
WHERE pi.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX "ProjectPlayer_project_player_unique"
  ON public."ProjectPlayer" ("project_id", "player_id");

CREATE UNIQUE INDEX "PlayerUser_player_user_unique"
  ON public."PlayerUser" ("player_id", "user_id");

CREATE UNIQUE INDEX "RecordImage_record_image_unique"
  ON public."RecordImage" ("record_id", "image_id");

CREATE UNIQUE INDEX "TableImage_project_image_unique"
  ON public."TableImage" ("project_id", "image_id");

CREATE UNIQUE INDEX "TableImage_user_image_unique"
  ON public."TableImage" ("user_id", "image_id");

CREATE UNIQUE INDEX "PlayerInvite_player_unique"
  ON public."PlayerInvite" ("player_id");

-- Down Migration
DROP INDEX IF EXISTS "public"."PlayerInvite_player_unique";
DROP INDEX IF EXISTS "public"."TableImage_user_image_unique";
DROP INDEX IF EXISTS "public"."TableImage_project_image_unique";
DROP INDEX IF EXISTS "public"."RecordImage_record_image_unique";
DROP INDEX IF EXISTS "public"."PlayerUser_player_user_unique";
DROP INDEX IF EXISTS "public"."ProjectPlayer_project_player_unique";
