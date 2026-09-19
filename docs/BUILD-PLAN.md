# Angelo Tutoring — Build Plan (pre-client-reply work)

**Date:** 18 September 2026 · **Status (19 Sep):** Phases 0–5 merged to `develop` (388 tests, build clean). Phase 6 awaits a Supabase project + Anthropic key. · **Source:** five parallel specialist reviews of the codebase (security, data layer, frontend, AI/admin, infra) plus the 17 Sep status audit.
**Goal:** everything that can be built *without* a client decision, ordered so that each phase leaves the app safer and more real than the last. Estimates are developer-days; with agents running phases in parallel the wall-clock is roughly half.

---

## 0. What the deep dive found (headline)

| Area | Finding | Severity |
|---|---|---|
| Security | **Not one API route checks who is calling.** `update-grade`, `ai-skills/*` trust a `userId` in the request body; all four `api/admin/*` routes have no auth at all (middleware matches `/admin`, not `/api/admin`). Anyone with the URL can edit the curriculum or burn the Anthropic key. | CRITICAL |
| Security | Admin layout **fails open** — any error, or missing Supabase env in production, grants "Demo Admin". | CRITICAL |
| Security | `save-attempt` accepts `aiScore` from the client → free XP/badges. Certificate IDs are 4 chars from `Math.random()` (≈1M space), verify endpoint unthrottled. `next@16.2.2` has a CRITICAL advisory; fix is a minor bump. No RLS policies exist anywhere in the repo. | HIGH |
| Data | The quiz **never loads real questions** — `getQuestionsByTopic()` is complete but never called; the app runs on 5 hard-coded mock questions. `saveProgress`, `updateUserXP` (×3 duplicates), `addBadge` all written, never called. Hearts never decrement. Papers page ignores the DB. | HIGH |
| Frontend | All 27 stub topics **render a broken YouTube iframe** (placeholder IDs are truthy). Subjects page links to slugs that don't exist → "Topic Not Found". Afrikaans translations exist for 84 strings but only 1 of 72 components uses them. `userScalable:false` blocks pinch-zoom (WCAG). `isPremium` hard-coded `false`. "Download for offline" writes to IndexedDB that nothing reads. | HIGH |
| AI | Model `claude-sonnet-4-20250514` is deprecated; `generate-steps` uses `claude-3-haiku`. Daily limit uses UTC (resets 02:00 SAST), read-then-write race, quota consumed before the call, no unique constraint. Camera photos uploaded at full resolution (cost + Vercel 4.5 MB body cap). `step_hint` mode has no caller. Certificate shown to student even if the DB insert failed; verify QR lands on raw JSON. | HIGH |
| Infra | `tsc` clean; **lint fails (13 errors)** incl. `Date.now()` in render. No tests. Dockerfile has three separate breakages — delete it. 16 of 22 documented env vars are never read; `ADMIN_EMAIL` is read but undocumented. `next-pwa` unmaintained since 2022. No migrations directory (team has been `db:push`-ing). No health route, no error tracking, no `maxDuration` on the AI route. | MEDIUM |

---

## 1. Phases

Each phase ends with a **review gate**: `code-reviewer` on the diff, `security-reviewer` on anything touching auth/API, `tdd-guide` confirms tests exist for new behaviour. No phase is "done" until `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build` are green.

### Phase 0 — Safety net · ~1 day · agents: `cloud-infra-engineer`, `build-error-resolver`

Nothing else should land without this.

