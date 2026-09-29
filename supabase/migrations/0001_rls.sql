-- 0001_rls.sql — Row Level Security policies for Angelo Tutoring
--
-- STATUS: WIRED, NOT YET RUN. There is still no dev/prod Supabase project
-- as of Phase 1 (see docs/BUILD-PLAN.md §0 — "No RLS policies exist
-- anywhere in the repo"), so this file is still inert - but it is no
-- longer a "paste into the SQL editor and hope" step: `npm run db:rls`
-- (scripts/apply-sql.ts) applies it transactionally against DATABASE_URL,
-- and DEPLOYMENT.md documents it as a required release gate.
--
-- WHEN TO APPLY:
--   1. As part of Phase 6 ("Real services on our own dev accounts") once a
--      Supabase project exists: `npm run db:push` (or migrate), then
--      `npm run db:rls` — see DEPLOYMENT.md "Applying Row Level Security".
--   2. Before any production Supabase project goes live. Until this runs,
--      every table below is fully open to the anon/authenticated Postgres
--      roles — RLS enforcement is entirely absent, not merely permissive.
--   3. Re-run `npm run db:rls` (it is idempotent — see IF NOT EXISTS /
--      DROP POLICY IF EXISTS guards below) after any migration that
--      recreates one of these tables from scratch.
--
-- WHY THIS MATTERS EVEN THOUGH THE APP ALSO CHECKS AUTH IN CODE:
--   src/lib/auth/require-user.ts (Phase 1) makes every API route check the
--   session before it reads/writes. But most of those routes go through
--   src/lib/supabase/api.ts, which uses SUPABASE_SERVICE_ROLE_KEY when set
--   — and *silently falls back to the anon key when it isn't* (a known gap,
--   see CLAUDE.md "Known gaps to be aware of"). Service-role access always
--   bypasses RLS; anon-key access does not. RLS is the backstop for that
--   fallback, and for any direct client-side Supabase usage, not a
--   replacement for the application-level auth checks.
--
-- SCOPE NOTE: the build plan's task list only requires enabling RLS on the
-- five user-data tables (users, student_progress, ai_hint_usage,
-- prompt_challenge_attempts, ai_certificates). This migration also enables
-- RLS on the five read-only content tables (topics, questions,
-- question_options, steps, past_papers) with a permissive public-SELECT
-- policy, because "no RLS enabled" on a table is not the same as "publicly
-- readable, nothing else" — it also leaves INSERT/UPDATE/DELETE ungoverned
-- for any role with table grants. Enabling RLS with an explicit
-- read-only policy is strictly narrower than leaving RLS off.


-- =============================================================================
-- 1. users — each user can see and edit only their own row
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- signup/page.tsx inserts the public.users row itself, client-side, with
-- the anon key (createBrowserClient + supabase.auth.signUp(), then a plain
-- .from('users').insert(...) using the just-created session) - without this
-- policy that insert is silently blocked once RLS is enabled, breaking
-- signup. id must match the just-authenticated user, same as select/update.
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());


-- =============================================================================
-- 2. student_progress — own rows only, by user_id = auth.uid()
-- =============================================================================

-- One row per (user, question): saveProgress() in
-- src/db/queries/questions.ts depends on this to upsert-and-lock the row
-- (INSERT ... ON CONFLICT DO NOTHING, then SELECT ... FOR UPDATE within a
-- transaction) instead of two concurrent first-time answers to the same
-- question racing to insert duplicate rows and each awarding XP. Matches
-- the `uniqueIndex(...)` in src/db/schema.ts. Postgres has no
-- `ADD CONSTRAINT IF NOT EXISTS`, so this drops-then-adds (same
-- idempotency pattern as the DROP POLICY IF EXISTS guards below) to stay
-- safe to re-run.
ALTER TABLE student_progress
  DROP CONSTRAINT IF EXISTS student_progress_user_question_unique;
