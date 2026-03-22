import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { paymentRef, status, transactionId } = await req.json()

  if (!paymentRef) {
    return NextResponse.json({ error: 'paymentRef manquant' }, { status: 400 })
  }

  // Chercher le paiement en base
  const payment = await prisma.payment.findUnique({
    where: { id: paymentRef },
  })

  // Doit exister ET appartenir à l'utilisateur connecté
  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.json({ confirmed: false, status: 'not_found' })
  }

  // Déjà activé
  if (payment.status === 'success') {
    return NextResponse.json({ confirmed: true, planId: payment.planId })
  }

  // Échoué
  if (payment.status === 'failed') {
    return NextResponse.json({ confirmed: false, status: 'failed' })
  }

  // Vérifier le statut reçu de Monetbil (passé depuis l'URL de retour)
  const s = (status || '').toLowerCase().trim()
  const isSuccess = s === 'success' || s === 'successfull' || s === '1'

  if (!isSuccess || !transactionId) {
    // Toujours pending — webhook pas encore reçu
    return NextResponse.json({ confirmed: false, status: 'pending' })
  }

  // ── Activer le plan ────────────────────────────────────────────────────────
  // planId vient de NOTRE DB (créé à l'initiation) — pas de l'URL
  await prisma.payment.update({
    where: { id: paymentRef },
    data:  { status: 'success', transactionId },
  })

  await prisma.profile.upsert({
    where:  { userId: session.user.id },
    update: { planId: payment.planId },
    create: { userId: session.user.id, planId: payment.planId },
  })

  await prisma.notification.create({
    data: {
      userId:  session.user.id,
      type:    'success',
      title:   '🎉 Paiement confirmé',
      message: `Plan ${payment.planId === 'business' ? 'Business' : 'Pro'} activé. Transaction: ${transactionId}`,
      read:    false,
    },
  })

  console.log(`[verify] ✅ Plan ${payment.planId} activé pour ${session.user.id}`)
  return NextResponse.json({ confirmed: true, planId: payment.planId })
}