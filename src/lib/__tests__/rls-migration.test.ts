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
    expect(sql).toMatch(/NOT APPLIED YET/)
    expect(sql).toMatch(/WHEN TO APPLY/)
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

  it('adds a public SELECT policy on ai_certificates for anonymous verification', () => {
    expect(sql).toMatch(
      /CREATE POLICY "ai_certificates_select_public" ON ai_certificates[\s\S]*?USING \(true\)/
    )
  })

  it('defines a public_certificates view that excludes id and user_id', () => {
    const viewMatch = sql.match(/CREATE OR REPLACE VIEW public_certificates[\s\S]*?FROM ai_certificates;/)
    expect(viewMatch).toBeTruthy()
    const viewSql = viewMatch![0]
    expect(viewSql).not.toMatch(/\buser_id\b/)
    expect(viewSql).toMatch(/certificate_id/)
    expect(viewSql).toMatch(/student_name/)
  })

  it('adds public SELECT policies for every read-only content table', () => {
    for (const table of ['topics', 'questions', 'question_options', 'steps', 'past_papers', 'notes']) {
      expect(sql).toMatch(
        new RegExp(`CREATE POLICY "${table}_select_public" ON ${table}[\\s\\S]*?USING \\(true\\)`)
      )
    }
  })

  it('adds a UNIQUE (user_id, challenge_id) constraint on prompt_challenge_attempts, idempotently', () => {
    expect(sql).toMatch(
      /DROP CONSTRAINT IF EXISTS prompt_challenge_attempts_user_challenge_unique/
    )
    expect(sql).toMatch(
      /ADD CONSTRAINT prompt_challenge_attempts_user_challenge_unique\s+UNIQUE \(user_id, challenge_id\)/
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
