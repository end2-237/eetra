import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  starter: 5,
  pro: Infinity,
  business: Infinity,
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // ── Get user plan ──────────────────────────────────────────────────────────
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { planId: true },
  })
  const planId = profile?.planId ?? 'starter'
  const monthlyLimit = PLAN_LIMITS[planId] ?? 5

  // ── If plan is unlimited, just create the document ──────────────────────────
  if (monthlyLimit === Infinity) {
    const body = await req.json()
    const doc = await prisma.document.create({
      data: { ...body, userId: session.user.id },
    })
    return NextResponse.json(doc, { status: 201 })
  }

  // ── Check monthly usage for limited plans ──────────────────────────────────
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const docsThisMonth = await prisma.document.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: monthStart },
    },
  })

  if (docsThisMonth >= monthlyLimit) {
    return NextResponse.json(
      {
        error: `Limite de ${monthlyLimit} documents par mois atteinte pour le plan ${planId}`,
        code: 'LIMIT_REACHED',
        remaining: 0,
      },
      { status: 403 }
    )
  }

  const body = await req.json()
  const doc = await prisma.document.create({
    data: { ...body, userId: session.user.id },
  })
  return NextResponse.json(doc, { status: 201 })
}
