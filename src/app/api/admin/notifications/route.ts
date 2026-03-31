import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper pour vérifier si l'utilisateur est super admin
async function verifySuperAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isSuperAdmin) {
    return null
  }
  return session.user
}

// POST /api/admin/notifications - Send broadcast notification
export async function POST(req: NextRequest) {
  const admin = await verifySuperAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, message, type = 'info' } = await req.json()

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    // Create notification for each user
    const notifications = await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type,
        title,
        message,
      })),
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'BROADCAST_NOTIFICATION',
        resourceType: 'NOTIFICATION',
        resourceId: 'broadcast',
        details: { title, messageLength: message.length, userCount: users.length },
      },
    })

    return NextResponse.json({
      message: `Notification sent to ${users.length} users`,
      count: notifications.count,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
