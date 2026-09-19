/**
 * Minimal in-memory, per-key rate limiter.
 *
 * BEST-EFFORT ONLY on serverless platforms (Vercel etc.): this Map lives
 * in the memory of a single running Node.js process/instance. A cold
 * start clears it, and concurrent instances each get their own Map, so
 * this does not enforce a single global limit - it only throttles
 * repeated requests that land on the same warm instance. That is enough
 * to blunt casual scripted abuse of a public endpoint (like
 * /api/verify/[certificateId]); it is not a substitute for a shared
 * store (e.g. Upstash Redis) if a hard guarantee is ever needed.
 */

const DEFAULT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const DEFAULT_MAX_REQUESTS = 30

// This Map has no TTL of its own - every distinct key (e.g. a client IP)
// gets an entry that only goes away when something removes it. Without a
// cap, a flood of requests from many distinct keys (or just normal growth
// over a long-running process) grows it forever. MAX_BUCKETS bounds that:
// a new key first sweeps out anything already expired (usually enough on
// its own), then, if still at capacity, evicts the oldest-inserted entry
// (Map preserves insertion order) so the store is self-bounding under load
// instead of failing open (allowing everyone through) or failing closed
// (blocking everyone) once full.
const MAX_BUCKETS = 1000

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function pruneIfAtCapacity(now: number): void {
  if (buckets.size < MAX_BUCKETS) {
    return
  }

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }

  while (buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value
    if (oldestKey === undefined) {
      break
    }
    buckets.delete(oldestKey)
  }
}

/**
 * Test-only: the number of buckets currently tracked, to verify
 * pruning/capping behaviour from outside without depending on other
 * internals. Not used by application code.
 */
export function _debugBucketCount(): number {
  return buckets.size
}

export interface RateLimitOptions {
  windowMs?: number
  max?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  key: string,
  { windowMs = DEFAULT_WINDOW_MS, max = DEFAULT_MAX_REQUESTS }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    // Only prune when this key is genuinely new to the Map - resetting an
    // existing (expired) entry in place doesn't grow buckets.size.
    if (!existing) {
      pruneIfAtCapacity(now)
    }
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt }
}

/**
 * The minimal shape getClientIp() needs - satisfied by both a
 * NextRequest's `.headers` (a standard Headers instance, in a route
 * handler) and next/headers's `headers()` result (a ReadonlyHeaders, in
 * a Server Component) - so the same function works in both surfaces
 * (e.g. api/verify/[certificateId]/route.ts and
 * app/verify/[certificateId]/page.tsx both rate-limit the same
 * "verify:<ip>" key).
 */
export interface HeaderGetter {
  get(name: string): string | null
}

/**
 * Best-effort client IP for rate-limit keying: the first entry of
 * X-Forwarded-For (set by Vercel/most proxies), falling back to a
 * constant so requests with no forwarded header still share one bucket
 * instead of bypassing the limit entirely.
 */
export function getClientIp(headersLike: HeaderGetter): string {
  const forwardedFor = headersLike.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return 'unknown'
}
