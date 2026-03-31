import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper pour vérifier si l'utilisateur est super admin
async function verifySuperAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isSuperAdmin) {
    return null
  }
  return session.user
}

// GET /api/admin/payments - Get all payments with analytics
export async function GET(req: NextRequest) {
  const admin = await verifySuperAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [payments, total, revenue] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { user: { select: { email: true, name: true, id: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where: { status: 'success' },
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      totalRevenue: revenue._sum.amount || 0,
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
