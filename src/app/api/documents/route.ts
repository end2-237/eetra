import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const doc = await prisma.document.create({
    data: { ...body, userId: session.user.id },
  })
  return NextResponse.json(doc, { status: 201 })
}
