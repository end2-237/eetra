'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Zap, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    id: 'starter', label: 'Starter', monthly: 0, annual: 0,
    sub: 'Pour découvrir EETRA', cta: 'Commencer gratuitement', featured: false, accent: '#6B7280',
    features: [
      { text: '5 documents / mois', ok: true }, { text: '3 templates inclus', ok: true },
      { text: 'Export PDF', ok: true }, { text: '2 pages max / doc', ok: true },
      { text: 'IA rédactionnelle', ok: false }, { text: 'Export Word .docx', ok: false },
      { text: 'Sans filigrane', ok: false },
    ],
  },
  {
    id: 'student', label: 'Tarif Étudiant', monthly: 2000, annual: 2000,
    sub: 'Pour les étudiants', cta: 'Choisir Tarif Étudiant', featured: false, accent: '#059669',
    features: [
      { text: 'Accès complet', ok: true }, { text: 'Support 24/7', ok: true },
      { text: 'Export PDF', ok: true }, { text: '2 pages max / doc', ok: true },
      { text: 'Sans filigrane', ok: false },
    ],
  },
  {
    id: 'pro', label: 'Pro', monthly: 14900, annual: 11900,
    sub: 'Pour les professionnels exigeants', cta: 'Passer au plan Pro', featured: true, accent: '#1B4FD8',
    features: [
      { text: 'Documents illimités', ok: true }, { text: 'Tous les templates', ok: true },
      { text: 'IA rédactionnelle incluse', ok: true }, { text: 'Pages illimitées', ok: true },
      { text: 'Export PDF + Word .docx', ok: true }, { text: 'Sans filigrane', ok: true },
      { text: 'Revue collaborative', ok: true },
    ],
  },
  {
    id: 'business', label: 'Business', monthly: 39900, annual: 31900,
    sub: 'Pour les équipes 2–10', cta: 'Choisir Business', featured: false, accent: '#059669',
    features: [
      { text: 'Tout le plan Pro', ok: true }, { text: "Jusqu'à 10 utilisateurs", ok: true },
      { text: 'Espace de travail partagé', ok: true }, { text: 'Gestion des rôles', ok: true },
      { text: 'Analytics avancés', ok: true }, { text: 'Support prioritaire 24h', ok: true },
      { text: 'Onboarding dédié', ok: true },
    ],
  },
  {
    id: 'enterprise', label: 'Enterprise', monthly: null, annual: null,
    sub: 'Groupes & organisations', cta: 'Nous contacter', featured: false, accent: '#B45309',
    features: [
      { text: 'Tout le plan Business', ok: true }, { text: 'Utilisateurs illimités', ok: true },
      { text: 'API REST dédiée', ok: true }, { text: 'SSO / LDAP', ok: true },
      { text: 'SLA garanti 99.9%', ok: true }, { text: 'Facturation personnalisée', ok: true },
      { text: 'Support ingénieur dédié', ok: true },
    ],
  },
]

const CSS = `
  .pricing-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .pricing-section { width:100%; padding:100px 0; background:var(--bg); }
  .pricing-inner { max-width:1200px; margin:0 auto; padding:0 48px; }

  @media (max-width: 1024px) {
    .pricing-section { padding:96px 0; }
    .pricing-inner { padding:0 40px; }
    .pricing-grid { grid-template-columns:repeat(2,1fr); gap:14px; }
    .pricing-inner > div:first-child { margin-bottom:56px; }
    .pricing-inner > div:first-child h2 { font-size:clamp(28px,4vw,44px); }
  }
  @media (max-width: 768px) {
    .pricing-section { padding:72px 0; }
    .pricing-inner { padding:0 24px; margin-bottom:32px; }
    .pricing-grid { grid-template-columns:1fr; gap:12px; }
    .pricing-inner > div:first-child { margin-bottom:48px; }
    .pricing-inner > div:first-child h2 { font-size:clamp(24px,5vw,36px); line-height:1.1; }
    .pricing-inner > div:first-child p { font-size:14px; }
    .pricing-toggle { flex-direction:row; gap:8px; }
    .pricing-toggle button { padding:9px 18px; font-size:13px; }
    .pricing-compare-strip { flex-direction:column; align-items:stretch!important; gap:14px!important; }
  }
  @media (max-width: 480px) {
    .pricing-section { padding:56px 0; }
    .pricing-inner { padding:0 16px; }
    .pricing-inner > div:first-child { margin-bottom:40px; }
    .pricing-inner > div:first-child h2 { font-size:clamp(22px,5.5vw,30px); }
    .pricing-inner > div:first-child p { font-size:13px; }
    .pricing-toggle { padding:3px; }
    .pricing-toggle button { padding:8px 14px; font-size:12px; }
    .pricing-card { padding:20px 16px!important; }
    .pricing-compare-strip { padding:16px 14px!important; font-size:13px; }
  }
`

