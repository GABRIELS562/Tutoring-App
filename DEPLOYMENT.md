# Deployment

Vercel (app) + Supabase (auth/DB) + Cloudflare (DNS). No Docker, no GitLab — never wired up; see `docs/archive/INFRASTRUCTURE-aws-ecs-design.md`.

## Vercel

- Framework preset: Next.js. Install command: `npm ci`.
- **Build command:** `npm run build` (runs `next build --webpack`) — keep `--webpack`; `next-pwa` and the `react-pdf` alias in `next.config.ts` require it, not Turbopack.
- Set all env vars below for Production + Preview.

## Supabase

- `DATABASE_URL` at **runtime** → **pooled** connection string, port **6543** (`...pooler.supabase.com:6543/postgres`).
- For migrations / `db:push` / `drizzle-kit generate` → **direct** connection string, port 5432 (the pooler doesn't support what the migrator needs).

## Required environment variables

| Var | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; falls back to anon key if unset |
| `DATABASE_URL` | Pooled (6543) at runtime, direct (5432) for migrations |
| `ANTHROPIC_API_KEY` | AI hints (`api/ai-hint`) and step generation (`api/admin/generate-steps`), via `src/lib/claude.ts` |
| `ANTHROPIC_MODEL` | Optional. Defaults to `claude-sonnet-5` (`getClaudeModel()` in `src/lib/claude.ts`) |
| `ADMIN_EMAIL` | **Grants admin** to this Supabase user — set carefully |

## DNS

Cloudflare manages the domain; point the app record at Vercel per Vercel's instructions and let it issue the certificate.

## Seeding a fresh database

Order matters — later seeds depend on earlier rows:

```bash
npm run db:seed-topics
npm run db:seed-questions
npm run db:seed-papers
```

## Applying Row Level Security and DB functions (release gate)

`npm run db:push` only manages table shape — it does not (and can't)
apply RLS policies or Postgres functions. **Every environment must run
`npm run db:rls` and `npm run db:functions` after
`db:push`/`db:generate`+migrate, before it is considered live**:

```bash
npm run db:push        # or drizzle-kit migrate, once migrations exist
npm run db:rls          # applies supabase/migrations/0001_rls.sql
npm run db:functions    # applies supabase/migrations/0002_functions.sql (depends on 0001's unique constraint)
```

Both run `scripts/apply-sql.ts` against `DATABASE_URL` (use the
**direct**, port-5432 connection — same as migrations, not the pooled
one) inside a single transaction: each commits only if its whole file
succeeds, and rolls back cleanly on any error. Both are safe to re-run —
the migrations themselves are idempotent (`DROP POLICY IF EXISTS` /
`DROP CONSTRAINT IF EXISTS` / `CREATE OR REPLACE FUNCTION` guards
throughout).

Treat this as a hard release gate, not a one-time setup step: without
`db:rls`, every table it covers is either fully open (RLS never enabled)
or running with stale policies after a schema change that recreates a
table. Without `db:functions`, `POST /api/ai-hint` fails every request
for a free-tier user once code that calls `increment_hint_usage()` is
deployed (the function won't exist). Re-run both after any migration
that touches `supabase/migrations/0001_rls.sql` or `0002_functions.sql`'s
tables.

## Monthly spend cap (Anthropic)

**Set a monthly spend limit on the Anthropic account at provisioning
time** (Console → Settings → Billing → spend limits), before
`ANTHROPIC_API_KEY` is ever put into a production environment variable.
There is no in-app enforcement of a spend ceiling — `src/lib/claude.ts`
has a 30s timeout and 2 retries per call and each mode caps
`max_tokens`, but nothing stops overall request volume; the
account-level cap is the actual backstop.

`ai_usage_log` (`src/db/schema.ts`, written by
`src/lib/claude-usage-log.ts` after every successful `createTutorMessage()`
call) records `user_id`, `mode`, `model`, and input/output/cache token
counts per call — for after-the-fact visibility and a future admin usage
view, not prevention. Service-role only (RLS enabled, no policies).
