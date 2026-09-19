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
-- a same-named object of its own, and this SECURITY-INVOKER function
-- (see the "not SECURITY DEFINER" note below) would silently operate on
-- the attacker's object instead of the real one. pg_temp stays last so
-- session-local temp objects are still resolvable, matching Postgres's
-- own hardening guidance for functions.
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hint_count integer := 0;
  v_camera_count integer := 0;
  v_result ai_hint_usage;
BEGIN
  IF p_field NOT IN ('hint_count', 'camera_count') THEN
    RAISE EXCEPTION 'increment_hint_usage: invalid field %', p_field;
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
-- (see CLAUDE.md "Known gaps to be aware of") - grant EXECUTE to both
-- roles so that fallback path still works. SECURITY DEFINER is
-- deliberately NOT set: the function runs as the calling role, same as
-- every other write path in this app, and ai_hint_usage's own
-- ai_hint_usage_insert_own/_update_own RLS policies (0001_rls.sql) still
-- apply to the INSERT/UPDATE this function performs.
GRANT EXECUTE ON FUNCTION increment_hint_usage(text, date, text) TO anon, authenticated;
