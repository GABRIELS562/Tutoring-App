#!/usr/bin/env bash
#
# Rehearses the whole database deployment against a throwaway Postgres, so
# the first time db:push -> db:rls -> db:functions runs is NOT against the
# production Supabase project.
#
# This found a real blocker the first time it ran: db:push creates the
# unique indexes from schema.ts, and 0001_rls.sql then did
# `DROP CONSTRAINT IF EXISTS` (which does not touch an index) before
# `ADD CONSTRAINT`, so the documented order failed with
# 'relation "student_progress_user_question_unique" already exists'.
#
#   ./scripts/deploy-rehearsal.sh
#
# Needs Docker. Leaves nothing behind.
set -euo pipefail

CONTAINER=angelo-pg-rehearsal
PORT=55433
IMAGE=postgres:16-alpine
export DATABASE_URL="postgresql://postgres:rehearsal@localhost:${PORT}/angelo"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "==> starting $IMAGE on :$PORT"
cleanup
docker run -d --name "$CONTAINER" \
  -e POSTGRES_PASSWORD=rehearsal -e POSTGRES_DB=angelo \
  -p "${PORT}:5432" "$IMAGE" >/dev/null

for _ in $(seq 1 60); do
  docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done
docker exec "$CONTAINER" pg_isready -U postgres >/dev/null

# Supabase provides auth.uid() and the anon/authenticated/service_role
# roles, with broad default grants on public and RLS as the real gate.
# The rehearsal is only meaningful under that same posture.
echo "==> installing Supabase stand-ins"
docker exec -i "$CONTAINER" psql -U postgres -d angelo -q -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
  AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN NOINHERIT; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN NOINHERIT; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS; END IF;
END $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
SQL

echo "==> db:push"
npx drizzle-kit push --force >/dev/null
echo "==> db:rls"
npm run --silent db:rls >/dev/null
echo "==> db:functions"
npm run --silent db:functions >/dev/null
echo "==> db:rls again (must be re-runnable)"
npm run --silent db:rls >/dev/null

echo "==> seeds"
npm run --silent db:seed-topics >/dev/null
npm run --silent db:seed-questions >/dev/null
npm run --silent db:seed-papers >/dev/null
echo "==> seeds again (must be idempotent)"
npm run --silent db:seed-papers | tail -1

echo "==> security probe"
docker exec -i "$CONTAINER" psql -U postgres -d angelo -q <<'SQL'
\set ON_ERROR_STOP off
SET ROLE authenticated;
SET request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

-- Signup must work: its own row, identity columns only.
INSERT INTO users (id, email, name, grade)
VALUES (auth.uid(), 'rehearsal@test.za', 'Rehearsal', 11)
ON CONFLICT (id) DO NOTHING;

-- Every one of these must be refused.
UPDATE users SET is_admin = true WHERE id = auth.uid();
UPDATE users SET is_premium = true, xp = 999999 WHERE id = auth.uid();
UPDATE ai_hint_usage SET hint_count = 0;
INSERT INTO exam_attempts (user_id, paper_key, item_id, familiarity, calibration, marks_earned, marks_available, xp_earned)
VALUES (auth.uid(),'p','i','confident','mastered',150,150,99999);

RESET ROLE;
SELECT
  (SELECT count(*) FROM users WHERE id = '44444444-4444-4444-4444-444444444444') AS signup_row,
  (SELECT is_admin FROM users WHERE id = '44444444-4444-4444-4444-444444444444') AS is_admin,
  (SELECT xp FROM users WHERE id = '44444444-4444-4444-4444-444444444444') AS xp,
  (SELECT count(*) FROM exam_attempts) AS forged_attempts;
SQL

echo
echo "Expected above: signup_row=1, is_admin=f, xp=0, forged_attempts=0"
echo "Rehearsal complete."
