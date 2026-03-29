import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/templates/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const existing = await prisma.customTemplate.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.customTemplate.update({
    where: { id: params.id },
    data: {
      ...(body.name        !== undefined && { name:        body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category    !== undefined && { category:    body.category }),
      ...(body.icon        !== undefined && { icon:        body.icon }),
      ...(body.tags        !== undefined && { tags:        body.tags }),
      ...(body.blocks      !== undefined && { blocks:      body.blocks }),
      ...(body.docStyle    !== undefined && { docStyle:    body.docStyle }),
      ...(body.coverStyle  !== undefined && { coverStyle:  body.coverStyle }),
      ...(body.isPublic    !== undefined && { isPublic:    body.isPublic }),
    },
  })
  return NextResponse.json({ id: updated.id, isPublic: updated.isPublic, updatedAt: updated.updatedAt.toISOString() })
}

// DELETE /api/templates/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const existing = await prisma.customTemplate.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  await prisma.customTemplate.delete({ where: { id: params.id } })
  return NextResponse.json({ deleted: true })
}

// PATCH /api/templates/:id — incrémenter usageCount (public, sans auth)
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.customTemplate.update({
      where: { id: params.id },
      data:  { usageCount: { increment: 1 } },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}