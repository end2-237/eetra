import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }         from 'next-auth'
import { authOptions }              from '@/lib/auth'
import { prisma }                   from '@/lib/prisma'
import crypto                       from 'crypto'

/**
 * POST /api/profile/apikey — Generates (or rotates) an API key for the current user.
 * GET  /api/profile/apikey — Returns the current API key (masked).
 * DELETE /api/profile/apikey — Revokes the current API key.
 */

function generateApiKey(): string {
  const rand = crypto.randomBytes(24).toString('base64url')
  return `eetra_${rand}`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
  if (!user?.profile) return NextResponse.json({ key: null })

  const key = (user.profile as any).apiKey
  return NextResponse.json({
    key:    key ? `${key.slice(0, 10)}…${key.slice(-4)}` : null,
    masked: true,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const apiKey = generateApiKey()

  await prisma.profile.upsert({
    where:  { userId: user.id },
    update: { apiKey },
    create: { userId: user.id, apiKey },
  })

  return NextResponse.json({ key: apiKey, generated: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ ok: true })

  await prisma.profile.update({
    where: { userId: user.id },
    data:  { apiKey: null },
  })

  return NextResponse.json({ ok: true, revoked: true })
}
