import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// supabase/migrations/0002_functions.sql is not applied yet (same status
// as 0001_rls.sql - see that file's header and this one's), so this is a
// structural sanity check rather than a test against a real database.
const sql = readFileSync(
  join(__dirname, '..', '..', '..', 'supabase', 'migrations', '0002_functions.sql'),
  'utf-8'
)

describe('supabase/migrations/0002_functions.sql', () => {
  it('has a header explaining it is not applied yet and how to apply it', () => {
    expect(sql).toMatch(/NOT YET RUN/)
    expect(sql).toMatch(/npm run db:functions/)
  })

  it('defines increment_hint_usage(text, date, text) returning ai_hint_usage', () => {
    expect(sql).toMatch(
      /CREATE OR REPLACE FUNCTION increment_hint_usage\(\s*p_user_id text,\s*p_usage_date date,\s*p_field text\s*\)\s*RETURNS ai_hint_usage/
    )
  })

  it('validates p_field against an explicit allow-list before using it in dynamic SQL', () => {
    expect(sql).toMatch(/IF p_field NOT IN \('hint_count', 'camera_count'\) THEN/)
    expect(sql).toMatch(/RAISE EXCEPTION/)
  })

  it('upserts atomically with ON CONFLICT (user_id, usage_date) DO UPDATE ... + 1', () => {
    expect(sql).toMatch(/ON CONFLICT \(user_id, usage_date\)/)
    expect(sql).toMatch(/DO UPDATE SET %I = ai_hint_usage\.%I \+ 1/)
  })

  it('safely quotes the dynamic column name with format(%I, ...) rather than string concatenation', () => {
    expect(sql).toMatch(/format\(\s*'INSERT INTO ai_hint_usage[\s\S]*?%I[\s\S]*?',\s*p_field, p_field\s*\)/)
  })

  it('pins search_path to public, pg_temp (blocks search-path hijacking)', () => {
    expect(sql).toMatch(/SET search_path = public, pg_temp/)
  })

  it('is not SECURITY DEFINER - it runs as the calling role, subject to RLS', () => {
    // Checks the actual function-definition clause, not the file overall
    // - the header comment explains the *absence* of SECURITY DEFINER in
    // prose, which would otherwise make a bare substring search self-defeat.
    expect(sql).not.toMatch(/LANGUAGE plpgsql\s+SECURITY DEFINER/)
  })

  it('grants EXECUTE to anon and authenticated', () => {
    expect(sql).toMatch(
      /GRANT EXECUTE ON FUNCTION increment_hint_usage\(text, date, text\) TO anon, authenticated/
    )
  })
})
