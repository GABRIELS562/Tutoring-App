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
| `ANTHROPIC_API_KEY` | AI hints (`api/ai-hint`) |
| `ANTHROPIC_MODEL` | Not read by the code yet (wired in Phase 4); will default to `claude-sonnet-5` |
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

## Applying Row Level Security (release gate)

`npm run db:push` only manages table shape — it does not (and can't)
apply RLS policies. **Every environment must run `npm run db:rls` after
`db:push`/`db:generate`+migrate, before it is considered live**:

```bash
npm run db:push   # or drizzle-kit migrate, once migrations exist
npm run db:rls    # applies supabase/migrations/0001_rls.sql
```

`db:rls` runs `scripts/apply-sql.ts` against `DATABASE_URL` (use the
**direct**, port-5432 connection — same as migrations, not the pooled
one) inside a single transaction: it commits only if the whole file
succeeds, and rolls back cleanly on any error. It is safe to re-run —
the migration itself is idempotent (`DROP POLICY IF EXISTS` /
`DROP CONSTRAINT IF EXISTS` guards throughout).

Treat this as a hard release gate, not a one-time setup step: without
it, every table it covers is either fully open (RLS never enabled) or
running with stale policies after a schema change that recreates a
table. Re-run it after any migration that touches
`supabase/migrations/0001_rls.sql`'s tables.
