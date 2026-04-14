import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const templates = await prisma.customTemplate.findMany({
      where: { isPublic: true },
      include: { user: { select: { name: true } } },
      orderBy: { usageCount: 'desc' },
      take: 50,
    })

    return NextResponse.json(
      templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        icon: t.icon,
        tags: t.tags,
        blocks: Array.isArray(t.blocks)
          ? t.blocks
          : typeof t.blocks === 'string'
          ? JSON.parse(t.blocks as string)
          : [],
        docStyle: t.docStyle,
        coverStyle: t.coverStyle,
        isPublic: t.isPublic,
        usageCount: t.usageCount,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        author: t.user?.name || 'Communauté',
        authorAvatar: '👤',
        likes: 0,
      })),
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error'
    // Database can be temporarily unreachable in local/dev; return an empty list gracefully.
    console.warn('[GET /api/templates/community] fallback to empty list:', message)
    return NextResponse.json([], { status: 200 })
  }
}
