'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Zap, Shield, FileText, Users, BarChart3, ArrowUpRight, Layers, Download, Sparkles } from 'lucide-react'

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
  @keyframes ai-pulse { 0%,100%{opacity:.5;transform:scaleX(0.95)} 50%{opacity:1;transform:scaleX(1)} }
  @keyframes bar-grow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
  @keyframes float-icon { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
  @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

  .feat-card { 
    transition: transform .4s cubic-bezier(.23,1,.32,1), box-shadow .4s ease, border-color .25s; 
    position: relative; 
    overflow: hidden; 
  }
  .feat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(107,71,237,0.08) 0%, transparent 50%);
    opacity: 0;
    transition: opacity .4s;
    pointer-events: none;
    z-index: 1;
  }
  .feat-card:hover::before { opacity: 1; }
  .feat-card:hover { 
    transform: translateY(-6px) scale(1.01); 
    box-shadow: 0 24px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06); 
    border-color: var(--accent) !important;
  }
  .dark .feat-card:hover { 
    box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.3); 
  }
  
  .feat-card-dark:hover { 
    box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.25); 
  }
  
  .feat-icon { animation: float-icon 4.5s ease-in-out infinite; }
  .ai-bar { animation: ai-pulse 2.5s ease-in-out infinite; transform-origin: left; }
  .bar-chart-bar { transform-origin: bottom; animation: bar-grow .8s cubic-bezier(.23,1,.32,1) both; }
  
  .feat-shimmer-line { 
    position: absolute; 
    inset: 0; 
    overflow: hidden; 
    pointer-events: none; 
    z-index: 3; 
    border-radius: inherit; 
  }
  .feat-shimmer-line::after { 
    content: ''; 
    position: absolute; 
    top: 0; 
    left: 0; 
    width: 25%; 
    height: 100%; 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); 
    animation: feat-shimmer 5s ease-in-out infinite 1.5s; 
  }
  
  .color-dot { transition: transform .25s cubic-bezier(.23,1,.32,1), box-shadow .25s; cursor: pointer; }
  .color-dot:hover { transform: scale(1.4) translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.35); z-index: 2; position: relative; }
  
  .export-pill { transition: transform .25s cubic-bezier(.23,1,.32,1), box-shadow .25s, background .2s; cursor: pointer; }
  .export-pill:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
  
  .feat-cta-btn { 
    transition: transform .25s cubic-bezier(.23,1,.32,1), box-shadow .25s, background .2s; 
    position: relative;
    overflow: hidden;
  }
  .feat-cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform .5s;
  }
  .feat-cta-btn:hover::before { transform: translateX(100%); }
  .feat-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px var(--electricGlow); }

  /* Bento grid */
  .feat-bento { display: grid; grid-template-columns: repeat(12,1fr); gap: 18px; }
  .feat-span-5 { grid-column: span 5; }
  .feat-span-4 { grid-column: span 4; }
  .feat-span-3 { grid-column: span 3; }
  .feat-section { width: 100%; padding: 120px 0; background: var(--bg); position: relative; overflow: hidden; }
  .feat-inner { max-width: 1280px; margin: 0 auto; padding: 0 56px; position: relative; }
  .feat-header { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: end; margin-bottom: 72px; }
  .feat-cta-banner { display: flex; align-items: center; justify-content: space-between; gap: 24px; }

  @media (max-width: 1023px) {
    .feat-bento { grid-template-columns: 1fr 1fr; }
    .feat-span-5, .feat-span-4, .feat-span-3 { grid-column: span 1; }
    .feat-ai-card, .feat-cta-card { grid-column: span 2 !important; }
    .feat-header { grid-template-columns: 1fr; gap: 24px; margin-bottom: 48px; }
    .feat-section { padding: 80px 0; }
    .feat-inner { padding: 0 40px; }
  }
  @media (max-width: 767px) {
    .feat-section { padding: 60px 0; }
    .feat-inner { padding: 0 20px; }
    .feat-bento { grid-template-columns: 1fr; gap: 12px; }
    .feat-span-5, .feat-span-4, .feat-span-3, .feat-ai-card, .feat-cta-card { grid-column: span 1 !important; }
    .feat-cta-banner { flex-direction: column; align-items: flex-start; gap: 14px; }
    .feat-cta-banner button { width: 100%; justify-content: center; }
    .feat-header { gap: 16px; margin-bottom: 32px; }
    .feat-header h2 { font-size: clamp(24px, 5vw, 44px) !important; }
    .feat-header p { font-size: 14px; }
    [style*="padding: 40px 36px"] { padding: 28px 20px !important; }
    [style*="padding: 36px 32px"] { padding: 24px 18px !important; }
    [style*="padding: 36px 28px"] { padding: 24px 16px !important; }
  }
  @media (max-width: 599px) {
    .feat-section { padding: 48px 0; }
    .feat-inner { padding: 0 16px; }
    .feat-bento { gap: 10px; }
    .feat-header { gap: 12px; margin-bottom: 28px; }
    .feat-header h2 { font-size: clamp(20px, 5vw, 36px) !important; }
    .feat-header p { font-size: 13px; }
    .feat-cta-banner { gap: 12px; }
  }
  @media (max-width: 479px) {
    .feat-section { padding: 40px 0; }
    .feat-inner { padding: 0 14px; }
    .feat-header { margin-bottom: 24px; }
    .feat-header h2 { font-size: clamp(18px, 4.5vw, 32px) !important; line-height: 1.1; }
    .feat-header p { font-size: 12px; line-height: 1.6; }
    .feat-bento { gap: 8px; }
    [style*="padding: 28px 20px"] { padding: 20px 16px !important; }
    [style*="padding: 24px 18px"] { padding: 18px 14px !important; }
    [style*="padding: 24px 16px"] { padding: 18px 12px !important; }
    [style*="margin-bottom: 22px"] { margin-bottom: 14px !important; }
    [style*="margin-bottom: 20px"] { margin-bottom: 12px !important; }
  }