ALTER TABLE student_progress
  ADD CONSTRAINT student_progress_user_question_unique
  UNIQUE (user_id, question_id);

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_progress_select_own" ON student_progress;
CREATE POLICY "student_progress_select_own" ON student_progress
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "student_progress_insert_own" ON student_progress;
CREATE POLICY "student_progress_insert_own" ON student_progress
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "student_progress_update_own" ON student_progress;
CREATE POLICY "student_progress_update_own" ON student_progress
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- 3. ai_hint_usage — own rows only. NOTE: user_id is `text` here (it stores
--    a raw string, including 'demo-user'), not `uuid` like the other
--    tables, so auth.uid() (uuid) must be cast to text to compare.
-- =============================================================================

-- One usage row per (user, day): backs both a DB-level guarantee against
-- duplicate rows and the atomic increment_hint_usage() Postgres function
-- (supabase/migrations/0002_functions.sql) that api/ai-hint/route.ts
-- calls via supabase.rpc() to bump hint_count/camera_count - its
-- ON CONFLICT (user_id, usage_date) clause requires this constraint to
-- exist. Matches the `unique(...)` in src/db/schema.ts. Same
-- drop-then-add idempotency pattern as
-- prompt_challenge_attempts_user_challenge_unique above (Postgres has no
-- ADD CONSTRAINT IF NOT EXISTS).
ALTER TABLE ai_hint_usage
  DROP CONSTRAINT IF EXISTS ai_hint_usage_user_date_unique;
ALTER TABLE ai_hint_usage
  ADD CONSTRAINT ai_hint_usage_user_date_unique
  UNIQUE (user_id, usage_date);

ALTER TABLE ai_hint_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_hint_usage_select_own" ON ai_hint_usage;
CREATE POLICY "ai_hint_usage_select_own" ON ai_hint_usage
  FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "ai_hint_usage_insert_own" ON ai_hint_usage;
CREATE POLICY "ai_hint_usage_insert_own" ON ai_hint_usage
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "ai_hint_usage_update_own" ON ai_hint_usage;
CREATE POLICY "ai_hint_usage_update_own" ON ai_hint_usage
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);


-- =============================================================================
-- 4. prompt_challenge_attempts — own rows only, by user_id = auth.uid()
-- =============================================================================

-- One attempt row per (user, challenge): persistPromptChallengeAttempt() in
-- src/app/api/ai-hint/route.ts depends on this to stay idempotent - without
-- it, replaying the same challenge inserts a duplicate row and (before that
-- fix) awarded XP/badges every time. Matches the `unique(...)` in
-- src/db/schema.ts. Postgres has no `ADD CONSTRAINT IF NOT EXISTS`, so this
-- drops-then-adds (same idempotency pattern as the DROP POLICY IF EXISTS
-- guards below) to stay safe to re-run.
ALTER TABLE prompt_challenge_attempts
  DROP CONSTRAINT IF EXISTS prompt_challenge_attempts_user_challenge_unique;
ALTER TABLE prompt_challenge_attempts
  ADD CONSTRAINT prompt_challenge_attempts_user_challenge_unique
  UNIQUE (user_id, challenge_id);

ALTER TABLE prompt_challenge_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prompt_challenge_attempts_select_own" ON prompt_challenge_attempts;
CREATE POLICY "prompt_challenge_attempts_select_own" ON prompt_challenge_attempts
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "prompt_challenge_attempts_insert_own" ON prompt_challenge_attempts;
CREATE POLICY "prompt_challenge_attempts_insert_own" ON prompt_challenge_attempts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "prompt_challenge_attempts_update_own" ON prompt_challenge_attempts;
CREATE POLICY "prompt_challenge_attempts_update_own" ON prompt_challenge_attempts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- 5. ai_certificates — own row for select only. Issuance is server-side
--    (POST /api/ai-skills/issue-certificate, service role, bypasses RLS)
--    so there is deliberately no INSERT policy for any client role - see
--    "no client inserts" below. Anonymous verification
--    (/api/verify/[certificateId]) goes through the public_certificates
--    view, never the base table - see the REVOKE below.
-- =============================================================================

