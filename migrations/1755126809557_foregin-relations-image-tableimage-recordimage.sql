-- Up Migration
ALTER TABLE "public"."TableImage"
  DROP CONSTRAINT IF EXISTS table_image_image_id_fkey,
  ADD CONSTRAINT table_image_image_id_fkey
    FOREIGN KEY (image_id)
    REFERENCES "public"."Image"(id)
    ON DELETE CASCADE;

ALTER TABLE "public"."RecordImage"
  DROP CONSTRAINT IF EXISTS record_image_image_id_fkey,
  ADD CONSTRAINT record_image_image_id_fkey
    FOREIGN KEY (image_id)
    REFERENCES "public"."Image"(id)
    ON DELETE CASCADE;

ALTER TABLE "public"."RecordImage"
  DROP CONSTRAINT IF EXISTS record_image_record_id_fkey,
  ADD CONSTRAINT record_image_record_id_fkey
    FOREIGN KEY (record_id)
    REFERENCES "public"."Record"(id)
    ON DELETE CASCADE;

-- Down Migration
ALTER TABLE "public"."TableImage"
  DROP CONSTRAINT IF EXISTS table_image_image_id_fkey;

ALTER TABLE "public"."RecordImage"
  DROP CONSTRAINT IF EXISTS record_image_record_id_fkey;
