import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Check if database is configured
export const isDemoMode = !process.env.DATABASE_URL

let pool: Pool | null = null
if (process.env.DATABASE_URL) {
  // A transaction-mode pooler (Supabase, port 6543) already multiplexes
  // many clients onto few Postgres backends - that is its whole job - so
  // this Pool only needs enough connections to serve one instance's
  // concurrent work. Left unset, node-postgres defaults to 10 PER POOL,
  // and because this module is a singleton per warm serverless instance,
  // total connections grow as (instances x 10). That exhausts the plan's
  // client limit under exactly the traffic you want to survive, and it
  // cannot show up in local development where there is only one process.
  //
  // DB_POOL_MAX is an escape hatch for a long-lived server (a VPS rather
  // than serverless), where a larger pool is appropriate.
  const poolMax = Number(process.env.DB_POOL_MAX ?? '') || 3

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMax,
    // Release idle clients promptly rather than holding them for the
    // default lifetime, so a burst does not keep connections reserved
    // long after it has passed.
    idleTimeoutMillis: 10_000,
    // Fail a connection attempt rather than hanging a request forever when
    // the pooler is saturated.
    connectionTimeoutMillis: 10_000,
    // Supabase requires TLS on both the pooled (6543) and direct (5432)
    // endpoints. A connection string copied from the dashboard without
    // `?sslmode=require` would otherwise fail to connect on the very first
    // real db:push, so the option is set here rather than left to whoever
    // pastes the URL. rejectUnauthorized is false because Supabase's
    // pooler presents a certificate node-postgres will not chain to a
    // system root; the transport is still encrypted.
    ssl: process.env.DATABASE_URL.includes('localhost') ||
         process.env.DATABASE_URL.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
  })

  // Without this listener an idle-client error is an UNHANDLED error event,
  // which takes the process down. Against a pgbouncer-style pooler that
  // recycles connections underneath us, that is routine traffic, not an
  // edge case.
  pool.on('error', (error) => {
    console.error('Postgres pool error (idle client):', error)
  })
}

// Create a mock db object for demo mode that throws helpful errors
const mockDb = new Proxy({} as ReturnType<typeof drizzle>, {
  get() {
    throw new Error('Database not configured. Set DATABASE_URL in .env.local')
  },
})

export const db = pool ? drizzle(pool, { schema }) : mockDb

export * from './schema'
