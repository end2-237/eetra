import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const owned = await prisma.teamMember.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const { role } = await req.json()
  const updated = await prisma.teamMember.update({ where: { id: params.id }, data: { role } })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const owned = await prisma.teamMember.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await prisma.teamMember.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}