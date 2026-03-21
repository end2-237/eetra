'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Zap, Shield, FileText, Users, BarChart3, ArrowUpRight, Layers, Download } from 'lucide-react'

// ── Scroll reveal ─────────────────────────────────────────────────────────────

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

function useParallax() {
  useEffect(() => {
    let raf: number
    const tick = () => {
      const sy = window.scrollY
      document.querySelectorAll<HTMLElement>('[data-p]').forEach(el => {
        el.style.transform = `translateY(${sy * parseFloat(el.dataset.p || '0')}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  [data-sr].sr-in { opacity:1!important; transform:none!important; }

  @keyframes feat-shimmer {
    0%   { transform:translateX(-100%); opacity:0; }
    20%  { opacity:1; }
    80%  { opacity:1; }
    100% { transform:translateX(350%); opacity:0; }
  }
  @keyframes ai-pulse {
    0%,100% { opacity:.5; }
    50%      { opacity:1; }
  }
  @keyframes bar-grow {
    from { transform:scaleY(0); }
    to   { transform:scaleY(1); }
  }
  @keyframes color-spin {
    0%   { transform:rotate(0deg); }
    100% { transform:rotate(360deg); }
  }
  @keyframes float-icon {
    0%,100% { transform:translateY(0px); }
    50%      { transform:translateY(-5px); }
  }

  .feat-card {
    transition: transform .35s cubic-bezier(.23,1,.32,1),
                box-shadow .35s ease,
                border-color .2s;
    position: relative;
    overflow: hidden;
  }
  .feat-card::after {
    content:'';
    position:absolute; inset:0;
    background:radial-gradient(circle at var(--cx,50%) var(--cy,50%), rgba(255,255,255,.07) 0%, transparent 55%);
    pointer-events:none; opacity:0;
    transition:opacity .3s; border-radius:inherit; z-index:4;
  }
  .feat-card:hover::after { opacity:1; }
  .feat-card:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 18px 52px rgba(0,0,0,.13), 0 6px 18px rgba(0,0,0,.07);
  }
  .feat-card-dark:hover {
    box-shadow: 0 18px 52px rgba(0,0,0,.35), 0 6px 18px rgba(0,0,0,.2);
  }

  .feat-icon {
    animation: float-icon 4s ease-in-out infinite;
  }

  .ai-bar {
    animation: ai-pulse 2s ease-in-out infinite;
  }

  .bar-chart-bar {
    transform-origin: bottom;
    animation: bar-grow .7s cubic-bezier(.23,1,.32,1) both;
  }

  .feat-shimmer-line {
    position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:3; border-radius:inherit;
  }
  .feat-shimmer-line::after {
    content:'';
    position:absolute; top:0; left:0; width:30%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);
    animation:feat-shimmer 4s ease-in-out infinite 1s;
  }

  .color-dot {
    transition: transform .2s, box-shadow .2s;
  }
  .color-dot:hover {
    transform: scale(1.3) translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,.3);
    z-index: 2;
    position: relative;
  }

  .export-pill {
    transition: transform .2s, box-shadow .2s;
  }
  .export-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,.1);
  }

  .feat-cta-btn {
    transition: transform .2s, box-shadow .2s, background .2s;
  }
  .feat-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(27,79,216,.4);
    background: #1640c0!important;
  }
`

// ── SR wrapper ────────────────────────────────────────────────────────────────

function SR({ children, d = 0, from = 'up', style = {} }:
  { children: React.ReactNode; d?: number; from?: 'up'|'left'|'right'|'scale'|'fade'; style?: React.CSSProperties }) {
  const t: Record<string, string> = {
    up:'translateY(44px)', left:'translateX(-36px)',
    right:'translateX(36px)', scale:'scale(0.92)', fade:'translateY(16px)',
  }
  return (
    <div data-sr style={{
      opacity:0, transform:t[from],
      transition:`opacity .85s cubic-bezier(.23,1,.32,1) ${d}ms, transform .85s cubic-bezier(.23,1,.32,1) ${d}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Card with cursor glow ─────────────────────────────────────────────────────

function Card({ children, style = {}, dark = false, className = '' }: {
  children: React.ReactNode; style?: React.CSSProperties; dark?: boolean; className?: string
}) {
  return (
    <div
      className={`feat-card${dark ? ' feat-card-dark' : ''} ${className}`}
      style={{ '--cx':'50%', '--cy':'50%', ...style } as any}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--cx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--cy', `${e.clientY - r.top}px`)
      }}
    >
      {children}
    </div>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

export function Features() {
  const router = useRouter()
  useSR()
  useParallax()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <section id="features" style={{ width:'100%', padding:'110px 0', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

        {/* Parallax background glows */}
        <div data-p="0.05" style={{ position:'absolute', top:0, left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(27,79,216,.07),transparent 70%)', pointerEvents:'none' }}/>
        <div data-p="0.08" style={{ position:'absolute', bottom:'10%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(124,58,237,.06),transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(27,79,216,.025) 1px,transparent 1px)', backgroundSize:'36px 36px', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 48px', position:'relative', zIndex:1 }}>

          {/* ── Section header ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'end', marginBottom:64 }}>
            <SR d={0} from="left">
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:99, background:'var(--accentS2)', color:'var(--accent)', fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:20, border:'1px solid rgba(27,79,216,.18)' }}>
                Fonctionnalités
              </div>
              <h2 style={{ fontSize:'clamp(32px,3.5vw,52px)', fontWeight:900, letterSpacing:'-.04em', lineHeight:.95, color:'var(--text)', margin:0 }}>
                Tout ce dont<br/>
                <span style={{ fontFamily:'var(--font-playfair,Georgia,serif)', fontStyle:'italic', fontWeight:400, color:'var(--text3)' }}>
                  une direction a besoin.
                </span>
              </h2>
            </SR>
            <SR d={100} from="right">
              <p style={{ fontSize:15, lineHeight:1.72, color:'var(--text3)', margin:0, paddingBottom:4 }}>
                EETRA est conçu pour les équipes dirigeantes, les cabinets de conseil et les PME d'Afrique de l'Ouest qui veulent des documents dignes de leur ambition.
              </p>
            </SR>
          </div>

          {/* ── Bento grid ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap:16 }}>

            {/* ① IA — large dark card */}
            <SR d={0} from="scale" style={{ gridColumn:'span 5' }}>
              <Card dark style={{
                background:'linear-gradient(135deg,#0F172A 0%,#1a306e 100%)',
                borderRadius:20, padding:'36px 32px',
                display:'flex', flexDirection:'column', justifyContent:'space-between',
                minHeight:292, border:'1px solid rgba(255,255,255,.06)',
              }}>
                <div className="feat-shimmer-line"/>
                {/* Glow orbs */}
                <div data-p="0.03" style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'rgba(91,155,255,.15)', filter:'blur(30px)', pointerEvents:'none', zIndex:0 }}/>
                <div style={{ position:'absolute', bottom:-20, left:20, width:100, height:100, borderRadius:'50%', background:'rgba(27,79,216,.2)', filter:'blur(24px)', pointerEvents:'none', zIndex:0 }}/>
                <div style={{ position:'relative', zIndex:2 }}>
                  <div className="feat-icon" style={{ width:46, height:46, borderRadius:13, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                    <Zap size={22} color="#fff"/>
                  </div>
                  <h3 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:10, letterSpacing:'-.02em' }}>IA Rédactionnelle</h3>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,.62)', lineHeight:1.68 }}>
                    Génération d'introductions en 3 paragraphes, reformulation en langage formel corporate, cohérence logique vérifiée automatiquement.
                  </p>
                </div>
                {/* Terminal prompt */}
                <div style={{ marginTop:24, background:'rgba(255,255,255,.05)', borderRadius:11, padding:'12px 16px', border:'1px solid rgba(255,255,255,.09)', position:'relative', zIndex:2 }}>
                  <div style={{ fontSize:9.5, color:'rgba(255,255,255,.36)', marginBottom:7, fontFamily:'monospace', letterSpacing:'.04em' }}>Génère une introduction pour :</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.82)', fontFamily:'monospace' }}>« Business Plan ACACIA 2026 »</div>
                  <div style={{ marginTop:10, height:4, background:'rgba(255,255,255,.07)', borderRadius:2, overflow:'hidden' }}>
                    <div className="ai-bar" style={{ height:'100%', width:'68%', background:'linear-gradient(90deg,rgba(91,155,255,.9),rgba(91,155,255,.3))', borderRadius:2 }}/>
                  </div>
                </div>
              </Card>
            </SR>

            {/* ② Templates */}
            <SR d={70} from="up" style={{ gridColumn:'span 4' }}>
              <Card style={{
                background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:20, padding:'32px 28px',
                display:'flex', flexDirection:'column', minHeight:292,
              }}>
                <div className="feat-icon" style={{ width:46, height:46, borderRadius:13, background:'var(--accentS)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, animationDelay:'.3s' }}>
                  <Layers size={22} color="var(--accent)"/>
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:10, letterSpacing:'-.02em' }}>6 Smart Templates</h3>
                <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.65, flex:1 }}>
                  Business Plan, Audit, Appel d'Offre, Contrat OHADA, Note de direction, Devis — chacun enrichi avec tableaux, clauses et KPIs.
                </p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:20 }}>
                  {['Business Plan','Audit','Contrat','Devis','AO','Mémo'].map((t, i) => (
                    <span key={t} style={{ fontSize:10, fontWeight:700, padding:'4px 11px', borderRadius:99, background:'var(--bg3)', color:'var(--text4)', transition:'all .2s', cursor:'default', animationDelay:`${i*.08}s` }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='var(--accentS)'; el.style.color='var(--accent)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='var(--bg3)'; el.style.color='var(--text4)' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Card>
            </SR>

            {/* ③ Charte Corporate */}
            <SR d={140} from="right" style={{ gridColumn:'span 3' }}>
              <Card style={{
                background:'var(--accent)', borderRadius:20, padding:'32px 24px',
                display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:292,
              }}>
                <div className="feat-shimmer-line"/>
                <div style={{ position:'relative', zIndex:2 }}>
                  <div className="feat-icon" style={{ width:46, height:46, borderRadius:13, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, animationDelay:'.6s' }}>
                    <Shield size={22} color="#fff"/>
                  </div>
                  <h3 style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:10, letterSpacing:'-.02em' }}>Charte Corporate</h3>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,.68)', lineHeight:1.68 }}>
                    Logo, couleur, coordonnées — appliqués sur chaque page automatiquement.
                  </p>
                </div>
                {/* Color dots */}
                <div style={{ display:'flex', gap:7, marginTop:20, position:'relative', zIndex:2 }}>
                  {['#1B4FD8','#059669','#7C3AED','#DC2626','#D97706','#0E7490'].map((c, i) => (
                    <div key={c} className="color-dot" style={{ width:20, height:20, borderRadius:'50%', background:c, border:'2.5px solid rgba(255,255,255,.32)', animationDelay:`${i*.1}s` }}/>
                  ))}
                </div>
              </Card>
            </SR>

            {/* ④ Export */}
            <SR d={60} from="left" style={{ gridColumn:'span 4' }}>
              <Card style={{
                background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:20, padding:'32px 28px',
              }}>
                <div className="feat-icon" style={{ width:46, height:46, borderRadius:13, background:'rgba(5,150,105,.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, animationDelay:'.9s' }}>
                  <Download size={22} color="#059669"/>
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:10, letterSpacing:'-.02em' }}>Export PDF & Word</h3>
                <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.65 }}>
                  PDF haute résolution A4 avec html2canvas, ou .docx éditable pour Microsoft Word — en un clic depuis l'éditeur.
                </p>
                <div style={{ marginTop:22, display:'flex', gap:9 }}>
                  {[['PDF','#DC2626'],['Word .docx','#1B4FD8']].map(([l,c]) => (
                    <div key={l} className="export-pill" style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`1.5px solid ${c}28`, background:`${c}0A`, textAlign:'center', fontSize:12, fontWeight:800, color:c, cursor:'default' }}>
                      {l}
                    </div>
                  ))}
                </div>
              </Card>
            </SR>

            {/* ⑤ Analytics */}
            <SR d={130} from="up" style={{ gridColumn:'span 4' }}>
              <Card style={{
                background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:20, padding:'32px 28px',
              }}>
                <div className="feat-icon" style={{ width:46, height:46, borderRadius:13, background:'rgba(124,58,237,.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, animationDelay:'1.1s' }}>
                  <BarChart3 size={22} color="#7C3AED"/>
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:10, letterSpacing:'-.02em' }}>Score & Analytics</h3>
                <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.65, marginBottom:18 }}>
                  Score de complétude en temps réel, répartition des blocs, compteur de mots par page.
                </p>
                {/* Animated bar chart */}
                <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:44 }}>
                  {[55,75,90,68,82,95,78].map((h, i) => (
                    <div key={i} className="bar-chart-bar" style={{
                      flex:1, background:i===6?'#7C3AED':'var(--bg3)', borderRadius:'3px 3px 0 0',
                      height:`${h}%`, animationDelay:`${i*.06 + .3}s`,
                      transition:'background .2s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#7C3AED'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i===6?'#7C3AED':'var(--bg3)'}
                    />
                  ))}
                </div>
              </Card>
            </SR>

            {/* ⑥ Collab */}
            <SR d={200} from="right" style={{ gridColumn:'span 4' }}>
              <Card style={{
                background:'linear-gradient(135deg,#FAFAFA 0%,#EEF3FF 100%)',
                border:'1px solid #DDE7FF',
                borderRadius:20, padding:'32px 28px',
                position:'relative',
              }}>
                {/* Decorative orb */}
                <div style={{ position:'absolute', bottom:-24, right:-24, width:110, height:110, borderRadius:'50%', background:'rgba(27,79,216,.07)', pointerEvents:'none' }}/>
                <div className="feat-icon" style={{ width:46, height:46, borderRadius:13, background:'rgba(27,79,216,.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, animationDelay:'1.3s', position:'relative', zIndex:1 }}>
                  <Users size={22} color="#1B4FD8"/>
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'#111', marginBottom:10, letterSpacing:'-.02em', position:'relative', zIndex:1 }}>Revue Collaborative</h3>
                <p style={{ fontSize:13, color:'#555', lineHeight:1.65, position:'relative', zIndex:1 }}>
                  Annotations horodatées, réponses en fil, résolution de commentaires et gestion des rôles par équipe.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="feat-cta-btn"
                  style={{ marginTop:22, display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:11, background:'#1B4FD8', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', position:'relative', zIndex:1 }}
                >
                  Essayer <ArrowUpRight size={12}/>
                </button>
              </Card>
            </SR>

            {/* ⑦ OHADA */}
            <SR d={80} from="up" style={{ gridColumn:'span 3' }}>
              <Card dark style={{
                background:'#0F172A', border:'1px solid rgba(255,255,255,.06)',
                borderRadius:20, padding:'28px 24px',
                display:'flex', flexDirection:'column', justifyContent:'center',
              }}>
                <div className="feat-shimmer-line"/>
                <div style={{ fontSize:34, marginBottom:14, position:'relative', zIndex:1 }}>⚖️</div>
                <h3 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:8, letterSpacing:'-.01em', position:'relative', zIndex:1 }}>Cadre OHADA</h3>
                <p style={{ fontSize:12, color:'rgba(255,255,255,.52)', lineHeight:1.62, position:'relative', zIndex:1 }}>
                  Clauses, contrats et documents calibrés pour les 17 pays membres.
                </p>
              </Card>
            </SR>

            {/* ⑧ CTA banner */}
            <SR d={160} from="up" style={{ gridColumn:'span 5' }}>
              <Card style={{
                background:'var(--bg2)', border:'1px solid var(--border)',
                borderRadius:20, padding:'28px 28px',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap:20,
              }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:'var(--text)', marginBottom:5 }}>Prêt à créer votre premier document ?</div>
                  <div style={{ fontSize:12, color:'var(--text4)' }}>Aucune carte bancaire — plan gratuit disponible</div>
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="feat-cta-btn"
                  style={{ flexShrink:0, padding:'11px 22px', borderRadius:12, background:'var(--accent)', color:'#fff', border:'none', fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:6, boxShadow:'0 6px 24px rgba(27,79,216,.28)' }}
                >
                  Démarrer <ArrowUpRight size={13}/>
                </button>
              </Card>
            </SR>

          </div>
        </div>
      </section>
    </>
  )
}