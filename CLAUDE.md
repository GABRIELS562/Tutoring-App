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
npm run db:push          # schema (no Drizzle migrations are committed yet; drizzle.config.ts points at src/db/migrations)
npm run db:rls           # apply supabase/migrations/0001_rls.sql — RELEASE GATE, run after db:push
npm run db:functions     # apply supabase/migrations/0002_functions.sql (increment_hint_usage RPC) — after db:rls
npm run db:generate
npm run db:studio
npm run db:seed-topics    # curriculum topics — run first, other seeds depend on it
npm run db:seed-questions
npm run db:seed-papers    # idempotent
npm run db:seed-dev       # 3 fixture users + progress rows; refuses in production
npm run check:videos      # oEmbed check of every videoId/videoIdAf in src/content (also runs weekly in CI)
```

Branching: `master` mirrors the client-facing GitHub remote; `develop` is the integration branch; `phase-N/...` feature branches are worked in git worktrees under `../wt/` and merged into `develop` after review. Never push without being asked.

## Architecture

### Route groups (App Router)

- `src/app/(app)/` — main student app (dashboard, subjects, topics, papers, progress, formulas, ai-skills). Layout is `force-dynamic` and resolves the user server-side.
- `src/app/(admin)/admin/` — topics/questions management. Layout is `force-dynamic`.
- `src/app/(auth)/` — login, signup.
- `src/app/api/` — route handlers: `admin/*`, `ai-hint`, `ai-skills/{complete-module,issue-certificate}`, `update-grade`, `verify/[certificateId]`, `health`. **Every route except `verify` and `health` calls `requireUser()` / `requireAdmin()` from `src/lib/auth/require-user.ts` as its first statement; identity never comes from the request body.**
- `src/app/verify/[certificateId]/` — public, human-readable certificate verification page (rate-limited, id shape validated).
- Quiz persistence uses server actions in `src/app/(app)/topics/[slug]/practice/actions.ts` (`recordAnswer`, `completeQuiz`) — XP, hearts and streaks are decided server-side; the client never sends an XP amount.

### Demo mode is layered — every layer checks env independently

There is no single feature flag. Each layer degrades on its own:

| Layer | Condition | Behaviour |
|---|---|---|
| `src/middleware.ts` | Supabase env missing (dev only) | Passes every request through; `/api/admin/*` gets 401 JSON when a session is required |
| `(app)/layout.tsx` | Supabase env missing (dev only) | Returns a hard-coded `Demo Student` user |
| `(admin)/admin/layout.tsx` | `isDemoAuth()` only | Calls `requireAdmin()`; **fails closed** on any error (redirects to `/login`). `ADMIN_EMAIL` (case-insensitive) also grants admin |
| `src/lib/env.ts` | `NODE_ENV === 'production'` | `assertProductionEnv()` throws at boot (root layout + middleware) if Supabase env or `DATABASE_URL` is missing — demo mode is unreachable in production |
| `src/db/index.ts` | `DATABASE_URL` missing | Exports a Proxy that **throws** on any property access |
| `src/lib/supabase/api.ts` | Supabase env missing | `withSupabase()` returns the caller's `demoFallback` silently |
| `QuizEngine.tsx` | no `initialQuestions` | Falls back to in-file mock questions |

Consequence: you can run the UI with an empty `.env.local`, but anything touching `db` will throw unless the caller catches it (most `src/db/queries/*` do, returning `null`/empty). "Demo mode" means `isDemoMode` (no `DATABASE_URL`) and/or `isDemoAuth()` (no Supabase env AND not production).

### Two parallel data-access paths to the same Postgres

1. **Drizzle** (`@/db`, schema in `src/db/schema.ts`, queries in `src/db/queries/{users,topics,questions,progress,admin}.ts`) — used by pages, admin routes, `update-grade`, `weaknessDetector`. camelCase property names.
2. **Supabase service-role client** (`@/lib/supabase/api` → `getApiSupabase()` / `withSupabase()`) — used by `api/ai-hint`, `api/ai-skills/*`, certificate issuance/verification and `ai_usage_log`. Raw `snake_case` column names (`hint_count`, `is_premium`, `streak_count`).

RLS policies live in `supabase/migrations/0001_rls.sql` (applied with `npm run db:rls`); Postgres functions in `0002_functions.sql`. Tests only check these files structurally — they have not yet been run against a live database.

When editing a table, keep both in sync: the Drizzle schema and any `.from('table_name')` strings in the Supabase routes. `(app)/layout.tsx` also reads `users` directly via `@supabase/ssr` and maps snake_case → `UserData`.

### Auth & user data flow

Supabase SSR. Middleware protects `/dashboard`, `/subjects`, `/topics`, `/papers`, `/progress`, `/admin`, `/api/admin` and bounces logged-in users off `/login`/`/signup`. `(app)/layout.tsx` fetches the `users` row and passes it into `UserProvider`; client components read it with `useUser()` from `src/context/UserContext.tsx`. Admin status is `users.is_admin` (checked via `isUserAdmin` in `queries/admin.ts`).

### Adding a curriculum topic touches two places

Topic content is static TypeScript, not DB-driven:

1. Create `src/content/{maths|science}/grade{N}/<topic>.ts` exporting a `TopicContent` (types in `src/types/index.ts`). Use `src/content/maths/grade11/trigonometry.ts` as the reference shape.
2. Register the slug in **`src/content/registry.ts`** (`contentRegistry`; aliases like `'trigonometry'` → gr11 exist). The topic page, the subjects page and the practice header all derive from this one registry (`getTopicMeta`, `getTopicsForSubjectGrade`).
3. Add the slug to `topicsData` in `src/db/seed-topics.ts` so the `topics` table row exists for progress/questions.

Videos: each `{ type: 'video', videoId, videoIdAf? }` block plays inside the page via `NoteBlock.tsx`; 27 topics carry PROVISIONAL picks auto-filled by `scripts/fill-provisional-videos.ts` from `docs/client-updates/video-candidates/*.json` (marker comment in each file; `AF_OVERRIDES` in `scripts/lib/select-videos.ts` for curated exceptions). AI-skills modules live in `src/content/ai-skills/`; formula sheet in `src/content/formulas.ts`.

### AI hint route (`src/app/api/ai-hint/route.ts`)

- All Anthropic calls go through `src/lib/claude.ts` (`@anthropic-ai/sdk`): model from `ANTHROPIC_MODEL` (default `claude-sonnet-5`), static system prompt sent with `cache_control: ephemeral`, 30s timeout, errors mapped to `ClaudeError`. Prompts/schema live in `prompts.ts`; student text is wrapped in `<student_input>` with `<` escaped.
- Six modes via Zod-validated `mode`: `step_hint` (StepSolution), `wrong_answer` (QuestionCard), `camera_scan` (image, client-downscaled to 1280px, server 413 above 4,000,000 chars), `prompt_evaluation` (model JSON validated by `PromptEvaluationSchema`, attempt persisted idempotently per user+challenge), `general_question`, `cv_help`.
- Free-tier daily limits (`FREE_HINT_LIMIT = 5`, `FREE_CAMERA_LIMIT = 1`) in `ai_hint_usage`, day key = SAST (`todaySast()` in `src/lib/dates.ts`), increment via the `increment_hint_usage` RPC **after** a successful call; usage lookup fails closed (503). Premium status comes from the DB (`checkPremiumStatus`), never the body. Every successful call logs token counts to `ai_usage_log`. `export const maxDuration = 60`.

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
- `ANTHROPIC_API_KEY` — AI hints; absent = demo/mock responses
- `ANTHROPIC_MODEL` — model id for all AI calls (default `claude-sonnet-5`)
- `ADMIN_EMAIL` — grants admin to that Supabase user without `is_admin`

## Known gaps to be aware of

- `SUPABASE_SERVICE_ROLE_KEY` is only referenced in `src/lib/supabase/api.ts` — server routes silently fall back to the anon key when it is unset, so writes become subject to the RLS policies in `0001_rls.sql`.
- The RLS and functions migrations have never been run against a live Postgres; first real run is a pre-launch step (`DEPLOYMENT.md`).
- The free-tier AI quota is check-then-act (bounded by client concurrency) — documented accepted risk in `ai-hint/route.ts`.
- `next-pwa` is unmaintained (2022); `middleware.ts` → `proxy.ts` migration is pending (Next 16 deprecation warning). i18n strings exist for `en`/`af` but most pages still hard-code English (Phase 5).
- Progress: `docs/BUILD-PLAN.md` — Phases 0–4 merged; Phase 5 (i18n/a11y/password reset) and Phase 6 (real services) outstanding.
