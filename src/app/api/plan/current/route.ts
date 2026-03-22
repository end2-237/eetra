import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'

/**
 * GET /api/plan/current
 * Returns the authenticated user's current plan from the database.
 * This is the single source of truth — never trust client storage.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    // Unauthenticated: starter plan, no features
    return NextResponse.json({ planId: 'starter', verified: false }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const profile = await prisma.profile.findUnique({
    where:  { userId: session.user.id },
    select: { planId: true },
  })

  const planId = profile?.planId ?? 'starter'

  return NextResponse.json(
    { planId, verified: true, userId: session.user.id },
    { headers: { 'Cache-Control': 'no-store, private' } },
  )
}

/**
 * PUT /api/plan/current
 * Admin-only / post-payment: update plan in DB.
 * Called by the Monetbil webhook after successful payment.
 */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { planId } = await req.json()
  const VALID_PLANS = ['starter', 'pro', 'business']

  if (!VALID_PLANS.includes(planId)) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data:  { planId },
  })

  return NextResponse.json({ planId, updated: true })
}
