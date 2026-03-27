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

export async function GET() {
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

  const members = await prisma.teamMember.findMany({ where: { userId: session.user.id } })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
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

  const { name, email, role, avatar } = await req.json()
  const member = await prisma.teamMember.create({
    data: { name, email, role, avatar: avatar ?? '👤', userId: session.user.id },
  })
  return NextResponse.json(member, { status: 201 })
}
