import { NextResponse } from 'next/server'
import { prisma }        from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.customTemplate.findMany({
      where:   { isPublic: true },
      include: { user: { select: { name: true } } },
      orderBy: { usageCount: 'desc' },
      take:    50,
    })

    return NextResponse.json(templates.map(t => ({
      id:          t.id,
      name:        t.name,
      description: t.description,
      category:    t.category,
      icon:        t.icon,
      tags:        t.tags,
      blocks:      t.blocks,
      docStyle:    t.docStyle,
      coverStyle:  t.coverStyle,
      isPublic:    t.isPublic,
      usageCount:  t.usageCount,
      createdAt:   t.createdAt.toISOString(),
      updatedAt:   t.updatedAt.toISOString(),
      author:      t.user?.name || 'Communauté',
      authorAvatar:'👤',
      likes:       0,
    })), {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch (err) {
    console.error('[GET /api/templates/community]', err)
    return NextResponse.json([], { status: 200 })
  }
}