ALTER TABLE ai_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_certificates_select_own" ON ai_certificates;
CREATE POLICY "ai_certificates_select_own" ON ai_certificates
  FOR SELECT
  USING (user_id = auth.uid());

-- No client inserts: certificate issuance moved server-side
-- (POST /api/ai-skills/issue-certificate using the service-role client,
-- which bypasses RLS entirely). The previous "ai_certificates_insert_own"
-- policy let the certificate page insert a row directly from the user's
-- own anon-key session; that path is gone, so the policy is removed
-- rather than left dangling and unused. If it exists from a prior run of
-- this migration, drop it explicitly (no corresponding CREATE below).
DROP POLICY IF EXISTS "ai_certificates_insert_own" ON ai_certificates;

-- No UPDATE policy either. Issuance is server-side and service-role only,
-- and verification reads the public_certificates view, so no client flow
-- needs to write here. The previous policy granted a student full-row
-- UPDATE of their own certificate, which let them PATCH their own
-- avg_prompt_score, modules_completed or student_name before anyone
-- verified it - the one row in the database they have a motive to edit.
DROP POLICY IF EXISTS "ai_certificates_update_own" ON ai_certificates;

-- No more blanket public SELECT policy on the base table (previously
-- "ai_certificates_select_public", USING (true)) - that exposed every
-- column, including `id`/`user_id`, to anon via the RLS-anon-key-fallback
-- path. Anonymous verification now goes ONLY through the
-- public_certificates view below, which exposes just the columns a
-- verifier needs. Drop it explicitly so a prior run of this migration
-- doesn't leave it behind.
DROP POLICY IF EXISTS "ai_certificates_select_public" ON ai_certificates;

-- Revoke the default anon table-level grant on the base table: anon must
-- go through public_certificates (below), never ai_certificates directly.
-- `authenticated` keeps its default grant, narrowed to their own row by
-- ai_certificates_select_own above (used by the certificate page to read
-- back an already-issued certificate with the visitor's own session).
REVOKE SELECT ON ai_certificates FROM anon;

-- Column-restricted, anonymous-readable surface for verification: exposes
-- only what a verifier needs, never `id` or `user_id`.
--
-- security_invoker = false (the default - stated explicitly here so it's
-- not mistaken for an oversight): the view runs with the VIEW OWNER's
-- privileges, not the querying role's. Table owners are exempt from their
-- own table's RLS policies (unless the table has FORCE ROW LEVEL SECURITY,
-- which this migration does not set), so a view owned by the role that
-- ran this migration (typically the Supabase project's `postgres`/admin
-- role) can read every row of ai_certificates regardless of the querying
-- role - which is required here, since anon has no auth.uid() and would
-- otherwise match zero rows under ai_certificates_select_own. The SELECT
-- list is the only restriction anon gets: which columns, not which rows -
-- by design, since a certificate is meant to be verifiable by anyone who
-- has its id.
CREATE OR REPLACE VIEW public_certificates
  WITH (security_invoker = false) AS
SELECT
  certificate_id,
  student_name,
  issued_at,
  avg_prompt_score,
  modules_completed
FROM ai_certificates;

GRANT SELECT ON public_certificates TO anon, authenticated;


