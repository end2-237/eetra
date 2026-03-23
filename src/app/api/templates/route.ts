import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
 
// GET /api/templates — mes templates
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })
 
  try {
    const templates = await prisma.customTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    })
 
    return NextResponse.json(templates.map(t => ({
      id: t.id, name: t.name, description: t.description,
      category: t.category, icon: t.icon, tags: t.tags,
      blocks: t.blocks, docStyle: t.docStyle, coverStyle: t.coverStyle,
      isPublic: t.isPublic, usageCount: t.usageCount,
      createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
      author: session.user.name || 'Moi',
    })))
  } catch (err) {
    console.error('[GET /api/templates]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
 
// POST /api/templates — créer
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
 
  try {
    const body = await req.json()
    const template = await prisma.customTemplate.create({
      data: {
        userId:      session.user.id,
        name:        body.name        || 'Sans titre',
        description: body.description || '',
        category:    body.category    || '',
        icon:        body.icon        || '📊',
        tags:        body.tags        || [],
        blocks:      body.blocks      || [],
        docStyle:    body.docStyle    || {},
        coverStyle:  body.coverStyle  || {},
        isPublic:    body.isPublic    ?? false,
        usageCount:  0,
      },
    })
    return NextResponse.json({
      id: template.id, name: template.name, description: template.description,
      category: template.category, icon: template.icon, tags: template.tags,
      blocks: template.blocks, docStyle: template.docStyle, coverStyle: template.coverStyle,
      isPublic: template.isPublic, usageCount: template.usageCount,
      createdAt: template.createdAt.toISOString(), updatedAt: template.updatedAt.toISOString(),
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/templates]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
 