import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }         from 'next-auth'
import { authOptions }              from '@/lib/auth'
import { prisma }                   from '@/lib/prisma'

/**
 * POST /api/push/subscribe — Save a push subscription for the current user.
 * DELETE /api/push/subscribe — Remove a push subscription by endpoint.
 */

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscription } = await req.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Upsert push subscription (stored as JSON in Notification table for simplicity)
    await prisma.notification.create({
      data: {
        userId:  user.id,
        type:    'PUSH_SUBSCRIPTION',
        message: JSON.stringify(subscription),
        read:    true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Push subscribe error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { endpoint } = await req.json()

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ ok: true })

    // Delete matching subscription record
    await prisma.notification.deleteMany({
      where: {
        userId:  user.id,
        type:    'PUSH_SUBSCRIPTION',
        message: { contains: endpoint },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
