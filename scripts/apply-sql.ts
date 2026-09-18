/**
 * Applies a raw .sql file to the database at DATABASE_URL, inside a
 * single transaction - if anything in the file fails, nothing commits.
 *
 * Exists specifically for supabase/migrations/0001_rls.sql: RLS policies
 * aren't something drizzle-kit generates or applies (`db:push` only
 * manages table shape), so there is no migration runner for this file
 * otherwise. Generic over any .sql file in case a future migration needs
 * the same treatment.
 *
 * Usage: npx tsx scripts/apply-sql.ts <path-to-sql-file>
 * npm script: npm run db:rls (applies supabase/migrations/0001_rls.sql)
 *
 * Requires DATABASE_URL (the direct, non-pooled connection - see
 * DEPLOYMENT.md) and refuses to run without it, since this always
 * targets a real database.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Pool } from 'pg'

export async function applySqlFile(sqlPath: string, databaseUrl: string): Promise<void> {
  const absolutePath = resolve(process.cwd(), sqlPath)
  const sql = readFileSync(absolutePath, 'utf-8')

  const pool = new Pool({ connectionString: databaseUrl })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log(`Applied ${sqlPath} successfully.`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(`Failed to apply ${sqlPath} - rolled back, no changes were made.`)
    console.error(error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

export async function main(): Promise<void> {
  const sqlPath = process.argv[2]

  if (!sqlPath) {
    console.error('Usage: tsx scripts/apply-sql.ts <path-to-sql-file>')
    process.exitCode = 1
    return
  }

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Refusing to run - this always targets a real database.')
    process.exitCode = 1
    return
  }

  await applySqlFile(sqlPath, databaseUrl)
}

// Only run when executed directly (`npx tsx scripts/apply-sql.ts ...`), not
// when imported by a test - importing must never touch a real database.
const isMainModule = process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  main()
}
