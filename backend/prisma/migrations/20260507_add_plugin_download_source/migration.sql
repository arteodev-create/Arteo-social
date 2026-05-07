ALTER TABLE "plugins"
ADD COLUMN IF NOT EXISTS "installed_from_id" UUID;

CREATE INDEX IF NOT EXISTS "plugins_installed_from_id_idx"
ON "plugins" ("installed_from_id");
