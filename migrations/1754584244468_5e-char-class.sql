-- Up Migration
CREATE TABLE "public"."dnd_5e_class" (
  "id" serial PRIMARY KEY,
  "general_id" int4 NOT NULL,
  "class" varchar,
  "subclass" varchar,
  "hit_dice_type" varchar,
  "total_hit_dice" int4,
  "current_hit_dice" int4,
  CONSTRAINT dnd_5e_class_general_id_fkey
    FOREIGN KEY (general_id)
    REFERENCES "public"."dnd_5e_character_general"(id)
    ON DELETE CASCADE
);

-- Down Migration
DROP TABLE "public"."dnd_5e_class";
