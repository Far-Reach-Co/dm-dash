-- Up Migration
CREATE TABLE IF NOT EXISTS public."session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    PRIMARY KEY ("sid")
);
-- Down Migration
DROP TABLE IF EXISTS public."session";
