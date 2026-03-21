import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sanitizeField } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, company } = await req.json()

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (exists) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashed,
        name: sanitizeField(name),
        profile: {
          create: {
            name: sanitizeField(company || name || ''),
            planId: 'starter',
          },
        },
        // Créer un membre admin par défaut
        teamMembers: {
          create: {
            name: sanitizeField(name || email),
            email: email.toLowerCase(),
            role: 'admin',
            avatar: '👑',
          },
        },
      },
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}