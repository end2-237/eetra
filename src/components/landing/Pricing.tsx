'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Zap, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    monthly: 0,
    annual: 0,
    sub: 'Pour découvrir EETRA',
    cta: 'Commencer gratuitement',
    featured: false,
    accent: '#6B7280',
    features: [
      { text: '5 documents / mois', ok: true },
      { text: '3 templates inclus', ok: true },
      { text: 'Export PDF', ok: true },
      { text: '2 pages max / doc', ok: true },
      { text: 'IA rédactionnelle', ok: false },
      { text: 'Export Word .docx', ok: false },
      { text: 'Sans filigrane', ok: false },
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    monthly: 14900,
    annual: 11900,
    sub: 'Pour les professionnels exigeants',
    cta: 'Passer au plan Pro',
    featured: true,
    accent: '#1B4FD8',
    features: [
      { text: 'Documents illimités', ok: true },
      { text: 'Tous les templates', ok: true },
      { text: 'IA rédactionnelle incluse', ok: true },
      { text: 'Pages illimitées', ok: true },
      { text: 'Export PDF + Word .docx', ok: true },
      { text: 'Sans filigrane', ok: true },
      { text: 'Revue collaborative', ok: true },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    monthly: 39900,
    annual: 31900,
    sub: 'Pour les équipes 2–10',
    cta: 'Choisir Business',
    featured: false,
    accent: '#059669',
    features: [
      { text: 'Tout le plan Pro', ok: true },
      { text: "Jusqu'à 10 utilisateurs", ok: true },
      { text: 'Espace de travail partagé', ok: true },
      { text: 'Gestion des rôles & accès', ok: true },
      { text: 'Analytics avancés', ok: true },
      { text: 'Support prioritaire 24h', ok: true },
      { text: 'Onboarding dédié', ok: true },
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    monthly: null,
    annual: null,
    sub: 'Groupes & organisations',
    cta: 'Nous contacter',
    featured: false,
    accent: '#B45309',
    features: [
      { text: 'Tout le plan Business', ok: true },
      { text: 'Utilisateurs illimités', ok: true },
      { text: 'API REST dédiée', ok: true },
      { text: 'SSO / LDAP', ok: true },
      { text: 'SLA garanti 99.9%', ok: true },
      { text: 'Facturation personnalisée', ok: true },
      { text: 'Support ingénieur dédié', ok: true },
    ],
  },
]

function formatPrice(n: number | null) {
  if (n === null) return null
  if (n === 0) return 'Gratuit'
  return n.toLocaleString('fr-FR')
}

export function Pricing() {
  const router = useRouter()
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" style={{ width: '100%', padding: '100px 0', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99,
            background: 'var(--accentS2)', color: 'var(--accent)',
            fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Tarification
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 900,
            letterSpacing: '-.04em', lineHeight: .95,
            color: 'var(--text)', marginBottom: 16,
          }}>
            Simple. Transparent. En FCFA.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text3)', marginBottom: 28 }}>
            Paiements par Orange Money · MTN MoMo · Wave · Virement bancaire
          </p>

          {/* Toggle */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '4px', borderRadius: 99,
            background: 'var(--bg2)', border: '1px solid var(--border)',
          }}>
            {[{ label: 'Mensuel', val: false }, { label: 'Annuel', val: true }].map(opt => (
              <button
                key={opt.label}
                onClick={() => setAnnual(opt.val)}
                style={{
                  padding: '8px 18px', borderRadius: 99, border: 'none',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                  background: annual === opt.val ? 'var(--accent)' : 'transparent',
                  color: annual === opt.val ? '#fff' : 'var(--text3)',
                }}
              >
                {opt.label}
                {opt.val && (
                  <span style={{
                    marginLeft: 6, fontSize: 9, fontWeight: 800,
                    padding: '1px 6px', borderRadius: 99,
                    background: annual ? 'rgba(255,255,255,.2)' : 'rgba(5,150,105,.15)',
                    color: annual ? '#fff' : '#059669',
                  }}>
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {PLANS.map(plan => {
            const price = annual ? plan.annual : plan.monthly
            const priceStr = formatPrice(price)
            return (
              <div
                key={plan.id}
                style={{
                  borderRadius: 20,
                  padding: plan.featured ? '28px 24px' : '24px 20px',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative', overflow: 'hidden',
                  ...(plan.featured ? {
                    background: '#0F172A',
                    border: '1px solid rgba(91,155,255,.3)',
                    boxShadow: '0 0 0 1px rgba(27,79,216,.2), 0 20px 60px rgba(27,79,216,.25)',
                  } : {
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }),
                }}
              >
                {/* Glow for featured */}
                {plan.featured && (
                  <div style={{
                    position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                    width: 200, height: 200, borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(91,155,255,.25) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Popular badge */}
                {plan.featured && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    padding: '3px 10px', borderRadius: 99,
                    background: 'rgba(91,155,255,.15)',
                    border: '1px solid rgba(91,155,255,.3)',
                    fontSize: 9, fontWeight: 800, letterSpacing: '.12em',
                    color: '#5B9BFF', textTransform: 'uppercase',
                  }}>
                    Populaire
                  </div>
                )}

                {/* Plan label */}
                <div style={{
                  fontSize: 12, fontWeight: 800, letterSpacing: '.12em',
                  textTransform: 'uppercase', marginBottom: 16,
                  color: plan.featured ? '#5B9BFF' : plan.accent,
                }}>
                  {plan.label}
                </div>

                {/* Price */}
                <div style={{ marginBottom: 6 }}>
                  {priceStr === null ? (
                    <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em', color: plan.featured ? '#fff' : 'var(--text)' }}>
                      Sur devis
                    </div>
                  ) : priceStr === 'Gratuit' ? (
                    <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-.03em', color: plan.featured ? '#fff' : 'var(--text)' }}>
                      Gratuit
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-.03em', color: plan.featured ? '#fff' : 'var(--text)' }}>
                        {priceStr}
                      </span>
                      <span style={{ fontSize: 12, color: plan.featured ? 'rgba(255,255,255,.4)' : 'var(--text4)', fontWeight: 600 }}>
                        {' '}FCFA/mois
                      </span>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 12, color: plan.featured ? 'rgba(255,255,255,.5)' : 'var(--text4)', marginBottom: 20 }}>
                  {plan.sub}
                </p>

                <div style={{ height: 1, background: plan.featured ? 'rgba(255,255,255,.08)' : 'var(--border)', marginBottom: 20 }} />

                {/* Features */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {plan.features.map(f => (
                    <li key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                      {f.ok ? (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: plan.featured ? 'rgba(91,155,255,.2)' : 'rgba(5,150,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Check size={9} color={plan.featured ? '#5B9BFF' : '#059669'} strokeWidth={3} />
                        </div>
                      ) : (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <X size={8} color="var(--text4)" strokeWidth={2.5} />
                        </div>
                      )}
                      <span style={{ color: plan.featured ? (f.ok ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.3)') : (f.ok ? 'var(--text2)' : 'var(--text4)') }}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => router.push(plan.id === 'enterprise' ? 'mailto:contact@eetra.app' : '/login')}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 12,
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all .15s',
                    ...(plan.featured ? {
                      background: '#1B4FD8',
                      color: '#fff', border: 'none',
                      boxShadow: '0 4px 16px rgba(27,79,216,.4)',
                    } : {
                      background: 'transparent',
                      color: 'var(--text2)',
                      border: '1px solid var(--border2)',
                    }),
                  }}
                  onMouseEnter={e => {
                    if (!plan.featured) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!plan.featured) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--text2)'
                    }
                  }}
                >
                  {plan.id === 'pro' && <Zap size={13} />}
                  {plan.cta}
                  {plan.id !== 'pro' && <ArrowRight size={12} />}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text4)', marginTop: 24 }}>
          TVA non applicable · Prix HT · Facturation mensuelle ou annuelle (−20%) · Annulation à tout moment
        </p>

        {/* Comparison strip */}
        <div style={{
          marginTop: 48, padding: '24px 32px',
          background: 'var(--bg2)', borderRadius: 16,
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Pas sûr de votre choix ? Comparez les plans en détail.
          </div>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 22px', borderRadius: 12,
              background: 'transparent', color: 'var(--accent)',
              border: '1px solid var(--accent)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            Essai gratuit 14 jours <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </section>
  )
}