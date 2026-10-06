-- 0002_functions.sql — atomic usage-increment function for Angelo Tutoring
--
-- STATUS: WIRED, NOT YET RUN — same status as 0001_rls.sql (see its own
-- header): there is still no dev/prod Supabase project as of Phase 4.
-- Apply with `npm run db:functions` (scripts/apply-sql.ts), after
-- 0001_rls.sql (this migration's UNIQUE ... ON CONFLICT depends on the
-- ai_hint_usage_user_date_unique constraint that 0001_rls.sql adds).
--
-- WHY THIS EXISTS: src/app/api/ai-hint/route.ts enforces a free-tier
-- daily hint/camera-scan limit backed by ai_hint_usage(user_id,
-- usage_date, hint_count, camera_count). A plain "read the row, then
-- insert-or-update with count + 1" from application code (the previous
-- implementation) is a read-then-write race: two concurrent requests
-- from the same student can both read hint_count = 4, both decide
-- they're under the FREE_HINT_LIMIT = 5 gate, and both increment to 5 -
-- silently granting a 6th hint. A single atomic SQL statement
-- (INSERT ... ON CONFLICT ... DO UPDATE SET hint_count = hint_count + 1)
-- closes that race by making the increment itself, not just the
-- surrounding request, a single indivisible operation - but Supabase's
-- PostgREST-based client has no way to send raw "column = column + 1"
-- SQL through .insert()/.update(), so that atomic statement has to live
-- in the database as a function the client calls through supabase.rpc().
--
-- The target column name (hint_count vs camera_count) is chosen by
-- p_field. It cannot be interpolated into a parameterized query the
-- normal way (Postgres parameters bind values, not identifiers), so this
-- function validates p_field against an explicit allow-list before using
-- format(%I, ...) to safely quote it as an identifier in dynamic SQL -
-- never accepting arbitrary column names.

CREATE OR REPLACE FUNCTION increment_hint_usage(
  p_user_id text,
  p_usage_date date,
  p_field text
)
RETURNS ai_hint_usage
LANGUAGE plpgsql
-- Pins the name-resolution search_path for the duration of the function,
-- independent of whatever search_path the calling role/session has set.
-- Without this, a role that can create objects in a schema earlier in
-- its own search_path (e.g. a "public"-like writable schema ahead of
-- the real public) could shadow `ai_hint_usage` or `format`/`now` with
-- a same-named object of its own, and this function would silently
-- operate on the attacker's object instead of the real one. That matters
-- more now the function is SECURITY DEFINER (see below). pg_temp stays
-- last so
-- session-local temp objects are still resolvable, matching Postgres's
-- own hardening guidance for functions.
SET search_path = public, pg_temp
-- SECURITY DEFINER, because 0001_rls.sql deliberately REVOKEs INSERT,
-- UPDATE, DELETE on ai_hint_usage from anon and authenticated and creates
-- no write policy for them - only ai_hint_usage_select_own. A
-- SECURITY INVOKER function therefore cannot perform its own INSERT when
-- called by either role: the table-level grant fails before RLS is even
-- consulted. This is exactly the "one narrow, validated write that the
-- normal grants should otherwise block" case DEFINER exists for, and the
-- allow-listed p_field plus the pinned search_path above are what make it
-- safe to run with the owner's rights.
SECURITY DEFINER
AS $$
DECLARE
  v_hint_count integer := 0;
  v_camera_count integer := 0;
  v_result ai_hint_usage;
BEGIN
  IF p_field NOT IN ('hint_count', 'camera_count') THEN
    RAISE EXCEPTION 'increment_hint_usage: invalid field %', p_field;
  END IF;

  -- Running as the owner means RLS no longer constrains which row is
  -- touched, so the row has to be checked here. A signed-in caller may
  -- only record against their own id; without this an authenticated
  -- student could burn another student's daily AI quota by passing their
  -- id. auth.uid() is NULL for the service-role client the API routes
  -- actually use, which is why that case is allowed through - those
  -- routes already derive the id from requireUser(), never the body.
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid()::text THEN
    RAISE EXCEPTION
      'increment_hint_usage: may only record usage for the calling user';
  END IF;

  IF p_field = 'hint_count' THEN
    v_hint_count := 1;
  ELSE
    v_camera_count := 1;
  END IF;

  EXECUTE format(
    'INSERT INTO ai_hint_usage (user_id, usage_date, hint_count, camera_count, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id, usage_date)
     DO UPDATE SET %I = ai_hint_usage.%I + 1, updated_at = now()
     RETURNING *',
    p_field, p_field
  )
  INTO v_result
  USING p_user_id, p_usage_date, v_hint_count, v_camera_count;

  RETURN v_result;
END;
$$;

-- Called from src/lib/supabase/api.ts's getApiSupabase() client, which
-- falls back to the anon key when SUPABASE_SERVICE_ROLE_KEY is unset
-- (see CLAUDE.md "Known gaps to be aware of"), so EXECUTE is granted to
-- both roles for that path.
--
-- An earlier version of this comment claimed the function relied on
-- "ai_hint_usage's own ai_hint_usage_insert_own/_update_own RLS
-- policies". Those policies do not exist: 0001_rls.sql names them only in
-- DROP POLICY IF EXISTS statements and never creates them. A SECURITY
-- INVOKER function called with the anon key therefore failed with
-- "permission denied for table ai_hint_usage", and because
-- incrementUsageRecord() in api/ai-hint/route.ts logs that failure and
-- returns null, the row was never written - so checkFreeTierLimit() read
-- "no usage yet" forever and FREE_HINT_LIMIT/FREE_CAMERA_LIMIT never
-- engaged. Unlimited AI spend, no visible symptom. Hence DEFINER above.
--
-- EXECUTE is revoked from PUBLIC first: CREATE FUNCTION grants it to
-- PUBLIC implicitly, and a DEFINER function should only be callable by
-- the roles named here.
REVOKE EXECUTE ON FUNCTION increment_hint_usage(text, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_hint_usage(text, date, text) TO anon, authenticated;
