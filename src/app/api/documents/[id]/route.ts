import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwned(id: string, userId: string) {
  return prisma.document.findFirst({ where: { id, userId } })
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const doc = await getOwned(params.id, session.user.id)
  if (!doc) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(doc)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const owned = await getOwned(params.id, session.user.id)
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const body = await req.json()
  const { userId, id, createdAt, ...data } = body // strip immutable fields
  const updated = await prisma.document.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const owned = await getOwned(params.id, session.user.id)
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await prisma.document.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}