| # | Task | Size |
|---|---|---|
| 0.1 | `.github/workflows/ci.yml`: `npm ci` → lint → `tsc --noEmit` → `npm test` → `next build --webpack`. Required check on PRs to `master`. | S |
| 0.2 | Vitest + React Testing Library scaffold; `npm test` script; first test = middleware route matching (turns the `/api/admin` gap into a red test). | S |
| 0.3 | Fix the 13 ESLint errors (3× `module` rename, 4× unescaped entities, `Date.now()` out of render, 5× setState-in-effect). | S |
| 0.4 | Delete dead infra: `Dockerfile`, `.dockerignore`, `.gitlab-ci.yml`, `GITLAB_SETUP.md`, `PUSH_TO_GITLAB.sh`, `CI_CD_QUICK_REFERENCE.md`, `DEPLOYMENT_SUMMARY.md`; move `INFRASTRUCTURE.md` to `docs/archive/`. Replace with a 30-line `DEPLOYMENT.md` (Vercel + Supabase). | S |
| 0.5 | Trim `.env.example` to the 7 vars actually read (add `ADMIN_EMAIL` with a warning); move `shadcn` to devDeps; remove `resend` until used; add `db:seed-topics` script. | S |
| 0.6 | `npm audit fix` → `next@16.3.5` (minor). Re-audit. | S |

### Phase 1 — Close the security holes · ~2 days · agents: `security-reviewer` (write mode), `backend-engineer`, `typescript-reviewer` (review)

| # | Task | Size |
|---|---|---|
| 1.1 | `src/lib/auth/require-user.ts`: `requireUser(request)` and `requireAdmin(request)` using `@supabase/ssr` + `isUserAdmin`. Return 401/403 JSON. | S |
| 1.2 | Apply to **all nine** route handlers. Derive `userId` from the session; delete it from request schemas. Tests: unauthenticated → 401, wrong user → 403, admin routes → 403 for non-admin. | M |
| 1.3 | Admin layout: fail **closed** (`redirect('/login')` on error). Add a production guard: if `NODE_ENV==='production'` and Supabase env is missing, throw at boot instead of entering demo mode. | S |
| 1.4 | `save-attempt`: compute `aiScore` server-side (call the evaluator in the same request, or store the evaluation server-side keyed by attempt and verify). | M |
| 1.5 | Certificate IDs: `crypto.randomUUID()`-derived, ≥ 8 chars from a 32-symbol alphabet, collision retry; rate-limit `/api/verify/*` (simple in-memory token bucket per IP, upgrade later). | S |
| 1.6 | Write `supabase/migrations/0001_rls.sql`: enable RLS on `users`, `student_progress`, `ai_hint_usage`, `prompt_challenge_attempts`, `ai_certificates` with `user_id = auth.uid()` policies; public read on `topics`, `questions`, `question_options`, `steps`, `past_papers`, `ai_certificates` (by id). Applied in Phase 6. | S |
| 1.7 | Wrap student text in the AI prompts in delimiters and instruct the model to treat it as data (prompt-injection hardening). | S |

### Phase 2 — Make the core loop real · ~3 days · agents: `backend-engineer`, `frontend-dev`, `database-reviewer`, `tdd-guide`

| # | Task | Size |
|---|---|---|
| 2.1 | Practice page → server wrapper calls `getQuestionsByTopic(slug, difficulty)`; pass as `initialQuestions`. Mock questions only when the DB is absent. | M |
| 2.2 | Thread the real `user.id` through `PracticePage → QuizEngine → QuestionCard`; never `'demo-user'` when a session exists. | S |
| 2.3 | `handleAnswer` → `saveProgress()`; `handleNext` (complete) → **one** `updateUserXP()` (keep `queries/questions.ts`, delete the two duplicates). Streak logic lives there. | S |
| 2.4 | Hearts: `decrementHearts(userId)` on wrong answer, floor 0, "out of hearts" state in `QuizEngine`; daily refill in `updateUserXP`'s day-rollover branch. | M |
| 2.5 | Difficulty selector: `router.replace` / local state instead of `window.location.reload()`. | S |
| 2.6 | Delete the hand-maintained `topicMetadata` (practice) and fix `topicsData` slugs (subjects) — derive both from `contentRegistry`. Move `contentRegistry` to `src/content/registry.ts` so it has one home. | M |
| 2.7 | `seed-papers.ts` idempotent; Papers page becomes a server component reading `getAllPastPapers()`; the hard-coded list becomes the demo fallback only. | M |
| 2.8 | Dev fixture script `seed-dev-users.ts` (3 students with progress) so dashboard/leaderboard/weakness can be tested without signing up. | S |
| 2.9 | Tests: `updateUserXP` streak branches, `saveProgress` upsert, `decrementHearts` floor, weakness detector thresholds. | S |

