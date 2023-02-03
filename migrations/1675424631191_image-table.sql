-- Up Migration
CREATE TABLE "public"."Image" ("id" serial,"original_name" varchar,"size" float4 NOT NULL,"file_name" varchar NOT NULL, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."Image";