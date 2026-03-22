import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) {
    return NextResponse.json({ error: 'Référence manquante' }, { status: 400 })
  }

  const refPrefix = ref.substring(0, 30)

  // Paiement confirmé ?
  const successNotif = await prisma.notification.findFirst({
    where: {
      userId:  session.user.id,
      type:    'success',
      message: { contains: refPrefix },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (successNotif) {
    const profile = await prisma.profile.findUnique({
      where:  { userId: session.user.id },
      select: { planId: true },
    })
    return NextResponse.json({
      confirmed: true,
      planId:    profile?.planId || 'pro',
      message:   successNotif.message,
    })
  }

  // Paiement échoué ?
  const failureNotif = await prisma.notification.findFirst({
    where: {
      userId:  session.user.id,
      type:    'warning',
      message: { contains: refPrefix },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (failureNotif) {
    return NextResponse.json({
      confirmed: false,
      status:    'failed',
      message:   failureNotif.message,
    })
  }

  // Webhook pas encore reçu
  return NextResponse.json({
    confirmed: false,
    status:    'pending',
  })
}