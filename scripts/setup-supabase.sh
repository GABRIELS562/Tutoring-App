#!/usr/bin/env bash
#
# Brings a brand-new Supabase project up to a working app: schema, RLS,
# functions, then the curriculum.
#
#   ./scripts/setup-supabase.sh
#
# Reads the four values from .env.local. It never prints them.
#
# Safe to re-run. Every step is idempotent: drizzle-kit push diffs the
# schema, both SQL migrations are written to be re-runnable, and the seeds
# skip rows that already exist.
#
# The order matters and is not arbitrary:
#   push      creates the tables (and the unique indexes the upserts need)
#   rls       locks them down - MUST come after push, because it drops and
#             re-adds constraints that push creates
#   functions adds increment_hint_usage, used by the AI hint quota
#   seeds     topics first: questions and papers reference them
set -euo pipefail

cd "$(dirname "$0")/.."

say()  { printf "\n\033[1m==> %s\033[0m\n" "$1"; }
ok()   { printf "    \033[32mok\033[0m  %s\n" "$1"; }
fail() { printf "    \033[31mFAILED\033[0m  %s\n" "$1"; exit 1; }

# ---- 1. the four values have to be present before anything runs ----------
say "checking .env.local"
[ -f .env.local ] || fail ".env.local not found"
set -a; . ./.env.local; set +a

missing=()
for key in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY \
           SUPABASE_SERVICE_ROLE_KEY DATABASE_URL; do
  [ -n "${!key:-}" ] || missing+=("$key")
done
if [ ${#missing[@]} -gt 0 ]; then
  printf "    \033[31mnot set:\033[0m %s\n" "${missing[*]}"
  echo
  echo "    Fill these in .env.local from your Supabase project:"
  echo "      Settings > API     -> URL, anon key, service_role key"
  echo "      Settings > Database -> connection string (URI), session pooler"
  exit 1
fi
ok "all four values present"

# A pooler URL (port 6543) cannot run DDL. drizzle-kit push and the two SQL
# migrations need the direct connection on 5432, which is a different host.
case "$DATABASE_URL" in
  *:6543*) fail "DATABASE_URL is the transaction pooler (:6543). Migrations need the direct connection (:5432) - take the 'URI' under Settings > Database, not the pooler string." ;;
esac
case "$DATABASE_URL" in
  *sslmode=*) ok "DATABASE_URL carries an sslmode" ;;
  *) printf "    note: no sslmode in DATABASE_URL - src/db/index.ts enables TLS for non-local hosts anyway\n" ;;
esac

# ---- 2. can we actually reach it? ----------------------------------------
say "connecting"
npx --yes tsx -e '
import { Pool } from "pg"
// Mirrors src/db/index.ts: TLS for remote hosts, plain for local, so
// this script can be exercised against a throwaway Postgres before it is
// ever pointed at a real project.
const url = process.env.DATABASE_URL ?? ""
const local = url.includes("localhost") || url.includes("127.0.0.1")
const pool = new Pool({
  connectionString: url,
  ssl: local ? false : { rejectUnauthorized: false },
})
void (async () => {
  const r = await pool.query("select current_database() db, version() v")
  console.log("    ok  connected to " + r.rows[0].db)
  console.log("        " + r.rows[0].v.split(",")[0])
  await pool.end()
})().catch((e) => { console.error("    " + e.message); process.exit(1) })
' || fail "could not connect - check DATABASE_URL and that the project has finished provisioning"

# ---- 3. schema, policies, functions --------------------------------------
say "db:push (schema)"
npx drizzle-kit push --force > /dev/null && ok "tables created" || fail "db:push"

say "db:rls (row level security)"
npm run --silent db:rls > /dev/null && ok "policies applied" || fail "db:rls"

say "db:functions"
npm run --silent db:functions > /dev/null && ok "functions applied" || fail "db:functions"

say "db:rls again (must be re-runnable)"
npm run --silent db:rls > /dev/null && ok "re-runnable" || fail "db:rls is not idempotent"

# ---- 4. the curriculum ---------------------------------------------------
say "seeding topics"
npm run --silent db:seed-topics > /dev/null && ok "topics" || fail "seed-topics"

say "seeding questions"
npm run --silent db:seed-questions > /dev/null && ok "questions" || fail "seed-questions"

say "seeding past papers"
npm run --silent db:seed-papers | tail -1

# ---- 5. prove the lockdown actually took ---------------------------------
# The whole point of db:rls. Without this the app looks healthy while any
# student could PATCH their own row to is_admin through PostgREST, because
# the anon key ships in the client bundle.
say "verifying RLS is really on"
npx --yes tsx -e '
import { Pool } from "pg"
const url = process.env.DATABASE_URL ?? ""
const local = url.includes("localhost") || url.includes("127.0.0.1")
const pool = new Pool({
  connectionString: url,
  ssl: local ? false : { rejectUnauthorized: false },
})
const tables = ["users","student_progress","ai_hint_usage","exam_attempts","prompt_challenge_attempts","ai_certificates"]
void (async () => {
const { rows } = await pool.query(
  `select tablename, rowsecurity from pg_tables where schemaname = $1 and tablename = any($2)`,
  ["public", tables]
)
const off = rows.filter((r) => !r.rowsecurity).map((r) => r.tablename)
const missing = tables.filter((t) => !rows.find((r) => r.tablename === t))
if (missing.length) { console.error("    MISSING TABLES: " + missing.join(", ")); process.exit(1) }
if (off.length) { console.error("    RLS IS OFF ON: " + off.join(", ")); process.exit(1) }
console.log("    ok  row level security enabled on all " + rows.length + " student-data tables")

const pol = await pool.query(`select tablename, count(*) n from pg_policies where schemaname = $1 group by tablename order by tablename`, ["public"])
for (const p of pol.rows) console.log("        " + p.tablename + ": " + p.n + " policies")
await pool.end()
})().catch((e) => { console.error("    " + e.message); process.exit(1) })
' || fail "RLS verification"

say "done"
echo "    The app can now boot in production against this project."
echo "    Next: npm run build && npm run start, or deploy to server1."
