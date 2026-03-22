'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Zap, Shield, FileText, Users, BarChart3, ArrowUpRight, Layers, Download } from 'lucide-react'

function useSR() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('sr-in'); io.unobserve(e.target) } }),
      { threshold: 0.07, rootMargin: '0px 0px -52px 0px' }
    )
    document.querySelectorAll('[data-sr]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const CSS = `
  [data-sr].sr-in { opacity:1!important; transform:none!important; }

  @keyframes feat-shimmer { 0%{transform:translateX(-100%);opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:translateX(350%);opacity:0} }
  @keyframes ai-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes bar-grow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
  @keyframes float-icon { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-5px)} }

  .feat-card { transition:transform .35s cubic-bezier(.23,1,.32,1),box-shadow .35s ease,border-color .2s; position:relative; overflow:hidden; }
  .feat-card::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at var(--cx,50%) var(--cy,50%),rgba(255,255,255,.07) 0%,transparent 55%); pointer-events:none; opacity:0; transition:opacity .3s; border-radius:inherit; z-index:4; }
  .feat-card:hover::after { opacity:1; }
  .feat-card:hover { transform:translateY(-5px) scale(1.01); box-shadow:0 18px 52px rgba(0,0,0,.13),0 6px 18px rgba(0,0,0,.07); }
  .feat-card-dark:hover { box-shadow:0 18px 52px rgba(0,0,0,.35),0 6px 18px rgba(0,0,0,.2); }
  .feat-icon { animation:float-icon 4s ease-in-out infinite; }
  .ai-bar { animation:ai-pulse 2s ease-in-out infinite; }
  .bar-chart-bar { transform-origin:bottom; animation:bar-grow .7s cubic-bezier(.23,1,.32,1) both; }
  .feat-shimmer-line { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:3; border-radius:inherit; }
  .feat-shimmer-line::after { content:''; position:absolute; top:0; left:0; width:30%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent); animation:feat-shimmer 4s ease-in-out infinite 1s; }
  .color-dot { transition:transform .2s,box-shadow .2s; }
  .color-dot:hover { transform:scale(1.3) translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,.3); z-index:2; position:relative; }
  .export-pill { transition:transform .2s,box-shadow .2s; }
  .export-pill:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,.1); }
  .feat-cta-btn { transition:transform .2s,box-shadow .2s,background .2s; }
  .feat-cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(27,79,216,.4); background:#1640c0!important; }

  /* Bento grid */
  .feat-bento { display:grid; grid-template-columns:repeat(12,1fr); gap:16px; }
  .feat-span-5 { grid-column:span 5; }
  .feat-span-4 { grid-column:span 4; }
  .feat-span-3 { grid-column:span 3; }
  .feat-section { width:100%; padding:110px 0; background:var(--bg); position:relative; overflow:hidden; }
  .feat-inner { max-width:1200px; margin:0 auto; padding:0 48px; position:relative; }
  .feat-header { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:end; margin-bottom:64px; }
  .feat-cta-banner { display:flex; align-items:center; justify-content:space-between; gap:20px; }

  @media (max-width: 1023px) {
    .feat-bento { grid-template-columns:1fr 1fr; }
    .feat-span-5, .feat-span-4, .feat-span-3 { grid-column:span 1; }
    /* Make AI card and collab full width */
    .feat-ai-card, .feat-cta-card { grid-column:span 2!important; }
    .feat-header { grid-template-columns:1fr; gap:20px; margin-bottom:40px; }
  }
  @media (max-width: 767px) {
    .feat-section { padding:64px 0; }
    .feat-inner { padding:0 20px; }
    .feat-bento { grid-template-columns:1fr; gap:12px; }
    .feat-span-5, .feat-span-4, .feat-span-3, .feat-ai-card, .feat-cta-card { grid-column:span 1!important; }
    .feat-cta-banner { flex-direction:column; align-items:flex-start; gap:14px; }
    .feat-cta-banner button { width:100%; justify-content:center; }
  }
