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

/** The other half of the invariant below lives in the RLS migration. */
const rls = readFileSync(
  join(__dirname, '..', '..', '..', 'supabase', 'migrations', '0001_rls.sql'),
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

/**
 * The two migrations have to agree about who may write ai_hint_usage, and
 * for a while they did not.
 *
 * 0001_rls.sql REVOKEs INSERT, UPDATE, DELETE on ai_hint_usage from anon
 * and authenticated and creates exactly one policy, ai_hint_usage_select_own.
 * The names ai_hint_usage_insert_own and ai_hint_usage_update_own appear
 * only in DROP POLICY IF EXISTS lines - they are never created. But
 * 0002_functions.sql asserted in a comment that those policies "still
 * apply" and on that basis left increment_hint_usage as SECURITY INVOKER.
 *
 * So the function could not insert its own row when called by either role.
 * incrementUsageRecord() in api/ai-hint/route.ts logs that failure and
 * returns null, so nothing surfaced: the usage row was never written,
 * checkFreeTierLimit() kept reading "no usage yet", and FREE_HINT_LIMIT /
 * FREE_CAMERA_LIMIT never engaged. Unlimited AI spend with no symptom.
 *
 * Nothing executes this SQL in CI, so the only thing standing between that
 * and a repeat is this file.
 */
describe('increment_hint_usage can actually write the table it increments', () => {
  it('ai_hint_usage has INSERT/UPDATE revoked from anon and authenticated', () => {
    expect(rls).toMatch(
      /REVOKE INSERT, UPDATE, DELETE ON ai_hint_usage FROM anon, authenticated/
    )
  })

  it('and 0001_rls.sql creates NO write policy for it - only the SELECT one', () => {
    const created = [...rls.matchAll(/CREATE POLICY "([^"]+)" ON ai_hint_usage/g)].map(
      (m) => m[1]
    )

    expect(created).toEqual(['ai_hint_usage_select_own'])
  })

  /**
   * The load-bearing one. Given the two facts above, SECURITY INVOKER
   * cannot work - the table grant fails before RLS is consulted.
   */
  it('is therefore SECURITY DEFINER', () => {
    expect(sql).toMatch(/^SECURITY DEFINER$/m)
  })

  it('no longer claims to rely on policies that do not exist', () => {
    const claimsNonexistentPolicies =
      /ai_hint_usage_(insert|update)_own RLS\s+--?\s*policies[\s\S]{0,40}still\s+--?\s*apply/.test(sql)

    expect(claimsNonexistentPolicies).toBe(false)
  })

  /**
   * DEFINER means RLS no longer decides which row is touched, so the
   * function has to. Without this an authenticated student could pass
   * another student's id and burn their daily quota.
   */
  it('refuses to record usage against someone else\'s id', () => {
    expect(sql).toMatch(/auth\.uid\(\) IS NOT NULL AND p_user_id <> auth\.uid\(\)::text/)
    expect(sql).toMatch(/may only record usage for the calling user/)
  })

  it('still lets the service-role client through, which has a NULL auth.uid()', () => {
    // The guard is deliberately conditional on auth.uid() being non-NULL.
    expect(sql).toMatch(/IF auth\.uid\(\) IS NOT NULL AND/)
  })

  it('revokes the implicit EXECUTE grant to PUBLIC before granting to named roles', () => {
    const revokeAt = sql.indexOf('REVOKE EXECUTE ON FUNCTION increment_hint_usage')
    const grantAt = sql.indexOf('GRANT EXECUTE ON FUNCTION increment_hint_usage')

    expect(revokeAt).toBeGreaterThan(-1)
    expect(grantAt).toBeGreaterThan(-1)
    expect(revokeAt).toBeLessThan(grantAt)
  })
})
