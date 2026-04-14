import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(profile ?? {})
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { id, userId, logoDataUrl, ...rest } = body

  // Whitelist fields that actually exist in Prisma Profile model.
  // UI still sends logoDataUrl, but DB column is logoUrl.
  const data = {
    ...(typeof rest.name === 'string' ? { name: rest.name } : {}),
    ...(typeof rest.sector === 'string' ? { sector: rest.sector } : {}),
    ...(typeof rest.legal === 'string' ? { legal: rest.legal } : {}),
    ...(typeof rest.color === 'string' ? { color: rest.color } : {}),
    ...(typeof rest.address === 'string' ? { address: rest.address } : {}),
    ...(typeof rest.city === 'string' ? { city: rest.city } : {}),
    ...(typeof rest.email === 'string' ? { email: rest.email } : {}),
    ...(typeof rest.web === 'string' ? { web: rest.web } : {}),
    ...(typeof rest.siret === 'string' ? { siret: rest.siret } : {}),
    ...(typeof rest.capital === 'string' ? { capital: rest.capital } : {}),
    ...(typeof rest.tagline === 'string' ? { tagline: rest.tagline } : {}),
    ...(typeof rest.signer === 'string' ? { signer: rest.signer } : {}),
    ...(typeof rest.planId === 'string' ? { planId: rest.planId } : {}),
    ...(typeof rest.watermark === 'boolean' ? { watermark: rest.watermark } : {}),
    ...(typeof rest.logoUrl === 'string' || rest.logoUrl === null ? { logoUrl: rest.logoUrl } : {}),
    ...(typeof logoDataUrl === 'string' || logoDataUrl === null ? { logoUrl: logoDataUrl } : {}),
  }

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  })
  return NextResponse.json(profile)
}