`

function Card({ children, style = {}, dark = false, className = '' }: {
  children: React.ReactNode; style?: React.CSSProperties; dark?: boolean; className?: string
}) {
  return (
    <div className={`feat-card${dark ? ' feat-card-dark' : ''} ${className}`}
      style={{ '--cx': '50%', '--cy': '50%', ...style } as any}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--cx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--cy', `${e.clientY - r.top}px`)
      }}>
      {children}
    </div>
  )
}

function SR({ children, d = 0, from = 'up', style = {} }: { children: React.ReactNode; d?: number; from?: string; style?: React.CSSProperties }) {
  const t: Record<string, string> = { up: 'translateY(44px)', left: 'translateX(-36px)', right: 'translateX(36px)', scale: 'scale(0.92)' }
  return (
    <div data-sr style={{ opacity: 0, transform: t[from] || t.up, transition: `opacity .85s cubic-bezier(.23,1,.32,1) ${d}ms, transform .85s cubic-bezier(.23,1,.32,1) ${d}ms`, ...style }}>
      {children}
    </div>
  )
}

export function Features() {
  const router = useRouter()
  useSR()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section id="features" className="feat-section">
        <div data-p="0.05" style={{ position: 'absolute', top: 0, left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(27,79,216,.07),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(27,79,216,.025) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        <div className="feat-inner">
          {/* Header */}
          <div className="feat-header">
            <SR d={0} from="left">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 13px', borderRadius: 99, background: 'var(--accentS2)', color: 'var(--accent)', fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
                Fonctionnalités
              </div>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,52px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .95, color: 'var(--text)', margin: 0 }}>
                Tout ce dont<br />
                <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--text3)' }}>une direction a besoin.</span>
              </h2>
            </SR>
            <SR d={100} from="right">
              <p style={{ fontSize: 15, lineHeight: 1.72, color: 'var(--text3)', margin: 0 }}>
                EETRA est conçu pour les équipes dirigeantes, les cabinets de conseil et les PME d'Afrique de l'Ouest.
              </p>
            </SR>
          </div>

          {/* Bento grid */}
          <div className="feat-bento">

            {/* ① IA — large dark */}
            <SR d={0} from="scale" className="feat-ai-card" style={{ gridColumn: 'span 5' }}>
              <Card dark className="feat-ai-card" style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1a306e 100%)', borderRadius: 20, padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 280, border: '1px solid rgba(255,255,255,.06)' }}>
                <div className="feat-shimmer-line" />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="feat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Zap size={20} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-.02em' }}>IA Rédactionnelle</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.62)', lineHeight: 1.65 }}>
                    Génération d'introductions en 3 paragraphes, reformulation en langage formel corporate — activée en un clic.
                  </p>
                </div>
                <div style={{ marginTop: 22, background: 'rgba(255,255,255,.05)', borderRadius: 11, padding: '12px 16px', border: '1px solid rgba(255,255,255,.09)', position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.36)', marginBottom: 6, fontFamily: 'monospace' }}>Génère une introduction pour :</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', fontFamily: 'monospace' }}>« Business Plan ACACIA 2026 »</div>
                  <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden' }}>
                    <div className="ai-bar" style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg,rgba(91,155,255,.9),rgba(91,155,255,.3))', borderRadius: 2 }} />
                  </div>
                </div>
              </Card>
            </SR>

            {/* ② Templates */}
            <SR d={70} from="up" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px', display: 'flex', flexDirection: 'column', minHeight: 280 }}>
                <div className="feat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, animationDelay: '.3s' }}>
                  <Layers size={20} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 10, letterSpacing: '-.02em' }}>6 Smart Templates</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.65, flex: 1 }}>Business Plan, Audit, Appel d'Offre, Contrat OHADA, Note de direction, Devis — chacun avec tableaux, KPIs et clauses.</p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 18 }}>
                  {['Business Plan', 'Audit', 'Contrat', 'Devis', 'AO', 'Mémo'].map((t, i) => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'var(--bg3)', color: 'var(--text4)', cursor: 'default' }}>{t}</span>
                  ))}
                </div>
              </Card>
            </SR>

            {/* ③ Charte */}
            <SR d={140} from="right" style={{ gridColumn: 'span 3' }}>
              <Card style={{ background: 'var(--accent)', borderRadius: 20, padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 280 }}>
                <div className="feat-shimmer-line" />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="feat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Shield size={20} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Charte Corporate</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.68)', lineHeight: 1.65 }}>Logo, couleur, coordonnées — appliqués sur chaque page automatiquement.</p>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 18, position: 'relative', zIndex: 2 }}>
                  {['#1B4FD8', '#059669', '#7C3AED', '#DC2626', '#D97706', '#0E7490'].map(c => (
                    <div key={c} className="color-dot" style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,.32)' }} />
                  ))}
                </div>
              </Card>
            </SR>

            {/* ④ Export */}
            <SR d={60} from="left" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px' }}>
                <div className="feat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(5,150,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Download size={20} color="#059669" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Export PDF & Word</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.65 }}>PDF haute résolution A4, ou .docx éditable Microsoft Word — en un clic.</p>
                <div style={{ marginTop: 20, display: 'flex', gap: 9 }}>
                  {[['PDF', '#DC2626'], ['Word .docx', '#1B4FD8']].map(([l, c]) => (
                    <div key={l} className="export-pill" style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${c}28`, background: `${c}0A`, textAlign: 'center', fontSize: 12, fontWeight: 800, color: c }}>{l}</div>
                  ))}
                </div>
              </Card>
            </SR>

            {/* ⑤ Analytics */}
            <SR d={130} from="up" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px' }}>
                <div className="feat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <BarChart3 size={20} color="#7C3AED" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Score & Analytics</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.65, marginBottom: 16 }}>Score de complétude en temps réel, répartition des blocs, compteur de mots.</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44 }}>
                  {[55, 75, 90, 68, 82, 95, 78].map((h, i) => (
                    <div key={i} className="bar-chart-bar" style={{ flex: 1, background: i === 6 ? '#7C3AED' : 'var(--bg3)', borderRadius: '3px 3px 0 0', height: `${h}%`, animationDelay: `${i * .06 + .3}s` }} />
                  ))}
                </div>
              </Card>
            </SR>

            {/* ⑥ Collab */}
            <SR d={200} from="right" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'linear-gradient(135deg,#FAFAFA 0%,#EEF3FF 100%)', border: '1px solid #DDE7FF', borderRadius: 20, padding: '32px 28px' }}>
                <div className="feat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(27,79,216,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Users size={20} color="#1B4FD8" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>Revue Collaborative</h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65 }}>Annotations horodatées, réponses en fil, résolution de commentaires et gestion des rôles.</p>
                <button onClick={() => router.push('/login')} className="feat-cta-btn"
                  style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 11, background: '#1B4FD8', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Essayer <ArrowUpRight size={12} />
                </button>
              </Card>
            </SR>

            {/* ⑦ OHADA */}
            <SR d={80} from="up" style={{ gridColumn: 'span 3' }}>
              <Card dark style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 200 }}>
                <div className="feat-shimmer-line" />
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚖️</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Cadre OHADA</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.52)', lineHeight: 1.62 }}>Clauses, contrats calibrés pour les 17 pays membres.</p>
              </Card>
            </SR>

            {/* ⑧ CTA banner */}
            <SR d={160} from="up" className="feat-cta-card" style={{ gridColumn: 'span 5' }}>
              <Card style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 28px', height: '100%' }}>
                <div className="feat-cta-banner">
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 5 }}>Prêt à créer votre premier document ?</div>
                    <div style={{ fontSize: 12, color: 'var(--text4)' }}>Aucune carte bancaire — plan gratuit disponible</div>
                  </div>
                  <button onClick={() => router.push('/login')} className="feat-cta-btn"
                    style={{ flexShrink: 0, padding: '11px 22px', borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 24px rgba(27,79,216,.28)', whiteSpace: 'nowrap' }}>
                    Démarrer <ArrowUpRight size={13} />
                  </button>
                </div>
              </Card>
            </SR>

          </div>
        </div>
      </section>
    </>
  )
}