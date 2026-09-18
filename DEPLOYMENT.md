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
