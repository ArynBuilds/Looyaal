#!/bin/sh
# One-shot migration runner. Applies supabase/migrations/*.sql in filename
# order, once each, tracked in supabase_migrations.schema_migrations (the same
# table the Supabase CLI uses). Runs on every `docker compose up`, so new
# migration files are applied automatically after an upgrade.
set -eu

export PGPASSWORD="$POSTGRES_PASSWORD"
PSQL="psql -X -q -v ON_ERROR_STOP=1 -h ${POSTGRES_HOST:-db} -p ${POSTGRES_PORT:-5432} -U supabase_admin -d ${POSTGRES_DB:-postgres}"

$PSQL -c "CREATE SCHEMA IF NOT EXISTS supabase_migrations;
  CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY, statements text[], name text);"

applied=0
for file in /migrations/*.sql; do
  [ -f "$file" ] || continue
  base=$(basename "$file" .sql)
  version=${base%%_*}
  name=$(printf '%s' "${base#*_}" | sed "s/'/''/g")
  done_already=$($PSQL -tA -c "SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '$version'")
  [ "$done_already" = "1" ] && continue

  echo "[migrate] applying $base"
  $PSQL --single-transaction -f "$file" \
    -c "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('$version', '$name')"
  applied=$((applied + 1))
done

# Make PostgREST pick up new tables/functions immediately
$PSQL -c "NOTIFY pgrst, 'reload schema';"
echo "[migrate] done ($applied applied)"
