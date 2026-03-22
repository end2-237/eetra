import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/prisma'
import crypto                        from 'crypto'

const MONETBIL_SERVICE_SECRET = process.env.MONETBIL_SERVICE_SECRET || ''

export async function POST(req: NextRequest) {
  let body: Record<string, string> = {}

  const contentType = req.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const text = await req.text()
      body = Object.fromEntries(new URLSearchParams(text))
    }
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const paymentRef    = body.payment_ref || body.ref || ''
  const status        = (body.status || '').toLowerCase()
  const transactionId = body.transaction_id || ''

  if (!paymentRef) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 })
  }

  // Vérifier signature HMAC si secret configuré
  if (MONETBIL_SERVICE_SECRET && body.sign) {
    const expected = crypto
      .createHmac('sha1', MONETBIL_SERVICE_SECRET)
      .update(paymentRef + status)
      .digest('hex')
    if (expected.toLowerCase() !== body.sign.toLowerCase()) {
      console.error('[IPN] Signature invalide')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
  }

  // Chercher le paiement en base — planId vient de notre DB, pas du webhook
  const payment = await prisma.payment.findUnique({
    where: { id: paymentRef },
  })

  if (!payment) {
    console.warn('[IPN] Payment not found:', paymentRef)
    return NextResponse.json({ ok: true }) // ACK quand même
  }

  // Déjà traité — idempotent
  if (payment.status === 'success') {
    return NextResponse.json({ ok: true })
  }

  const isSuccess = status === 'success' || status === 'successfull' || status === '1'

  if (isSuccess) {
    // Mettre à jour le Payment
    await prisma.payment.update({
      where: { id: paymentRef },
      data:  { status: 'success', transactionId },
    })

    // Activer le plan — planId vient de notre DB, jamais du webhook
    await prisma.profile.upsert({
      where:  { userId: payment.userId },
      update: { planId: payment.planId },
      create: { userId: payment.userId, planId: payment.planId },
    })

    await prisma.notification.create({
      data: {
        userId:  payment.userId,
        type:    'success',
        title:   '🎉 Paiement confirmé',
        message: `Plan ${payment.planId === 'business' ? 'Business' : 'Pro'} activé. Transaction: ${transactionId}`,
        read:    false,
      },
    })

    console.log(`[IPN] ✅ Plan ${payment.planId} activé pour ${payment.userId}`)

  } else {
    await prisma.payment.update({
      where: { id: paymentRef },
      data:  { status: 'failed' },
    })
    console.log(`[IPN] ❌ Paiement échoué: ${paymentRef} status: ${status}`)
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'EETRA Monetbil IPN' })
}