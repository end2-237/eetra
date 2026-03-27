import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ── Helper: Check if user has Pro plan ─────────────────────────────────────
async function isPro(userId: string): Promise<boolean> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { planId: true },
  })
  return profile?.planId === 'pro' || profile?.planId === 'business'
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // ── Check Pro plan ─────────────────────────────────────────────────────────
  const proUser = await isPro(session.user.id)
  if (!proUser) {
    return NextResponse.json(
      { error: 'Accès réservé aux plans Pro et Business', code: 'PRO_ONLY' },
      { status: 403 }
    )
  }

  const owned = await prisma.teamMember.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const { role } = await req.json()
  const updated = await prisma.teamMember.update({ where: { id: params.id }, data: { role } })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // ── Check Pro plan ─────────────────────────────────────────────────────────
  const proUser = await isPro(session.user.id)
  if (!proUser) {
    return NextResponse.json(
      { error: 'Accès réservé aux plans Pro et Business', code: 'PRO_ONLY' },
      { status: 403 }
    )
  }

  const owned = await prisma.teamMember.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!owned) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await prisma.teamMember.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
