import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'
import crypto                        from 'crypto'

const MONETBIL_SERVICE_KEY = process.env.MONETBIL_SERVICE_KEY || ''
const APP_URL              = process.env.NEXT_PUBLIC_APP_URL  || 'http://localhost:3000'

const PLAN_PRICES = {
  student:  { monthly: 2_000, annual: 20_000 },
  pro:      { monthly: 14_900, annual: 142_800 },
  business: { monthly: 39_900, annual: 382_800 },
} as const

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { planId, billing = 'monthly', phone = '', country = 'CM' } = await req.json()

  if (!planId || !['pro', 'business', 'student'].includes(planId)) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const plan   = PLAN_PRICES[planId as keyof typeof PLAN_PRICES]
  const amount = billing === 'annual' ? plan.annual : plan.monthly
  const paymentRef = `EETRA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

  // Stocker en base — source de vérité
  await prisma.payment.create({
    data: {
      id:     paymentRef,
      userId: session.user.id,
      planId,
      billing,
      amount,
      status: 'pending',
    },
  })

  // Mode démo
  if (!MONETBIL_SERVICE_KEY) {
    return NextResponse.json({
      payment_url: `/settings?payment=demo&ref=${paymentRef}`,
      payment_ref: paymentRef,
      demo: true,
    })
  }

  try {
    // Appel API Monetbil pour créer le paiement et obtenir l'URL
    const monetbilRes = await fetch(`https://api.monetbil.com/widget/v2.1/${MONETBIL_SERVICE_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        amount:         String(amount),
        phone:          phone,
        country_code:   country,
        currency:       'XAF',
        payment_ref:    paymentRef,
        notify_url:     `${APP_URL}/api/payments/monetbil/notify`,
        return_url:     `${APP_URL}/settings?payment=return&ref=${paymentRef}`,
        cancel_url:     `${APP_URL}/settings?payment=cancel&ref=${paymentRef}`,
        item_ref:       planId,
        user_firstname: session.user.name?.split(' ')[0] || '',
        user_lastname:  session.user.name?.split(' ').slice(1).join(' ') || '',
        user_email:     session.user.email || '',
        locale:         'fr',
      }).toString(),
    })

    const text = await monetbilRes.text()
    let data: any = {}
    try { data = JSON.parse(text) } catch {
      console.error('[Monetbil initiate] Réponse non-JSON:', text.slice(0, 200))
    }

    console.log('[Monetbil initiate] Response:', data)

    // Monetbil retourne { payment_url: "https://..." } ou { url: "..." }
    const paymentUrl = data.payment_url || data.url || data.link

    if (paymentUrl) {
      return NextResponse.json({ payment_url: paymentUrl, payment_ref: paymentRef, amount })
    }

    // Si pas d'URL dans la réponse — utiliser l'URL directe standard
    return NextResponse.json({
      payment_url: `https://www.monetbil.com/pay/${MONETBIL_SERVICE_KEY}?payment_ref=${paymentRef}`,
      payment_ref: paymentRef,
      amount,
    })

  } catch (err) {
    console.error('[Monetbil initiate] Erreur:', err)
    // Fallback URL directe
    return NextResponse.json({
      payment_url: `https://www.monetbil.com/pay/${MONETBIL_SERVICE_KEY}?payment_ref=${paymentRef}`,
      payment_ref: paymentRef,
      amount,
    })
  }
}