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

// GET /api/admin/documents - Get document statistics
export async function GET(req: NextRequest) {
  const admin = await verifySuperAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      totalDocuments,
      documentsThisMonth,
      documentsThisWeek,
      avgDocsPerUser,
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.document.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.document.aggregate({
        _count: true,
      }),
    ])

    const userCount = await prisma.user.count()
    const avgDocs = userCount > 0 ? totalDocuments / userCount : 0

    return NextResponse.json({
      totalDocuments,
      documentsThisMonth,
      documentsThisWeek,
      avgDocsPerUser: Math.round(avgDocs * 100) / 100,
    })
  } catch (error) {
    console.error('Error fetching document statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document statistics' },
      { status: 500 }
    )
  }
}
