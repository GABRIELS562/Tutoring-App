import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// supabase/migrations/0001_rls.sql is not applied yet (no dev/prod
// Supabase project exists as of Phase 1 - see the file's own header
// comment), so it cannot be tested by actually running it against a
// database. This is a structural sanity check: it catches typos/omissions
// (a table left without RLS enabled, a policy accidentally removed)
// without needing Postgres.
const sql = readFileSync(
  join(__dirname, '..', '..', '..', 'supabase', 'migrations', '0001_rls.sql'),
  'utf-8'
)

function expectRlsEnabled(table: string) {
  expect(sql).toMatch(new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`))
}

function expectPolicy(table: string, using: string) {
  const escaped = using.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const policyBlock = new RegExp(`CREATE POLICY[^;]*ON ${table}[^;]*USING \\(${escaped}\\)`)
  expect(sql).toMatch(policyBlock)
}

describe('supabase/migrations/0001_rls.sql', () => {
  it('has a header explaining it is not applied yet and when to apply it', () => {
    expect(sql).toMatch(/NOT YET RUN/)
    expect(sql).toMatch(/WHEN TO APPLY/)
  })

  it('documents the db:rls npm script that applies this file transactionally', () => {
    expect(sql).toMatch(/npm run db:rls/)
  })

  it('enables RLS on every user-data table required by the build plan', () => {
    for (const table of [
      'users',
      'student_progress',
      'ai_hint_usage',
      'prompt_challenge_attempts',
      'ai_certificates',
    ]) {
      expectRlsEnabled(table)
    }
  })

  it('enables RLS on the public content tables too', () => {
    for (const table of ['topics', 'questions', 'question_options', 'steps', 'past_papers']) {
      expectRlsEnabled(table)
    }
  })

  it('scopes users/student_progress/prompt_challenge_attempts/ai_certificates to auth.uid()', () => {
    expectPolicy('users', 'id = auth.uid()')
    expectPolicy('student_progress', 'user_id = auth.uid()')
    expectPolicy('prompt_challenge_attempts', 'user_id = auth.uid()')
    expectPolicy('ai_certificates', 'user_id = auth.uid()')
  })

  it('casts auth.uid() to text for ai_hint_usage (a text, not uuid, user_id column)', () => {
    expectPolicy('ai_hint_usage', 'user_id = auth.uid()::text')
  })

  it('adds a users_insert_own policy so client-side signup can insert its own row', () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS "users_insert_own" ON users/)
    expectPolicy('users', 'id = auth.uid()')
    expect(sql).toMatch(
      /CREATE POLICY "users_insert_own" ON users[\s\S]*?FOR INSERT[\s\S]*?WITH CHECK \(id = auth\.uid\(\)\)/
    )
  })

  it('removes the blanket public SELECT policy on the ai_certificates base table', () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS "ai_certificates_select_public" ON ai_certificates/)
    // Explicitly must NOT define it again (no matching CREATE POLICY).
    expect(sql).not.toMatch(/CREATE POLICY "ai_certificates_select_public"/)
  })

  it('removes the ai_certificates_insert_own policy - issuance is server-side only', () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS "ai_certificates_insert_own" ON ai_certificates/)
    expect(sql).not.toMatch(/CREATE POLICY "ai_certificates_insert_own"/)
  })

  it('revokes anon SELECT on the ai_certificates base table', () => {
    expect(sql).toMatch(/REVOKE SELECT ON ai_certificates FROM anon/)
  })

  it('defines public_certificates as security_invoker = false, excluding id and user_id', () => {
    expect(sql).toMatch(/security_invoker = false/)
    const viewMatch = sql.match(/CREATE OR REPLACE VIEW public_certificates[\s\S]*?FROM ai_certificates;/)
    expect(viewMatch).toBeTruthy()
    const viewSql = viewMatch![0]
    expect(viewSql).not.toMatch(/\buser_id\b/)
    expect(viewSql).toMatch(/certificate_id/)
    expect(viewSql).toMatch(/student_name/)
  })

  it('grants anon SELECT on the public_certificates view', () => {
    expect(sql).toMatch(/GRANT SELECT ON public_certificates TO anon, authenticated/)
  })

  // question_options and steps are NOT in this list, and must not be. They
  // are the answer key - question_options.is_correct, steps.correct_answer -
  // and this test used to require them to be world-readable.
  it('adds public SELECT policies for the genuinely public content tables', () => {
    for (const table of ['topics', 'past_papers', 'notes']) {
      expect(sql).toMatch(
        new RegExp(`CREATE POLICY "${table}_select_public" ON ${table}[\\s\\S]*?USING \\(true\\)`)
      )
    }
  })

  it('exposes only approved questions publicly', () => {
    expect(sql).toMatch(
      /CREATE POLICY "questions_select_public" ON questions[\s\S]*?USING \(is_approved = true\)/
    )
  })

  // The anon key ships in the client bundle by design, so a table readable
  // by anon is readable by the internet. These two carry the answer key, and
  // nothing legitimate reads them from the client - the app reads them
  // server-side through Drizzle, which is not subject to RLS.
  it.each(['question_options', 'steps'])(
    'revokes %s from anon and authenticated instead of publishing it',
    (table) => {
      expect(sql).toMatch(new RegExp(`REVOKE ALL ON ${table} FROM anon, authenticated;`))
      expect(sql).not.toMatch(new RegExp(`CREATE POLICY "${table}_select_public"`))
    }
  )

  // Issuance is server-side and service-role only; verification reads the
  // public_certificates view. A student with UPDATE on their own row could
  // raise their own avg_prompt_score before an employer checked it.
  it('creates no UPDATE policy on ai_certificates', () => {
    expect(sql).not.toMatch(/CREATE POLICY "ai_certificates_update_own"/)
    expect(sql).toContain('DROP POLICY IF EXISTS "ai_certificates_update_own" ON ai_certificates;')
  })

  it('enables RLS on ai_usage_log with no policies at all (service-role only)', () => {
    expectRlsEnabled('ai_usage_log')
    expect(sql).not.toMatch(/CREATE POLICY "ai_usage_log_/)
  })

  it('adds a UNIQUE (user_id, usage_date) constraint on ai_hint_usage, idempotently', () => {
    expect(sql).toMatch(/DROP CONSTRAINT IF EXISTS ai_hint_usage_user_date_unique/)
    expect(sql).toMatch(
      /ADD CONSTRAINT ai_hint_usage_user_date_unique\s+UNIQUE \(user_id, usage_date\)/
    )
  })

  it('adds a UNIQUE (user_id, challenge_id) constraint on prompt_challenge_attempts, idempotently', () => {
    expect(sql).toMatch(
      /DROP CONSTRAINT IF EXISTS prompt_challenge_attempts_user_challenge_unique/
    )
    expect(sql).toMatch(
      /ADD CONSTRAINT prompt_challenge_attempts_user_challenge_unique\s+UNIQUE \(user_id, challenge_id\)/
    )
  })

  it('adds a UNIQUE (user_id, question_id) constraint on student_progress, idempotently', () => {
    expect(sql).toMatch(
      /DROP CONSTRAINT IF EXISTS student_progress_user_question_unique/
    )
    expect(sql).toMatch(
      /ADD CONSTRAINT student_progress_user_question_unique\s+UNIQUE \(user_id, question_id\)/
    )
  })

  it('every CREATE POLICY is preceded by a matching DROP POLICY IF EXISTS (idempotent re-runs)', () => {
    const policyNames = Array.from(sql.matchAll(/CREATE POLICY "([^"]+)"/g)).map((m) => m[1])
    expect(policyNames.length).toBeGreaterThan(0)
    for (const name of policyNames) {
      expect(sql).toMatch(new RegExp(`DROP POLICY IF EXISTS "${name}"`))
    }
  })
})
