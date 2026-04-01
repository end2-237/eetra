'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Zap, ArrowRight, Sparkles } from 'lucide-react'

const PLANS = [
  {
    id: 'starter', label: 'Starter', monthly: 0, annual: 0,
    sub: 'Pour decouvrir EETRA', cta: 'Commencer gratuitement', featured: false, accent: '#64748B',
    features: [
      { text: '5 documents / mois', ok: true }, { text: '3 templates inclus', ok: true },
      { text: 'Export PDF', ok: true }, { text: '2 pages max / doc', ok: true },
      { text: 'IA redactionnelle', ok: false }, { text: 'Export Word .docx', ok: false },
      { text: 'Sans filigrane', ok: false },
    ],
  },
  {
    id: 'student', label: 'Etudiant', monthly: 2000, annual: 2000,
    sub: 'Pour les etudiants', cta: 'Choisir Etudiant', featured: false, accent: '#10B981',
    features: [
      { text: 'Acces complet', ok: true }, { text: 'Support 24/7', ok: true },
      { text: 'Export PDF', ok: true }, { text: '2 pages max / doc', ok: true },
      { text: 'Sans filigrane', ok: false },
    ],
  },
  {
    id: 'pro', label: 'Pro', monthly: 14900, annual: 11900,
    sub: 'Pour les professionnels exigeants', cta: 'Passer au plan Pro', featured: true, accent: '#6B47ED',
    features: [
      { text: 'Documents illimites', ok: true }, { text: 'Tous les templates', ok: true },
      { text: 'IA redactionnelle incluse', ok: true }, { text: 'Pages illimitees', ok: true },
      { text: 'Export PDF + Word .docx', ok: true }, { text: 'Sans filigrane', ok: true },
      { text: 'Revue collaborative', ok: true },
    ],
  },
  {
    id: 'business', label: 'Business', monthly: 39900, annual: 31900,
    sub: 'Pour les equipes 2–10', cta: 'Choisir Business', featured: false, accent: '#10B981',
    features: [
      { text: 'Tout le plan Pro', ok: true }, { text: "Jusqu'a 10 utilisateurs", ok: true },
      { text: 'Espace de travail partage', ok: true }, { text: 'Gestion des roles', ok: true },
      { text: 'Analytics avances', ok: true }, { text: 'Support prioritaire 24h', ok: true },
      { text: 'Onboarding dedie', ok: true },
    ],
  },
  {
    id: 'enterprise', label: 'Enterprise', monthly: null, annual: null,
    sub: 'Groupes & organisations', cta: 'Nous contacter', featured: false, accent: '#F59E0B',
    features: [
      { text: 'Tout le plan Business', ok: true }, { text: 'Utilisateurs illimites', ok: true },
      { text: 'API REST dediee', ok: true }, { text: 'SSO / LDAP', ok: true },
      { text: 'SLA garanti 99.9%', ok: true }, { text: 'Facturation personnalisee', ok: true },
      { text: 'Support ingenieur dedie', ok: true },
    ],
  },
]