### Phase 3 — Content plumbing · ~1.5 days · agents: `frontend-dev`, `general-purpose` (scripts)

| # | Task | Size |
|---|---|---|
| 3.1 | Remove the "Open in YouTube" link in `NoteBlock.tsx` and the orphaned message key. | S |
| 3.2 | **Provisional video fill:** script reads `docs/client-updates/video-candidates/{english,afrikaans}.json`, takes the top 2 embeddable English picks (+ top Afrikaans where present) per topic and rewrites each stub's single placeholder block into 2–3 real `video` blocks. Marked `// PROVISIONAL — client to confirm` so the client's picks can be swapped in with a one-line change. Fixes the broken-iframe bug today. | S |
| 3.3 | `scripts/check-videos.ts`: oEmbed check over every `videoId`/`videoIdAf` in `src/content`; exits non-zero on any blocked/removed video. Weekly GitHub Action. | S |
| 3.4 | Empty formula-box block on each stub topic with `// TODO curator` so the structure is ready for whoever writes formulas. | S |
| 3.5 | `isPremium` from `useUser()` in `TopicPageClient` (fixes the offline-download gate for real premium users). | S |

### Phase 4 — AI hardening · ~1.5 days · agents: `backend-engineer` (with the `claude-api` skill), `security-reviewer`

| # | Task | Size |
|---|---|---|
| 4.1 | `src/lib/claude.ts`: real implementation on `@anthropic-ai/sdk`; model from `ANTHROPIC_MODEL` env (default `claude-sonnet-5`); `generate-steps` uses the same helper. Prompt caching on the static system prompts. Retries/timeouts from the SDK. | M |
| 4.2 | `export const maxDuration = 60` on `ai-hint` and `generate-steps`. | S |
| 4.3 | Daily-limit fix: "today" in `Africa/Johannesburg`; unique constraint on `(user_id, usage_date)`; atomic `ON CONFLICT DO UPDATE ... hint_count = hint_count + 1`; increment **after** a successful model call. | M |
| 4.4 | `CameraScan.tsx`: canvas downscale to 1280 px long edge, JPEG q0.75, before base64. Server-side reject > 3 MB. | S |
| 4.5 | Certificate page: surface the insert failure (retry / error) instead of showing an unpersisted certificate. Human-readable `/verify/[id]` page wrapping the API. | M |
| 4.6 | Either wire `step_hint` into `StepSolution.tsx` ("Ask Angelo about this step") or delete the mode. Recommend wire — it's the most pedagogically useful mode and the UI hook is obvious. | S |
| 4.7 | Monthly spend cap set on the Anthropic account at provisioning; log `usage` tokens per call to a `ai_usage_log` table for the future admin usage view. | S |

### Phase 5 — i18n, accessibility, UX · ~3 days · agents: `frontend-dev`, `a11y-architect`, `react-reviewer`

| # | Task | Size |
|---|---|---|
| 5.1 | Wire `useTranslations`/`getTranslations` across Dashboard, Progress, Papers, Formulas, Subjects, Practice, TopicPageClient. Keys and Afrikaans copy already exist — this is mechanical. Add missing keys as found. | L |
| 5.2 | Remove `maximumScale:1, userScalable:false` from the root viewport. | S |
| 5.3 | Locked topics: `aria-disabled`, no fake `href="#"`, visible "Locked" text. `id`/`htmlFor` on the Papers filters. | S |
| 5.4 | Offline: either consume `getQuestionsForTopic`/`getAudio` in `QuizEngine`/`VoicePlayer` when `navigator.onLine === false`, or relabel the button "Save notes for offline" to match what the service worker actually does. Recommend the relabel for launch; full offline is a Phase 7 item. | S / M |
| 5.5 | Password reset flow (Supabase `resetPasswordForEmail` + `/reset-password` page). Not a client decision — no product ships without it. | M |

