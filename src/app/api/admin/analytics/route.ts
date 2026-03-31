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

// GET /api/admin/analytics - Get platform-wide analytics
export async function GET(req: NextRequest) {
  const admin = await verifySuperAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all relevant statistics
    const [
      totalUsers,
      totalDocuments,
      totalTemplates,
      totalPayments,
      successfulPayments,
      recentUsers,
      recentDocuments,
      usersByPlan,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.customTemplate.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'success' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, createdAt: true },
      }),
      prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          user: { select: { email: true } },
          createdAt: true,
        },
      }),
      prisma.profile.groupBy({
        by: ['planId'],
        _count: true,
      }),
    ])

    // Calculate revenue
    const revenueData = await prisma.payment.aggregate({
      where: { status: 'success' },
      _sum: { amount: true },
    })

    const usersByPlanMap = usersByPlan.reduce(
      (acc, item) => {
        acc[item.planId] = item._count
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      overview: {
        totalUsers,
        totalDocuments,
        totalTemplates,
        totalPayments,
        successfulPayments,
        totalRevenue: revenueData._sum.amount || 0,
      },
      usersByPlan: usersByPlanMap,
      recentActivity: {
        newUsers: recentUsers,
        newDocuments: recentDocuments,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
