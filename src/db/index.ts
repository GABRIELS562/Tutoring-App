import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Check if database is configured
export const isDemoMode = !process.env.DATABASE_URL

let pool: Pool | null = null
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
