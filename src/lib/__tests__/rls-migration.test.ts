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

/**
 * A row-ownership policy says which ROW may be written. It says nothing
 * about which COLUMNS or what values.
 *
 * `USING (id = auth.uid()) WITH CHECK (id = auth.uid())` on users therefore
 * let any student, holding only their own session and the public anon key,
 * go straight to PostgREST and bypass this application entirely:
 *
 *   PATCH /rest/v1/users?id=eq.<their own id>
 *   { "is_admin": true, "is_premium": true, "xp": 999999 }
 *
 * is_admin is a plain boolean column and requireAdmin() trusts it, so that
 * one request is full admin. The same shape on student_progress,
 * ai_hint_usage, prompt_challenge_attempts and exam_attempts let a student
 * write their own marks, XP and - the one that costs real money - reset
 * their daily AI quota.
 *
 * The app never writes any of these from the browser: every real write is
 * Drizzle over DATABASE_URL or the service-role client, both of which
 * bypass RLS. So the client simply gets no write access.
 */
describe('the client cannot write its own standing', () => {
  const WRITE_LOCKED = [
    'student_progress',
    'ai_hint_usage',
    'prompt_challenge_attempts',
    'exam_attempts',
  ]

  it('revokes client INSERT/UPDATE/DELETE on every user-data table', () => {
    for (const table of WRITE_LOCKED) {
      expect(sql, table).toMatch(
        new RegExp(`REVOKE INSERT, UPDATE, DELETE ON ${table} FROM anon, authenticated;`)
      )
    }
  })

  it('leaves no INSERT or UPDATE policy on those tables to grant it back', () => {
    for (const table of WRITE_LOCKED) {
      expect(sql, `${table} still has a write policy`).not.toMatch(
        new RegExp(`CREATE POLICY "${table}_(insert|update)_own"`)
      )
    }
  })

  it('still lets a student read their own rows', () => {
    for (const table of WRITE_LOCKED) {
      expect(sql, table).toMatch(new RegExp(`CREATE POLICY "${table}_select_own"`))
    }
  })

  it('revokes everything on users, then grants back only SELECT', () => {
    expect(sql).toMatch(/REVOKE ALL ON users FROM anon, authenticated;/)
    expect(sql).toMatch(/GRANT SELECT ON users TO authenticated;/)
  })

  it('gives the client no way to UPDATE its own users row', () => {
    expect(sql).not.toMatch(/CREATE POLICY "users_update_own"/)
    expect(sql).not.toMatch(/GRANT UPDATE[^;]*ON users/)
  })

  /**
   * Signup inserts the public.users row client-side, so INSERT cannot be
   * revoked outright - but it is granted COLUMN BY COLUMN, and every
   * column that confers standing is left out. They all have safe defaults
   * in schema.ts, so the app loses nothing.
   */
  it('grants signup only the identity columns', () => {
    const grant = sql.match(/GRANT INSERT \(([^)]*)\) ON users TO/)
    expect(grant, 'no column-level INSERT grant on users').not.toBeNull()

    const columns = grant![1].split(',').map((c) => c.trim())
    expect(columns.sort()).toEqual(['email', 'grade', 'id', 'name', 'school'])

    for (const forbidden of ['is_admin', 'is_premium', 'xp', 'hearts', 'streak_count', 'badges']) {
      expect(columns, `${forbidden} must not be client-insertable`).not.toContain(forbidden)
    }
  })

  it('never grants a blanket INSERT on users that would bypass the column list', () => {
    expect(sql).not.toMatch(/GRANT INSERT ON users/)
    expect(sql).not.toMatch(/GRANT ALL ON users/)
  })
})

/**
 * The column-level grant and the signup insert have to agree. If signup
 * sends a column the grant leaves out, Postgres rejects the WHOLE insert
 * on a permission error and every new account is created without its
 * public.users row - and signup swallows that error by design ("Don't
 * block signup if user row fails"), so it would fail silently in
 * production and only show up as students with no profile.
 */
describe('signup and the users grant agree', () => {
  const signup = readFileSync(
    join(__dirname, '..', '..', 'app', '(auth)', 'signup', 'page.tsx'),
    'utf-8'
  )

  function grantedColumns(): string[] {
    return sql
      .match(/GRANT INSERT \(([^)]*)\) ON users TO/)![1]
      .split(',')
      .map((c) => c.trim())
  }

  function insertedColumns(): string[] {
    const block = signup.match(/\.from\('users'\)\s*\.insert\(\{([\s\S]*?)\}\)/)
    expect(block, 'could not find the signup insert').not.toBeNull()
    return Array.from(block![1].matchAll(/^\s*([a-z_]+)\s*[:,]/gm)).map((m) => m[1])
  }

  it('sends only columns the migration grants', () => {
    const granted = grantedColumns()
    for (const column of insertedColumns()) {
      expect(granted, `signup sends "${column}" but the grant omits it`).toContain(column)
    }
  })

  it('does not set any column that confers standing', () => {
    const inserted = insertedColumns()
    for (const forbidden of ['xp', 'hearts', 'streak_count', 'is_premium', 'is_admin', 'badges']) {
      expect(inserted, `signup must leave "${forbidden}" to its column default`).not.toContain(
        forbidden
      )
    }
  })
})

/**
 * db:push creates the unique indexes declared in schema.ts. DROP
 * CONSTRAINT does not touch an index, so on the documented order -
 * db:push then db:rls - ADD CONSTRAINT collided with the index name and
 * the whole RLS migration aborted:
 *
 *   relation "student_progress_user_question_unique" already exists
 *
 * Found by ./scripts/deploy-rehearsal.sh, which runs the real chain
 * against a throwaway Postgres. Four constraints were affected.
 */
describe('the unique constraints survive db:push having already run', () => {
  const CONSTRAINTS = [
    'student_progress_user_question_unique',
    'ai_hint_usage_user_date_unique',
    'prompt_challenge_attempts_user_challenge_unique',
    'exam_attempts_user_item_unique',
  ]

  it.each(CONSTRAINTS)('drops the INDEX as well as the constraint: %s', (name) => {
    expect(sql, `${name}: no DROP INDEX`).toMatch(
      new RegExp(`DROP INDEX IF EXISTS ${name};`)
    )
  })

  it('drops the index before adding the constraint, not after', () => {
    for (const name of CONSTRAINTS) {
      const dropIndex = sql.indexOf(`DROP INDEX IF EXISTS ${name};`)
      const addConstraint = sql.indexOf(`ADD CONSTRAINT ${name}`)
      expect(dropIndex, name).toBeGreaterThan(-1)
      expect(addConstraint, name).toBeGreaterThan(-1)
      expect(dropIndex, `${name} drops the index after adding the constraint`).toBeLessThan(
        addConstraint
      )
    }
  })
})