const CSS = `
  .pricing-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
  
  .pricing-card {
    transition: transform .35s cubic-bezier(.23,1,.32,1), box-shadow .35s, border-color .25s;
  }
  .pricing-card:hover {
    transform: translateY(-6px);
  }
  .pricing-card-featured:hover {
    box-shadow: 0 0 0 1px var(--accent), 0 24px 64px var(--electricGlow) !important;
  }
  .pricing-card:not(.pricing-card-featured):hover {
    border-color: var(--accent) !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  }
  .dark .pricing-card:not(.pricing-card-featured):hover {
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }
  
  .pricing-btn {
    transition: transform .25s cubic-bezier(.23,1,.32,1), box-shadow .25s, background .2s;
    position: relative;
    overflow: hidden;
  }
  .pricing-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform .5s;
  }
  .pricing-btn:hover::before { transform: translateX(100%); }
  .pricing-btn:hover { transform: translateY(-2px); }
  .pricing-btn-primary:hover { box-shadow: 0 12px 32px var(--electricGlow) !important; }
  .pricing-btn-secondary:hover { 
    border-color: var(--accent) !important; 
    color: var(--accent) !important; 
    background: var(--accentS) !important; 
  }

  @media (max-width: 1280px) {
    .pricing-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
  }
  @media (max-width: 1023px) {
    .pricing-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .pricing-section { padding: 100px 0 !important; }
    .pricing-inner { padding: 0 40px !important; }
  }
  @media (max-width: 767px) {
    .pricing-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .pricing-section { padding: 80px 0 !important; }
    .pricing-inner { padding: 0 24px !important; }
    .pricing-toggle { flex-direction: row; gap: 4px; }
    .pricing-card { padding: 24px 20px !important; }
  }
  @media (max-width: 640px) {
    .pricing-grid { grid-template-columns: 1fr; gap: 14px; }
    .pricing-toggle { flex-direction: column; gap: 6px; align-items: stretch; width: 100%; max-width: 280px; }
  }
  @media (max-width: 479px) {
    .pricing-section { padding: 56px 0 !important; }
    .pricing-inner { padding: 0 18px !important; }
    .pricing-inner > div:first-child { margin-bottom: 36px !important; }
    .pricing-inner > div:first-child h2 { font-size: clamp(24px, 6vw, 36px) !important; }
    .pricing-inner > div:first-child p { font-size: 13px; }
    .pricing-toggle { padding: 4px !important; }
    .pricing-toggle button { padding: 8px 16px !important; font-size: 13px !important; }
    .pricing-card { padding: 22px 18px !important; border-radius: 20px !important; }
    .pricing-card ul li { font-size: 12px !important; }
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

      <section id="pricing" className="pricing-section" style={{ width: '100%', padding: '120px 0', background: 'var(--bg2)' }}>
        <div className="pricing-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 56px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'var(--accentS2)', color: 'var(--accent)', fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 22 }}>
              <Sparkles size={12} /> Tarification
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .92, color: 'var(--text)', marginBottom: 16 }}>
              Simple. Transparent. En FCFA.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text3)', marginBottom: 28 }}>
              Paiements par Orange Money · MTN MoMo · Wave · Virement bancaire
            </p>

            {/* Toggle */}
            <div className="pricing-toggle" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {[{ label: 'Mensuel', val: false }, { label: 'Annuel (-20%)', val: true }].map(opt => (
                <button key={opt.label} onClick={() => setAnnual(opt.val)}
                  style={{ padding: '10px 22px', borderRadius: 99, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .25s cubic-bezier(.23,1,.32,1)', background: annual === opt.val ? 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)' : 'transparent', color: annual === opt.val ? '#fff' : 'var(--text3)', boxShadow: annual === opt.val ? '0 4px 16px var(--electricGlow)' : 'none' }}>
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
                <div key={plan.id} className={`pricing-card${plan.featured ? ' pricing-card-featured' : ''}`} style={{
                  borderRadius: 24, padding: plan.featured ? '32px 28px' : '28px 24px',
                  display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                  ...(plan.featured ? {
                    background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)', 
                    border: '1px solid rgba(107,71,237,.4)',
                    boxShadow: '0 0 0 1px rgba(107,71,237,.2), 0 24px 64px var(--electricGlow)',
                  } : { background: 'var(--surface)', border: '1px solid var(--border)' }),
                }}>
                  {/* Featured glow */}
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%)', pointerEvents: 'none' }} />
                  )}
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 99, background: 'var(--accentS2)', border: '1px solid rgba(107,71,237,.3)', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', color: 'var(--accent)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Zap size={10} /> Populaire
                    </div>
                  )}
                  
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 16, color: plan.featured ? 'var(--accent)' : plan.accent }}>
                    {plan.label}
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    {priceStr === null ? (
                      <div style={{ fontSize: 28, fontWeight: 900, color: plan.featured ? '#fff' : 'var(--text)' }}>Sur devis</div>
                    ) : priceStr === 'Gratuit' ? (
                      <div style={{ fontSize: 36, fontWeight: 900, color: plan.featured ? '#fff' : 'var(--text)' }}>Gratuit</div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={{ fontSize: 34, fontWeight: 900, color: plan.featured ? '#fff' : 'var(--text)' }}>{priceStr}</span>
                        <span style={{ fontSize: 12, color: plan.featured ? 'rgba(255,255,255,.4)' : 'var(--text4)' }}> FCFA/mois</span>
                      </div>
                    )}
                  </div>
                  
                  <p style={{ fontSize: 13, color: plan.featured ? 'rgba(255,255,255,.5)' : 'var(--text4)', marginBottom: 20 }}>{plan.sub}</p>
                  
                  <div style={{ height: 1, background: plan.featured ? 'rgba(255,255,255,.08)' : 'var(--border)', marginBottom: 20 }} />
                  
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                    {plan.features.map(f => (
                      <li key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13 }}>
                        {f.ok ? (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: plan.featured ? 'var(--accentS2)' : 'rgba(16,185,129,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <Check size={10} color={plan.featured ? 'var(--accent)' : '#10B981'} strokeWidth={3} />
                          </div>
                        ) : (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <X size={9} color="var(--text4)" strokeWidth={2.5} />
                          </div>
                        )}
                        <span style={{ color: plan.featured ? (f.ok ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.3)') : (f.ok ? 'var(--text2)' : 'var(--text4)') }}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button onClick={() => router.push(plan.id === 'enterprise' ? 'mailto:contact@eetra.app' : '/login')}
                    className={`pricing-btn ${plan.featured ? 'pricing-btn-primary' : 'pricing-btn-secondary'}`}
                    style={{ width: '100%', padding: '13px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...(plan.featured ? { background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', color: '#fff', border: 'none', boxShadow: '0 6px 20px var(--electricGlow)' } : { background: 'transparent', color: 'var(--text2)', border: '1.5px solid var(--border2)' }) }}>
                    {plan.id === 'pro' && <Zap size={14} />}
                    {plan.cta} {plan.id !== 'pro' && <ArrowRight size={13} />}
                  </button>
                </div>
              )
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text4)', marginTop: 24 }}>
            TVA non applicable · Prix HT · Annulation a tout moment
          </p>

          {/* Compare strip */}
          <div style={{ marginTop: 48, padding: '24px 32px', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Pas sur de votre choix ? Essayez gratuitement pendant 14 jours.</div>
            <button onClick={() => router.push('/login')} className="pricing-btn pricing-btn-secondary"
              style={{ padding: '12px 24px', borderRadius: 14, background: 'transparent', color: 'var(--accent)', border: '1.5px solid var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              Essai gratuit <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
