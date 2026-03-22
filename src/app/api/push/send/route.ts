import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }         from 'next-auth'
import { authOptions }              from '@/lib/auth'
import { prisma }                   from '@/lib/prisma'

/**
 * POST /api/push/send — Send a Web Push notification to all subscriptions
 * of the current user (test notification or triggered from webhook).
 *
 * Body: { title, body, icon?, url?, badge? }
 *
 * Requires VAPID keys in environment:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_SUBJECT=mailto:admin@eetra.app
 */

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT     || 'mailto:admin@eetra.app'

async function sendPushNotification(subscription: any, payload: object) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn('VAPID keys not configured — push notification skipped')
    return
  }

  // Dynamically import web-push (optional dep)
  const webpush = await import('web-push').catch(() => null)
  if (!webpush) {
    console.warn('web-push not installed. Run: npm install web-push')
    return
  }

  webpush.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
  await webpush.default.sendNotification(subscription, JSON.stringify(payload))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, body, icon = '/icon.png', url = '/', badge = '/icon.png' } = await req.json()

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Load all push subscriptions
    const subscriptionRows = await prisma.notification.findMany({
      where: { userId: user.id, type: 'PUSH_SUBSCRIPTION' },
    })

    const payload = { title, body, icon, badge, data: { url } }
    const results = await Promise.allSettled(
      subscriptionRows.map(async row => {
        const sub = JSON.parse(row.message)
        await sendPushNotification(sub, payload)
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({ ok: true, sent, failed })
  } catch (err) {
    console.error('Push send error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