`

function Card({ children, style = {}, dark = false, className = '' }: {
  children: React.ReactNode; style?: React.CSSProperties; dark?: boolean; className?: string
}) {
  return (
    <div className={`feat-card${dark ? ' feat-card-dark' : ''} ${className}`}
      style={{ '--mx': '50%', '--my': '50%', ...style } as React.CSSProperties}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
      }}>
      {children}
    </div>
  )
}

function SR({ children, d = 0, from = 'up', style = {}, className = '' }: { children: React.ReactNode; d?: number; from?: string; style?: React.CSSProperties; className?: string }) {
  const t: Record<string, string> = { up: 'translateY(48px)', left: 'translateX(-40px)', right: 'translateX(40px)', scale: 'scale(0.92)' }
  return (
    <div data-sr className={className} style={{ opacity: 0, transform: t[from] || t.up, transition: `opacity .9s cubic-bezier(.23,1,.32,1) ${d}ms, transform .9s cubic-bezier(.23,1,.32,1) ${d}ms`, ...style }}>
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
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: -100, left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%)', pointerEvents: 'none', opacity: 0.4, animation: 'glow-pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -150, right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(236,72,153,0.15) 0%,transparent 70%)', pointerEvents: 'none', animation: 'glow-pulse 6s ease-in-out infinite 3s' }} />
        
        {/* Dot pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,var(--border) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none', opacity: 0.4 }} />

        <div className="feat-inner">
          {/* Header */}
          <div className="feat-header">
            <SR d={0} from="left">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'var(--accentS2)', color: 'var(--accent)', fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 20 }}>
                <Sparkles size={12} /> Fonctionnalites
              </div>
              <h2 style={{ fontSize: 'clamp(30px,4vw,56px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .92, color: 'var(--text)', margin: 0 }}>
                Tout ce dont<br />
                <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--text3)' }}>une direction a besoin.</span>
              </h2>
            </SR>
            <SR d={120} from="right">
              <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text3)', margin: 0 }}>
                EETRA est concu pour les equipes dirigeantes, les cabinets de conseil et les PME d&apos;Afrique de l&apos;Ouest.
              </p>
            </SR>
          </div>

          {/* Bento grid */}
          <div className="feat-bento">

            {/* AI Card - Large dark */}
            <SR d={0} from="scale" className="feat-ai-card" style={{ gridColumn: 'span 5' }}>
              <Card dark className="feat-ai-card" style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)', borderRadius: 24, padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 320, border: '1px solid rgba(148,163,184,0.1)' }}>
                <div className="feat-shimmer-line" />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="feat-icon" style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: '0 8px 24px var(--electricGlow)' }}>
                    <Zap size={24} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-.02em' }}>IA Redactionnelle</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
                    Generation d&apos;introductions en 3 paragraphes, reformulation en langage formel corporate — activee en un clic.
                  </p>
                </div>
                <div style={{ marginTop: 26, background: 'rgba(255,255,255,.04)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,.08)', position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 8, fontFamily: 'monospace' }}>Genere une introduction pour :</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', fontFamily: 'monospace' }}>« Business Plan ACACIA 2026 »</div>
                  <div style={{ marginTop: 12, height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div className="ai-bar" style={{ height: '100%', width: '72%', background: 'linear-gradient(90deg,var(--accent),var(--electric))', borderRadius: 3 }} />
                  </div>
                </div>
              </Card>
            </SR>

            {/* Templates */}
            <SR d={80} from="up" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 32px', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
                <div className="feat-icon" style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, animationDelay: '.4s' }}>
                  <Layers size={24} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 12, letterSpacing: '-.02em' }}>6 Smart Templates</h3>
                <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, flex: 1 }}>Business Plan, Audit, Appel d&apos;Offre, Contrat OHADA, Note de direction, Devis — chacun avec tableaux, KPIs et clauses.</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 22 }}>
                  {['Business Plan', 'Audit', 'Contrat', 'Devis', 'AO', 'Memo'].map((t, i) => (
                    <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 99, background: 'var(--bg2)', color: 'var(--text3)', cursor: 'default', border: '1px solid var(--border)' }}>{t}</span>
                  ))}
                </div>
              </Card>
            </SR>

            {/* Charte Corporate */}
            <SR d={160} from="right" style={{ gridColumn: 'span 3' }}>
              <Card style={{ background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', borderRadius: 24, padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 320 }}>
                <div className="feat-shimmer-line" />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="feat-icon" style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, backdropFilter: 'blur(8px)' }}>
                    <Shield size={24} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Charte Corporate</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', lineHeight: 1.7 }}>Logo, couleur, coordonnees — appliques sur chaque page automatiquement.</p>
                </div>
                <div style={{ display: 'flex', gap: 7, marginTop: 22, position: 'relative', zIndex: 2 }}>
                  {['#6B47ED', '#10B981', '#EC4899', '#F59E0B', '#0EA5E9', '#8B5CF6'].map(c => (
                    <div key={c} className="color-dot" style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2.5px solid rgba(255,255,255,.4)', boxShadow: '0 4px 12px rgba(0,0,0,.2)' }} />
                  ))}
                </div>
              </Card>
            </SR>

            {/* Export */}
            <SR d={80} from="left" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 32px' }}>
                <div className="feat-icon" style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <Download size={24} color="#10B981" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Export PDF & Word</h3>
                <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7 }}>PDF haute resolution A4, ou .docx editable Microsoft Word — en un clic.</p>
                <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                  {[['PDF', '#EF4444'], ['Word .docx', 'var(--accent)']].map(([l, c]) => (
                    <div key={l} className="export-pill" style={{ flex: 1, padding: '12px 10px', borderRadius: 12, border: `1.5px solid ${c}30`, background: `${c}08`, textAlign: 'center', fontSize: 13, fontWeight: 800, color: c }}>{l}</div>
                  ))}
                </div>
              </Card>
            </SR>

            {/* Analytics */}
            <SR d={150} from="up" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 32px' }}>
                <div className="feat-icon" style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <BarChart3 size={24} color="#8B5CF6" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Score & Analytics</h3>
                <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 20 }}>Score de completude en temps reel, repartition des blocs, compteur de mots.</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 52 }}>
                  {[50, 70, 90, 65, 80, 95, 75].map((h, i) => (
                    <div key={i} className="bar-chart-bar" style={{ flex: 1, background: i === 5 ? 'linear-gradient(180deg,var(--accent),var(--electric))' : 'var(--bg3)', borderRadius: '4px 4px 0 0', height: `${h}%`, animationDelay: `${i * .08 + .4}s` }} />
                  ))}
                </div>
              </Card>
            </SR>

            {/* Collaboration */}
            <SR d={220} from="right" style={{ gridColumn: 'span 4' }}>
              <Card style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 32px' }}>
                <div className="feat-icon" style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <Users size={24} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Revue Collaborative</h3>
                <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7 }}>Annotations horodatees, reponses en fil, resolution de commentaires et gestion des roles.</p>
                <button onClick={() => router.push('/login')} className="feat-cta-btn"
                  style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px var(--electricGlow)' }}>
                  Essayer <ArrowUpRight size={14} />
                </button>
              </Card>
            </SR>

            {/* OHADA */}
            <SR d={100} from="up" style={{ gridColumn: 'span 3' }}>
              <Card dark style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 24, padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 220 }}>
                <div className="feat-shimmer-line" />
                <div style={{ fontSize: 40, marginBottom: 16 }}>&#9878;</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Cadre OHADA</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.65 }}>Clauses, contrats calibres pour les 17 pays membres.</p>
              </Card>
            </SR>

            {/* CTA Banner */}
            <SR d={180} from="up" className="feat-cta-card" style={{ gridColumn: 'span 5' }}>
              <Card style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px 32px', height: '100%' }}>
                <div className="feat-cta-banner">
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Pret a creer votre premier document ?</div>
                    <div style={{ fontSize: 13, color: 'var(--text4)' }}>Aucune carte bancaire — plan gratuit disponible</div>
                  </div>
                  <button onClick={() => router.push('/login')} className="feat-cta-btn"
                    style={{ flexShrink: 0, padding: '13px 26px', borderRadius: 14, background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 28px var(--electricGlow)', whiteSpace: 'nowrap' }}>
                    Demarrer <ArrowUpRight size={15} />
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