function formatPrice(n: number | null) {
  if (n === null) return null
  if (n === 0) return 'Gratuit'
  return n.toLocaleString('fr-FR')
}

export function Pricing() {
  const router = useRouter()
  const [annual, setAnnual] = useState(false)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section id="pricing" className="pricing-section" style={{ width: '100%', padding: '100px 0', background: 'var(--bg)' }}>
        <div className="pricing-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'var(--accentS2)', color: 'var(--accent)', fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              Tarification
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,52px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .95, color: 'var(--text)', marginBottom: 14 }}>
              Simple. Transparent. En FCFA.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 24 }}>
              Paiements par Orange Money · MTN MoMo · Wave · Virement bancaire
            </p>

            {/* Toggle */}
            <div className="pricing-toggle" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px', borderRadius: 99, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              {[{ label: 'Mensuel', val: false }, { label: 'Annuel (−20%)', val: true }].map(opt => (
                <button key={opt.label} onClick={() => setAnnual(opt.val)}
                  style={{ padding: '8px 18px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: annual === opt.val ? 'var(--accent)' : 'transparent', color: annual === opt.val ? '#fff' : 'var(--text3)' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="pricing-grid">
            {PLANS.map(plan => {
              const price = annual ? plan.annual : plan.monthly
              const priceStr = formatPrice(price)
              return (
                <div key={plan.id} style={{
                  borderRadius: 20, padding: plan.featured ? '28px 24px' : '24px 20px',
                  display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                  ...(plan.featured ? {
                    background: '#0F172A', border: '1px solid rgba(91,155,255,.3)',
                    boxShadow: '0 0 0 1px rgba(27,79,216,.2), 0 20px 60px rgba(27,79,216,.25)',
                  } : { background: 'var(--surface)', border: '1px solid var(--border)' }),
                }}>
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(91,155,255,.25) 0%,transparent 70%)', pointerEvents: 'none' }} />
                  )}
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 10px', borderRadius: 99, background: 'rgba(91,155,255,.15)', border: '1px solid rgba(91,155,255,.3)', fontSize: 9, fontWeight: 800, letterSpacing: '.12em', color: '#5B9BFF', textTransform: 'uppercase' }}>
                      Populaire
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14, color: plan.featured ? '#5B9BFF' : plan.accent }}>
                    {plan.label}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    {priceStr === null ? (
                      <div style={{ fontSize: 26, fontWeight: 900, color: plan.featured ? '#fff' : 'var(--text)' }}>Sur devis</div>
                    ) : priceStr === 'Gratuit' ? (
                      <div style={{ fontSize: 32, fontWeight: 900, color: plan.featured ? '#fff' : 'var(--text)' }}>Gratuit</div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <span style={{ fontSize: 30, fontWeight: 900, color: plan.featured ? '#fff' : 'var(--text)' }}>{priceStr}</span>
                        <span style={{ fontSize: 11, color: plan.featured ? 'rgba(255,255,255,.4)' : 'var(--text4)' }}> FCFA/mois</span>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: plan.featured ? 'rgba(255,255,255,.5)' : 'var(--text4)', marginBottom: 18 }}>{plan.sub}</p>
                  <div style={{ height: 1, background: plan.featured ? 'rgba(255,255,255,.08)' : 'var(--border)', marginBottom: 18 }} />
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, listStyle: 'none', padding: 0, margin: '0 0 22px' }}>
                    {plan.features.map(f => (
                      <li key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12 }}>
                        {f.ok ? (
                          <div style={{ width: 15, height: 15, borderRadius: '50%', background: plan.featured ? 'rgba(91,155,255,.2)' : 'rgba(5,150,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <Check size={9} color={plan.featured ? '#5B9BFF' : '#059669'} strokeWidth={3} />
                          </div>
                        ) : (
                          <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <X size={8} color="var(--text4)" strokeWidth={2.5} />
                          </div>
                        )}
                        <span style={{ color: plan.featured ? (f.ok ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.3)') : (f.ok ? 'var(--text2)' : 'var(--text4)') }}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push(plan.id === 'enterprise' ? 'mailto:contact@eetra.app' : '/login')}
                    style={{ width: '100%', padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s', ...(plan.featured ? { background: '#1B4FD8', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(27,79,216,.4)' } : { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border2)' }) }}>
                    {plan.id === 'pro' && <Zap size={13} />}
                    {plan.cta} {plan.id !== 'pro' && <ArrowRight size={12} />}
                  </button>
                </div>
              )
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text4)', marginTop: 20 }}>
            TVA non applicable · Prix HT · Annulation à tout moment
          </p>

          {/* Compare strip */}
          <div style={{ marginTop: 40, padding: '20px 28px', background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Pas sûr de votre choix ? Essayez gratuitement pendant 14 jours.</div>
            <button onClick={() => router.push('/login')}
              style={{ padding: '10px 20px', borderRadius: 12, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              Essai gratuit <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
