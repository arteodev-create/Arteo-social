ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "identity_domain" VARCHAR(255) NOT NULL DEFAULT 'arteosocial.com';

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "actor_uri" VARCHAR(512);

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "inbox_url" VARCHAR(512);

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "outbox_url" VARCHAR(512);

ALTER TABLE "users"
DROP CONSTRAINT IF EXISTS "users_username_key";

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_identity_domain_key"
ON "users" ("username", "identity_domain");

CREATE INDEX IF NOT EXISTS "users_identity_domain_idx"
ON "users" ("identity_domain");

CREATE UNIQUE INDEX IF NOT EXISTS "users_actor_uri_key"
ON "users" ("actor_uri")
WHERE "actor_uri" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "users_actor_uri_idx"
ON "users" ("actor_uri");
