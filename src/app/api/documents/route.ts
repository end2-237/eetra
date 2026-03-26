import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const document = await prisma.document.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })
  
  // Retourner un tableau avec un seul document ou vide
  return NextResponse.json(document ? [document] : [])
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  
  // Chercher le document existant de cet utilisateur
  const existing = await prisma.document.findFirst({
    where: { userId: session.user.id },
  })
  
  // Si un document existe, le supprimer et en créer un nouveau
  if (existing) {
    await prisma.document.delete({ where: { id: existing.id } })
  }
  
  const doc = await prisma.document.create({
    data: { ...body, userId: session.user.id },
  })
  return NextResponse.json(doc, { status: 201 })
}
