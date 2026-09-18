import type { NextRequest } from 'next/server'

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

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

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
 * Best-effort client IP for rate-limit keying: the first entry of
 * X-Forwarded-For (set by Vercel/most proxies), falling back to a
 * constant so requests with no forwarded header still share one bucket
 * instead of bypassing the limit entirely.
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return 'unknown'
}
