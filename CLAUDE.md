# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Warning

This project uses **Next.js 16** which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code and heed deprecation notices.

## Repo Layout & Git

- This directory (`angelo-tutoring/`) is its own git repo on branch **`master`**, `origin` = `https://github.com/GABRIELS562/Tutoring-App.git`. The parent `Updated-tutorial-app-2026/` is a plain wrapper folder (architecture docs, tool-comparison write-ups) — **run all git commands from inside `angelo-tutoring/`**. `/Users/user` itself is a separate git repo; never run git from there.
- The GitLab pipeline (`.gitlab-ci.yml`, `GITLAB_SETUP.md`, etc.) and the Dockerfile were never wired to the current GitHub remote and have been deleted. CI is `.github/workflows/ci.yml`; see `DEPLOYMENT.md` for the actual Vercel + Supabase deployment target and `docs/archive/INFRASTRUCTURE-aws-ecs-design.md` for the abandoned design.

## Commands

```bash
npm run dev              # next dev --webpack (port 3000). Webpack, NOT Turbopack — required by next-pwa + react-pdf alias
npm run build            # next build --webpack
npm run start
npm run lint             # eslint (flat config); ignores scripts/, public/sw.js, public/workbox-*.js
npm run typecheck        # tsc --noEmit — also what CI runs
npm test                 # vitest run
npm run test:watch       # vitest, watch mode
npm run test:coverage    # vitest run --coverage

# Database (Drizzle ORM + PostgreSQL, requires DATABASE_URL)
npm run db:push          # the actual workflow — NO migrations are committed (drizzle.config.ts points at src/db/migrations, which doesn't exist)
npm run db:generate
npm run db:studio
npm run db:seed-topics    # curriculum topics — run first, other seeds depend on it
npm run db:seed-questions
npm run db:seed-papers
```

## Architecture

### Route groups (App Router)

- `src/app/(app)/` — main student app (dashboard, subjects, topics, papers, progress, formulas, ai-skills). Layout is `force-dynamic` and resolves the user server-side.
- `src/app/(admin)/admin/` — topics/questions management. Layout is `force-dynamic`.
- `src/app/(auth)/` — login, signup.
- `src/app/api/` — route handlers: `admin/*`, `ai-hint`, `ai-skills/*`, `update-grade`, `verify/[certificateId]`.

### Demo mode is layered — every layer checks env independently

There is no single feature flag. Each layer degrades on its own:

| Layer | Condition | Behaviour |
|---|---|---|
| `src/middleware.ts` | Supabase env missing | Passes every request through (no route protection) |
| `(app)/layout.tsx` | Supabase env missing | Returns a hard-coded `Demo Student` user |
| `(admin)/admin/layout.tsx` | Supabase env missing **or any error** | Grants admin access; `ADMIN_EMAIL` env also grants admin to a matching Supabase user |
| `src/db/index.ts` | `DATABASE_URL` missing | Exports a Proxy that **throws** on any property access |
| `src/lib/supabase/api.ts` | Supabase env missing | `withSupabase()` returns the caller's `demoFallback` silently |
| `QuizEngine.tsx` | no `initialQuestions` | Falls back to in-file mock questions |

Consequence: you can run the UI with an empty `.env.local`, but anything touching `db` will throw unless the caller catches it (most `src/db/queries/*` do, returning empty results).

### Two parallel data-access paths to the same Postgres

1. **Drizzle** (`@/db`, schema in `src/db/schema.ts`, queries in `src/db/queries/{users,topics,questions,progress,admin}.ts`) — used by pages, admin routes, `update-grade`, `weaknessDetector`. camelCase property names.
2. **Supabase service-role client** (`@/lib/supabase/api` → `getApiSupabase()` / `withSupabase()`) — used only by `api/ai-hint` and `api/ai-skills/*`. Raw `snake_case` column names (`hint_count`, `is_premium`, `streak_count`).

When editing a table, keep both in sync: the Drizzle schema and any `.from('table_name')` strings in the Supabase routes. `(app)/layout.tsx` also reads `users` directly via `@supabase/ssr` and maps snake_case → `UserData`.

