import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PLAN_SECRET = process.env.PLAN_SECRET || 'eetra-dev-secret-change-in-production'
const VALID_PLANS = ['starter', 'pro', 'business']
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function signToken(plan: string, iat: number, exp: number): string {
  const payload = `${plan}.${iat}.${exp}`
  return crypto.createHmac('sha256', PLAN_SECRET).update(payload).digest('hex')
}

function verifyToken(plan: string, iat: number, exp: number, sig: string): boolean {
  const expected = signToken(plan, iat, exp)
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(sig, 'hex')
    )
  } catch {
    return false
  }
}

// POST /api/plan/token — issue a signed token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { plan } = body

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const iat = Date.now()
    const exp = iat + TOKEN_TTL_MS
    const sig = signToken(plan, iat, exp)

    const token = { plan, iat, exp, sig }

    return NextResponse.json({ token }, {
      headers: {
        // Prevent caching of tokens
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT /api/plan/token — verify an existing token
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token || !token.plan || !token.iat || !token.exp || !token.sig) {
      return NextResponse.json({ valid: false })
    }

    // Check expiry
    if (Date.now() > token.exp) {
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    // Check plan is valid
    if (!VALID_PLANS.includes(token.plan)) {
      return NextResponse.json({ valid: false, reason: 'invalid_plan' })
    }

    // Verify signature
    const valid = verifyToken(token.plan, token.iat, token.exp, token.sig)

    return NextResponse.json({ valid }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
