import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const owned = await prisma.customTemplate.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const body = await req.json()
  const { id, userId, createdAt, ...data } = body
  const updated = await prisma.customTemplate.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const owned = await prisma.customTemplate.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await prisma.customTemplate.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}