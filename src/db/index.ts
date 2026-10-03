import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Check if database is configured
export const isDemoMode = !process.env.DATABASE_URL

let pool: Pool | null = null
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