### Auth & user data flow

Supabase SSR. Middleware protects `/dashboard`, `/subjects`, `/topics`, `/papers`, `/progress`, `/admin` and bounces logged-in users off `/login`/`/signup`. `(app)/layout.tsx` fetches the `users` row and passes it into `UserProvider`; client components read it with `useUser()` from `src/context/UserContext.tsx`. Admin status is `users.is_admin` (checked via `isUserAdmin` in `queries/admin.ts`).

### Adding a curriculum topic touches three places

Topic content is static TypeScript, not DB-driven:

1. Create `src/content/{maths|science}/grade{N}/<topic>.ts` exporting a `TopicContent` (types in `src/types/index.ts`).
2. Register the slug in `contentRegistry` in `src/app/(app)/topics/[slug]/page.tsx` (hard-coded import map; aliases like `'trigonometry'` → gr11 exist).
3. Add the slug to `topicsData` in `src/db/seed-topics.ts` so the `topics` table row exists for progress/questions.

`src/app/(app)/topics/[slug]/practice/page.tsx` has its own small `topicMetadata` map (currently only trig) — extend it if the practice header needs subject/paper info. AI-skills modules live in `src/content/ai-skills/`; formula sheet in `src/content/formulas.ts`.

### AI hint route (`src/app/api/ai-hint/route.ts`)

- Calls the Anthropic Messages REST endpoint with `fetch` directly (no SDK); model id is hard-coded in the route. `src/lib/claude.ts` is an empty placeholder.
- Six modes via Zod-validated `mode`: `step_hint`, `wrong_answer`, `camera_scan` (image), `prompt_evaluation`, `general_question`, `cv_help`.
- Free-tier daily limits (`FREE_HINT_LIMIT = 5`, `FREE_CAMERA_LIMIT = 1`) tracked in `ai_hint_usage` via the Supabase client; `isPremium` bypasses. System prompt has EN and AF variants selected by `locale`.

### i18n

`next-intl`, locales `en` | `af`, **cookie-based (`NEXT_LOCALE`), `localePrefix: 'never'`** — no `/af/...` URLs. Server side reads the cookie in `src/i18n/request.ts`; client helpers in `src/lib/locale.ts`. Messages in `src/messages/{en,af}.json`.

### PWA / offline

`next-pwa` configured in `next.config.ts` (disabled in development). Runtime caches: topic pages and formulas are `CacheFirst`, `/api/*` is `NetworkFirst`. `src/lib/offlineStorage.ts` handles client-side persistence. Icons are generated by `scripts/generate-icons.{js,mjs}`.

### UI

Shadcn (`components.json`, base-nova style) in `src/components/ui/`; Tailwind v4 via `@tailwindcss/postcss`; Lucide icons; Framer Motion; KaTeX through `react-katex` (`src/components/math/MathRenderer.tsx`); `react-pdf` for past papers (needs the `canvas`/`encoding` webpack aliases in `next.config.ts`). Feature components: `quiz/`, `ai/`, `gamification/`, `dashboard/`, `notes/`, `layout/`.

## Environment variables

`.env.example` lists everything. The ones that change behaviour:

- `DATABASE_URL` — enables Drizzle; absent = throwing mock db
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — enables auth + route protection; absent = demo user
- `SUPABASE_SERVICE_ROLE_KEY` — used by API routes (falls back to anon key)
- `ANTHROPIC_API_KEY` — AI hints
- `ANTHROPIC_MODEL` — model id for the AI hint route (not read yet — Phase 4 wires it; will default to `claude-sonnet-5`)
- `ADMIN_EMAIL` — grants admin to that Supabase user without `is_admin`

## Known gaps to be aware of

- `SUPABASE_SERVICE_ROLE_KEY` is only referenced in `src/lib/supabase/api.ts` — server routes silently fall back to the anon key when it is unset, so writes become subject to whatever RLS policies exist on the Supabase project.
