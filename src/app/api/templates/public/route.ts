import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/templates/public
 * Returns all public custom templates (from all users).
 * No authentication required — these are community templates.
 */
export async function GET() {
  try {
    const templates = await prisma.customTemplate.findMany({
      where: { isPublic: true },
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: {
        user: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(templates, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    console.error('[public templates]', err)
    return NextResponse.json([], { status: 200 })
  }
}