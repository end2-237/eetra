import { NextRequest, NextResponse } from 'next/server'
import { prisma }                   from '@/lib/prisma'
import { rateLimit, getClientIp }   from '@/lib/ratelimit'

/**
 * GET /api/public/documents — Returns the public documents of a user/org
 * identified by their API key (X-EETRA-Key header).
 *
 * This is the start of the public API. Rate-limited to 100 req/hour per key.
 *
 * Planned extensions:
 * - GET /api/public/documents/:id — get single document
 * - POST /api/public/webhooks — register a webhook
 * - POST /api/public/documents — create document programmatically
 */

const PUBLIC_API_RATE_LIMIT = 100

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-eetra-key')

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing X-EETRA-Key header', docs: 'https://docs.eetra.app/api' },
      { status: 401 }
    )
  }

  // Rate limit by API key
  const ip  = getClientIp(req)
  const rl  = await rateLimit(`pubapi:${apiKey}`, PUBLIC_API_RATE_LIMIT, 3600)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retry_after: rl.reset },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(PUBLIC_API_RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(rl.reset),
        },
      }
    )
  }

  try {
    // Find user by API key (stored in Profile.apiKey)
    const profile = await prisma.profile.findFirst({
      where: { apiKey },
      include: {
        user: {
          select: {
            id:       true,
            name:     true,
            email:    true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Return last 20 documents
    const documents = await prisma.document.findMany({
      where:   { userId: profile.userId, deleted: false },
      orderBy: { updatedAt: 'desc' },
      take:    20,
      select: {
        id:          true,
        title:       true,
        pageCount:   true,
        blockCount:  true,
        createdAt:   true,
        updatedAt:   true,
      },
    })

    return NextResponse.json({
      ok:   true,
      user: { id: profile.user.id, name: profile.user.name },
      plan: profile.planId,
      data: documents,
      meta: {
        total:  documents.length,
        ratelimit: {
          limit:     PUBLIC_API_RATE_LIMIT,
          remaining: rl.remaining,
          reset:     rl.reset,
        },
      },
    }, {
      headers: {
        'X-RateLimit-Limit':     String(PUBLIC_API_RATE_LIMIT),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset':     String(rl.reset),
      },
    })

  } catch (err) {
    console.error('Public API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
