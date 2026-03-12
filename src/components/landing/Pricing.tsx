'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Check, X } from 'lucide-react'

const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    price: 'Gratuit',
    sub: 'Pour découvrir EETRA',
    variant: 'gray' as const,
    cta: 'Commencer',
    featured: false,
    features: [
      { text: '5 documents / mois', ok: true },
      { text: '3 templates inclus', ok: true },
      { text: 'Export PDF', ok: true },
      { text: '2 pages max / doc', ok: true },
      { text: 'IA désactivée', ok: false },
      { text: 'Filigrane EETRA', ok: false },
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '14 900',
    sub: '~24 €/mois · Documents illimités',
    variant: 'blue' as const,
    cta: 'Choisir Pro',
    featured: true,
    features: [
      { text: 'Documents illimités', ok: true },
      { text: 'Tous les templates', ok: true },
      { text: 'IA rédactionnelle', ok: true },
      { text: 'Pages illimitées', ok: true },
      { text: 'Sans filigrane (optionnel)', ok: true },
      { text: 'Revue collaborative', ok: true },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    price: '39 900',
    sub: 'Pour les équipes 2–10',
    variant: 'gray' as const,
    cta: 'Choisir Business',
    featured: false,
    features: [
      { text: 'Tout le plan Pro', ok: true },
      { text: "Jusqu'à 10 utilisateurs", ok: true },
      { text: 'Espace de travail partagé', ok: true },
      { text: 'Gestion des accès', ok: true },
      { text: 'Analytics avancés', ok: true },
      { text: 'Support prioritaire', ok: true },
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 'Sur devis',
    sub: 'Équipes 10+ · Groupes',
    variant: 'orange' as const,
    cta: 'Nous contacter',
    featured: false,
    features: [
      { text: 'Tout le plan Business', ok: true },
      { text: 'Utilisateurs illimités', ok: true },
      { text: 'API dédiée', ok: true },
      { text: 'SSO / LDAP', ok: true },
      { text: 'SLA garanti', ok: true },
      { text: 'Onboarding dédié', ok: true },
    ],
  },
]

const tagStyles = {
  gray:   { bg: 'var(--bg3)',    text: 'var(--text3)' },
  blue:   { bg: 'rgba(255,255,255,.18)', text: '#fff' },
  orange: { bg: 'rgba(217,119,6,.1)',    text: '#D97706' },
}

export function Pricing() {
  const router = useRouter()
  return (
    <section id="pricing" className="py-20 px-12 max-w-[1140px] mx-auto w-full">
      <div className="text-center mb-14">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4"
          style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}
        >
          Tarification
        </div>
        <h2 className="text-[38px] font-black tracking-tight" style={{ color: 'var(--text)' }}>
          Simple. Transparent.
        </h2>
        <p className="text-[14px] mt-2" style={{ color: 'var(--text3)' }}>
          Tous les prix en Francs CFA (FCFA). Facturation mensuelle ou annuelle (−20%).
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {PLANS.map(plan => {
          const isFeatured = plan.featured
          return (
            <div
              key={plan.id}
              className="rounded-2xl p-7 flex flex-col"
              style={
                isFeatured
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--surface)', border: '1px solid var(--border)' }
              }
            >
              <div
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 self-start"
                style={
                  isFeatured
                    ? { background: 'rgba(255,255,255,.2)', color: '#fff' }
                    : { background: tagStyles[plan.variant].bg, color: tagStyles[plan.variant].text }
                }
              >
                {plan.label}
                {isFeatured && (
                  <span className="ml-1.5 bg-white/20 px-1.5 rounded-full text-[8px]">POPULAIRE</span>
                )}
              </div>

              <div className="text-[32px] font-black leading-none tracking-tighter mb-1">
                {plan.price.includes('devis') ? plan.price : (
                  <>
                    {plan.price === 'Gratuit' ? 'Gratuit' : (
                      <>
                        {plan.price}{' '}
                        <span className={`text-[14px] font-normal ${isFeatured ? 'text-white/60' : ''}`}
                          style={!isFeatured ? { color: 'var(--text3)' } : {}}>
                          FCFA/mois
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <p className={`text-[12px] mb-5 ${isFeatured ? 'text-white/60' : ''}`}
                style={!isFeatured ? { color: 'var(--text3)' } : {}}>
                {plan.sub}
              </p>
              <div className={`h-px mb-5 ${isFeatured ? 'bg-white/20' : ''}`}
                style={!isFeatured ? { background: 'var(--border)' } : {}} />

              <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f.text} className="flex items-center gap-2.5 text-[12px]">
                    {f.ok
                      ? <Check size={13} className="flex-shrink-0" style={{ color: isFeatured ? '#fff' : 'var(--success)' }} />
                      : <X     size={13} className="flex-shrink-0 opacity-30" style={{ color: isFeatured ? '#fff' : 'var(--text4)' }} />
                    }
                    <span style={{
                      color: isFeatured ? 'rgba(255,255,255,.85)' : f.ok ? 'var(--text2)' : 'var(--text4)',
                      opacity: f.ok ? 1 : .5,
                    }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isFeatured ? (
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-all"
                  style={{ background: '#fff', color: 'var(--accent)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  {plan.cta}
                </button>
              ) : (
                <Button variant="ghost" fullWidth size="sm" onClick={() => router.push('/login')}>
                  {plan.cta}
                </Button>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-center text-[11px] mt-4" style={{ color: 'var(--text4)' }}>
        TVA non applicable · Les prix s&apos;entendent HT pour les entreprises · Paiement par Mobile Money ou virement
      </p>
    </section>
  )
}