### Phase 6 — Real services on our own dev accounts · ~1 day · agents: `cloud-infra-engineer`, `database-reviewer`

This is the step that turns "built" into "tested". **It does not need the client** — a free-tier Supabase project and a Vercel Hobby preview on our own accounts are enough to exercise everything with real auth, a real database and RLS. Production accounts move to the client later (Q6).

| # | Task | Size |
|---|---|---|
| 6.1 | Dev Supabase project; `drizzle-kit generate` → commit `src/db/migrations/`; `db:migrate`; apply `0001_rls.sql`; run seeds in order (topics → questions → papers → dev users). | S |
| 6.2 | Use the pooled connection string (port 6543) for the app, direct string for migrations; set `pg.Pool max`. | S |
| 6.3 | Vercel preview from the GitHub repo with dev env vars; confirm `next build --webpack` runs on Vercel; confirm middleware + RLS + all nine routes behave with real sessions. | S |
| 6.4 | `/api/health` route (DB + Supabase ping); `@vercel/analytics`; Sentry free tier on client/server. | S |
| 6.5 | Playwright: login → redirect → dashboard; one full quiz → XP visible; one AI hint in demo mode. Run in CI against the preview. | M |

### Phase 7 — Ready-to-build-on-"yes" (blocked on client)

| Item | Blocked on | Ready design |
|---|---|---|
| Final video picks per topic | Q2 / Q11 | Swap IDs in the provisional blocks (minutes) |
| Content editor (video IDs + intro per topic) | Q4 | `topic_videos` override table + admin form; S/M, design in the AI/admin review |
| Admin users screen (premium/admin toggles, hint usage) | Q4 / Q27 | Mirrors Topics admin; M |
| Premium & PayFast | Q5 / Q21–23 | Nothing exists; M–L |
| Email (Resend) | Q33 | Welcome / reset / certificate; S once a sender domain exists |
| Question bank | Q3 / Q10 | Tooling exists (admin panel); content does not |
| Google sign-in, parental consent copy | Q26–28 | S each |
| Watched-video state → XP | Q16 | localStorage MVP is S; DB-backed is M |
| Full offline mode | Q8 | M–L |
| `next-pwa` → maintained fork | — | L; not blocking launch, schedule after |

---

## 2. Suggested execution order and parallelism

```
Day 1   Phase 0 (all)            ──┐
Day 1–2 Phase 1 (security)         ├─ these three can run in parallel on separate branches;
Day 1–3 Phase 3 (content plumbing) ┘  Phase 1 merges first.
Day 2–4 Phase 2 (core loop)        — after Phase 1 (needs requireUser for the write routes)
Day 3–4 Phase 4 (AI)               — parallel with Phase 2
Day 4–7 Phase 5 (i18n/a11y/UX)     — parallel with Phase 2/4, merges last
Day 5   Phase 6 (real services)    — as soon as Phases 1+2 are merged; everything re-tested here
```

Total ≈ **13 developer-days of work; ≈ 6–7 days wall-clock** with parallel agents and one human reviewing gates.

## 3. What this leaves the client with when they reply

A deployable preview on real infrastructure where: every route is authenticated, RLS is on, quizzes load real questions and save progress, XP/hearts/streaks move, every topic plays real curated videos in both languages where available, the AI tutor runs on a current model with a spend cap, the Afrikaans interface actually works, lint/tests/build are green on every PR, and errors are visible. Their answers then slot into Phase 7 rather than blocking everything.

## 4. Decisions I'd make on the client's behalf if they don't answer (state them, don't wait)

- English-first, Afrikaans where it exists (the provisional fill does this).
- Free-first launch; Premium plumbing stays dormant.
- Kevinmathscience as default English channel; Wiskunde_Mathematics_SUM as default Afrikaans.
- Sonnet 5 for the tutor; Haiku 4.5 as the switch if cost bites.
- Multiple-choice stays; written-answer is a Phase 8 conversation.
- "Download for offline" relabelled rather than fully built.
