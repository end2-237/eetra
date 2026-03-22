/**
 * Rate limiting utility.
 * - Uses Upstash Redis in production (distributed, survives redeploys)
 * - Falls back to in-memory for local dev / when env vars are absent
 *
 * Setup (Vercel):
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=AXxx...
 */

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

// ─── Upstash REST helper ───────────────────────────────────────────────────────

async function upstashPipeline(commands: any[][]): Promise<any[] | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method:  'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ─── In-memory fallback ────────────────────────────────────────────────────────

const memMap = new Map<string, { count: number; resetAt: number }>()
let cleanupCounter = 0

function memRateLimit(key: string, limit: number, windowSec: number): { allowed: boolean; remaining: number; reset: number } {
  const now      = Date.now()
  const resetAt  = now + windowSec * 1000
  const entry    = memMap.get(key)

  if (!entry || now > entry.resetAt) {
    memMap.set(key, { count: 1, resetAt })
    // Periodic cleanup
    if (++cleanupCounter % 500 === 0) {
      memMap.forEach((v, k) => { if (now > v.resetAt) memMap.delete(k) })
    }
    return { allowed: true, remaining: limit - 1, reset: resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, reset: entry.resetAt }
}

// ─── Public API ────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed:   boolean
  remaining: number
  reset:     number   // unix ms
  source:    'redis' | 'memory'
}

/**
 * Sliding-window rate limiter.
 * @param key        Unique identifier (e.g. IP address or user ID)
 * @param limit      Max requests per window
 * @param windowSec  Window size in seconds
 */
export async function rateLimit(
  key:       string,
  limit:     number = 20,
  windowSec: number = 3600,
): Promise<RateLimitResult> {
  // Try Redis first
  const redisKey = `rl:${key}`
  const nowSec   = Math.floor(Date.now() / 1000)
  const resetSec = nowSec + windowSec

  const pipeline = await upstashPipeline([
    ['INCR', redisKey],
    ['EXPIREAT', redisKey, resetSec],
    ['TTL', redisKey],
  ])

  if (pipeline) {
    const count     = pipeline[0]?.result as number ?? 1
    const ttlSec    = pipeline[2]?.result as number ?? windowSec
    const remaining = Math.max(0, limit - count)
    const reset     = (Date.now() + ttlSec * 1000)

    return {
      allowed:   count <= limit,
      remaining,
      reset,
      source: 'redis',
    }
  }

  // Memory fallback
  const result = memRateLimit(key, limit, windowSec)
  return { ...result, source: 'memory' }
}

/**
 * Extract IP from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = (req as any).headers?.get?.('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = (req as any).headers?.get?.('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}
