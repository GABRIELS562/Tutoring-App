-- 0001_rls.sql — Row Level Security policies for Angelo Tutoring
--
-- STATUS: NOT APPLIED YET. There is no dev/prod Supabase project wired up
-- as of Phase 1 (see docs/BUILD-PLAN.md §0 — "No RLS policies exist
-- anywhere in the repo"). This file is written now so it ships with the
-- security fixes it depends on, but it is inert until someone runs it.
--
-- WHEN TO APPLY:
--   1. As part of Phase 6 ("Real services on our own dev accounts") once a
--      Supabase project exists: `supabase db push` or paste this file into
--      the SQL editor, after `drizzle-kit push`/migrations have created the
--      tables below.
--   2. Before any production Supabase project goes live. Until this runs,
--      every table below is fully open to the anon/authenticated Postgres
--      roles — RLS enforcement is entirely absent, not merely permissive.
--   3. Re-run (it is idempotent — see IF NOT EXISTS / DROP POLICY IF EXISTS
--      guards below) after any migration that recreates one of these
--      tables from scratch.
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

-- Intentionally no public/insert policy: new rows are created by the
-- service role (e.g. on signup) or the (app)/layout.tsx fallback path,
-- both of which bypass RLS or run server-side with the service key.


-- =============================================================================
-- 2. student_progress — own rows only, by user_id = auth.uid()
-- =============================================================================

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
-- 5. ai_certificates — own rows for select/insert/update, PLUS a public
--    SELECT policy because /api/verify/[certificateId] must work for an
--    anonymous visitor scanning a certificate's QR code. A view is used to
--    keep the anonymously-readable surface to only the columns a verifier
--    needs (never `id`/`user_id`).
-- =============================================================================

ALTER TABLE ai_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_certificates_select_own" ON ai_certificates;
CREATE POLICY "ai_certificates_select_own" ON ai_certificates
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_certificates_insert_own" ON ai_certificates;
CREATE POLICY "ai_certificates_insert_own" ON ai_certificates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_certificates_update_own" ON ai_certificates;
CREATE POLICY "ai_certificates_update_own" ON ai_certificates
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Public, anonymous verification: anyone with a certificate_id (e.g. from
-- a QR code) can look it up. This is by design — that's what "verifiable
-- credential" means — but it is still scoped by a policy (not "RLS off")
-- and normally satisfied through the service-role client, which bypasses
-- RLS anyway. This policy exists for the anon-key-fallback path.
DROP POLICY IF EXISTS "ai_certificates_select_public" ON ai_certificates;
CREATE POLICY "ai_certificates_select_public" ON ai_certificates
  FOR SELECT
  USING (true);

-- Narrower surface for direct anon/authenticated Supabase client access:
-- exposes only what a verifier needs, never `id` or `user_id`.
CREATE OR REPLACE VIEW public_certificates
  WITH (security_invoker = true) AS
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
DROP POLICY IF EXISTS "questions_select_public" ON questions;
CREATE POLICY "questions_select_public" ON questions
  FOR SELECT
  USING (true);

ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "question_options_select_public" ON question_options;
CREATE POLICY "question_options_select_public" ON question_options
  FOR SELECT
  USING (true);

ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "steps_select_public" ON steps;
CREATE POLICY "steps_select_public" ON steps
  FOR SELECT
  USING (true);

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
