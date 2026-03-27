import { NextResponse } from 'next/server'
import { getServerSession }      from 'next-auth'
import { authOptions }           from '@/lib/auth'
import { prisma }                from '@/lib/prisma'

export async function GET() {
  try {
    // Get user session to check plan
    const session = await getServerSession(authOptions)
    
    // If user is authenticated, check their plan
    let userPlan = 'starter'
    if (session?.user?.id) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { planId: true },
      })
      userPlan = profile?.planId ?? 'starter'
    }

    // Only pro and business users can access community templates
    const allowedPlans = ['pro', 'business']
    if (!allowedPlans.includes(userPlan)) {
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const templates = await prisma.customTemplate.findMany({
      where: { isPublic: true },
      include: { user: { select: { name: true } } },
      orderBy: { usageCount: 'desc' },
      take: 50,
    })

    return NextResponse.json(templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      icon: t.icon,
      tags: t.tags,
      // 🔧 Assurer que blocks est toujours un tableau
      blocks: Array.isArray(t.blocks) ? t.blocks : (typeof t.blocks === 'string' ? JSON.parse(t.blocks) : []),
      docStyle: t.docStyle,
      coverStyle: t.coverStyle,
      isPublic: t.isPublic,
      usageCount: t.usageCount,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      author: t.user?.name || 'Communauté',
      authorAvatar: '👤',
      likes: 0,
    })), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[GET /api/templates/community]', err)
    return NextResponse.json([], { status: 200 })
  }
}