-- =============================================================================
-- 6. Read-only content tables — public SELECT, RLS enabled so nothing else
--    is implicitly allowed. Content is authored by admins through the
--    service-role-backed /api/admin/* routes, which bypass RLS.
-- =============================================================================

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "topics_select_public" ON topics;
CREATE POLICY "topics_select_public" ON topics
  FOR SELECT
  USING (true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- Only approved questions are public. getQuestionsByTopic already filters on
-- is_approved, but the policy did not, so a draft or rejected question was
-- readable straight off PostgREST with the anon key even though the app
-- would never serve it.
DROP POLICY IF EXISTS "questions_select_public" ON questions;
CREATE POLICY "questions_select_public" ON questions
  FOR SELECT
  USING (is_approved = true);

-- question_options and steps are the ANSWER KEY. question_options.is_correct
-- says which option is right; steps.correct_answer, .hint and .explanation
-- are the worked solution.
--
-- They previously carried "USING (true)" SELECT policies, the same treatment
-- as genuinely public content like topics and past_papers. But the anon key
-- ships in the client bundle by design, so that policy let anyone read the
-- whole answer key straight off PostgREST -
--   GET /rest/v1/question_options?select=*
-- - bypassing the quiz entirely. For a tutoring app the answer key is the
-- product.
--
-- Nothing legitimate needs client-side access: every real read goes through
-- server-side Drizzle, which connects as the table owner and is not subject
-- to RLS at all. So RLS stays on with NO policy (deny by default) and the
-- grants are revoked, the same pattern already used for ai_certificates.
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "question_options_select_public" ON question_options;
REVOKE ALL ON question_options FROM anon, authenticated;

ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "steps_select_public" ON steps;
REVOKE ALL ON steps FROM anon, authenticated;

ALTER TABLE past_papers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "past_papers_select_public" ON past_papers;
CREATE POLICY "past_papers_select_public" ON past_papers
  FOR SELECT
  USING (true);


-- =============================================================================
-- 7. notes — not in the build-plan task list, but shares the same
--    "public content, admin-written" shape as topics/questions above, so it
--    is included for consistency rather than left as the one table with no
--    RLS policy at all.
-- =============================================================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notes_select_public" ON notes;
CREATE POLICY "notes_select_public" ON notes
  FOR SELECT
  USING (true);


-- =============================================================================
-- 8. ai_usage_log — service-role only, NO policies (deliberately). Written
--    by src/lib/claude-usage-log.ts (via the service-role client, which
--    bypasses RLS) after every successful Anthropic call, for spend
--    visibility - see DEPLOYMENT.md "Monthly spend cap". This is an
--    internal spend/usage log, not a student-facing table like
--    ai_hint_usage, so unlike every other table in this migration it gets
--    no SELECT/INSERT/UPDATE/DELETE policy at all: enabling RLS with zero
--    policies denies every operation to the anon and authenticated roles
--    by default (Postgres RLS fails closed when no policy matches),
--    leaving only the service role - which bypasses RLS entirely - able
--    to read or write this table.
-- =============================================================================

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- 9. exam_attempts — own rows only, by user_id = auth.uid()
--
--    The exam game's answers (src/db/queries/exam.ts). Same shape as
--    student_progress: a student may read and write only their own rows,
--    and there is no DELETE policy — an attempt is a record of what
--    happened, and a student deleting their own blind spots would remove
--    the single most useful signal the app has about them. Rows go when
--    the user does, via ON DELETE CASCADE in schema.ts (POPIA).
-- =============================================================================

-- One row per (user, item): saveExamAttempt() in src/db/queries/exam.ts
-- depends on this to upsert-and-lock (INSERT ... ON CONFLICT DO NOTHING,
-- then SELECT ... FOR UPDATE within a transaction) instead of two
-- concurrent first attempts at the same question racing to insert
-- duplicate rows and each awarding XP. Matches the `uniqueIndex(...)` in
-- src/db/schema.ts. Postgres has no `ADD CONSTRAINT IF NOT EXISTS`, so
-- this drops-then-adds to stay safe to re-run.
ALTER TABLE exam_attempts
  DROP CONSTRAINT IF EXISTS exam_attempts_user_item_unique;
ALTER TABLE exam_attempts
  ADD CONSTRAINT exam_attempts_user_item_unique
  UNIQUE (user_id, item_id);

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_attempts_select_own" ON exam_attempts;
CREATE POLICY "exam_attempts_select_own" ON exam_attempts
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "exam_attempts_insert_own" ON exam_attempts;
CREATE POLICY "exam_attempts_insert_own" ON exam_attempts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "exam_attempts_update_own" ON exam_attempts;
CREATE POLICY "exam_attempts_update_own" ON exam_attempts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
