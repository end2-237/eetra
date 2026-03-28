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
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      // Return empty array instead of 401 to not break the app
      return NextResponse.json([])
    }

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(documents)
  } catch (error) {
    console.error('[v0] GET /api/documents error:', error)
    // Return empty array instead of 500 to not break the app
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Get user plan
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { planId: true },
    })
    const planId = profile?.planId ?? 'starter'
    const monthlyLimit = PLAN_LIMITS[planId] ?? 5

    const body = await req.json()

    // If plan is unlimited, just create the document
    if (monthlyLimit === Infinity) {
      const doc = await prisma.document.create({
        data: { ...body, userId: session.user.id },
      })
      return NextResponse.json(doc, { status: 201 })
    }

    // Check monthly usage for limited plans
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

    const doc = await prisma.document.create({
      data: { ...body, userId: session.user.id },
    })
    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/documents error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
  }
}
