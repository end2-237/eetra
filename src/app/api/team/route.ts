import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const members = await prisma.teamMember.findMany({ where: { userId: session.user.id } })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { name, email, role, avatar } = await req.json()
  const member = await prisma.teamMember.create({
    data: { name, email, role, avatar: avatar ?? '👤', userId: session.user.id },
  })
  return NextResponse.json(member, { status: 201 })
}