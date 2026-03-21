import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const exports = await prisma.export.findMany({
    where: { userId: session.user.id },
    orderBy: { exportedAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(exports)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const entry = await prisma.export.create({
    data: { ...body, userId: session.user.id },
  })
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await req.json()
  const owned = await prisma.export.findFirst({ where: { id, userId: session.user.id } })
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await prisma.export.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}