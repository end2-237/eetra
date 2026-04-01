'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import logo from '../../app/icon.png'
import { ArrowRight, Shield, Clock, TrendingUp, Sparkles, Play } from 'lucide-react'

function useSR() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('sr-in'); io.unobserve(e.target) } }),
      { threshold: 0.06, rootMargin: '0px 0px -48px 0px' }
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

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 4)
          setCount(Math.floor(ease * end))
          if (p < 1) requestAnimationFrame(tick); else setCount(end)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [end, duration])
  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>
}

const CSS = `
  [data-sr].sr-in { opacity:1!important; transform:none!important; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float-doc { 0%,100%{transform:translateX(-52%) rotate(-2deg) translateY(0px)} 50%{transform:translateX(-52%) rotate(-2deg) translateY(-12px)} }
  @keyframes float-badge { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
  @keyframes pulse-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes glow-pulse { 0%,100%{opacity:0.6;filter:blur(40px)} 50%{opacity:0.9;filter:blur(50px)} }
  @keyframes scan-line { 0%{transform:translateY(-100%);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(100%);opacity:0} }

  .hero-section { width:100%; max-width:1280px; margin:0 auto; padding:100px 56px 0; position:relative; overflow:visible; }
  .hero-grid { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; padding-bottom:88px; }
  .hero-doc-wrap { display:flex; position:relative; justify-content:center; height:560px; }
  .hero-doc { animation:float-doc 6s ease-in-out infinite; }
  .hero-badge { animation:float-badge 5s ease-in-out infinite; }
  .hero-badge:nth-child(2) { animation-delay:.7s; animation-duration:6s; }
  .hero-badge:nth-child(3) { animation-delay:1.4s; animation-duration:5.5s; }
  
  .hero-cta-primary { 
    position:relative; overflow:hidden;
    transition:transform .3s cubic-bezier(.23,1,.32,1),box-shadow .3s; 
  }
  .hero-cta-primary::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
    transform:translateX(-100%);
    transition:transform .5s;
  }
  .hero-cta-primary:hover::before { transform:translateX(100%); }
  .hero-cta-primary:hover { transform:translateY(-3px)!important; box-shadow:0 20px 50px rgba(107,71,237,.45)!important; }
  
  .hero-cta-ghost { transition:all .25s cubic-bezier(.23,1,.32,1); }
  .hero-cta-ghost:hover { 
    border-color:var(--accent)!important; 
    color:var(--accent)!important; 
    background:var(--accentS)!important;
    transform:translateY(-2px); 
  }
  
  .stat-card { 
    transition:transform .25s cubic-bezier(.23,1,.32,1),background .2s,box-shadow .25s; 
    position:relative;
  }
  .stat-card::after {
    content:''; position:absolute; inset:0; border-radius:inherit;
    background:linear-gradient(135deg,var(--accentS) 0%,transparent 50%);
    opacity:0; transition:opacity .3s;
  }
  .stat-card:hover::after { opacity:1; }
  .stat-card:hover { background:var(--bg2)!important; transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.06); }
  
  .hero-stats { 
    border-top:1px solid var(--border); 
    border-bottom:1px solid var(--border); 
    display:grid; grid-template-columns:repeat(4,1fr); 
    background:var(--glass-bg); 
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
    margin:0 -56px; padding:36px 56px; 
  }
  .hero-h1 { font-size:clamp(40px,5vw,76px); }
  
  .hero-glow {
    position:absolute; width:500px; height:500px; border-radius:50%;
    background:radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%);
    animation:glow-pulse 4s ease-in-out infinite;
    pointer-events:none;
  }

  @media (max-width: 1023px) {
    .hero-grid { grid-template-columns:1fr; gap:48px; padding-bottom:56px; }
    .hero-doc-wrap { height:400px; }
    .hero-section { padding:64px 40px 0; }
    .hero-stats { margin:0 -40px; padding:28px 40px; }
  }
  @media (max-width: 767px) {
    .hero-section { padding:48px 24px 0; }
    .hero-grid { gap:36px; padding-bottom:44px; }
    .hero-doc-wrap { height:320px; }
    .hero-stats { grid-template-columns:1fr 1fr; margin:0 -24px; padding:24px; gap:0; }
    .hero-stats > div { border-right:none!important; padding:18px 14px; border-bottom:1px solid var(--border); }
    .hero-stats > div:nth-child(1),
    .hero-stats > div:nth-child(2) { border-right:1px solid var(--border)!important; }
    .hero-stats > div:nth-child(3),
    .hero-stats > div:nth-child(4) { border-bottom:none; }
    .hero-badge { display:none!important; }
    .hero-ctas { flex-direction:column; gap:12px!important; }
    .hero-cta-primary, .hero-cta-ghost { width:100%; justify-content:center; }
    .hero-trust { flex-direction:column; align-items:flex-start!important; gap:10px!important; }
    .hero-trust > div { margin:0!important; }
    .hero-trust .sep { display:none; }
  }
  @media (max-width: 479px) {
    .hero-doc-wrap { display:none; }
    .hero-grid { grid-template-columns:1fr; gap:28px; padding-bottom:36px; }
    .hero-section { padding:36px 18px 0; }
    .hero-h1 { font-size:clamp(28px,6vw,44px); line-height:1.05; }
    .hero-stats { grid-template-columns:1fr 1fr; margin:0 -18px; padding:18px; gap:0; }
    .hero-stats > div { padding:16px 12px; }
    .hero-stats > div span:first-child { font-size:clamp(22px,4vw,30px); }
  }
`

export function Hero() {
  const router = useRouter()
  useSR()
  useParallax()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="hero-section">
        {/* Ambient glow effects */}
        <div className="hero-glow" style={{ top: '-10%', left: '5%' }} />
        <div className="hero-glow" style={{ top: '20%', right: '-5%', animationDelay: '2s', background: 'radial-gradient(ellipse,rgba(236,72,153,0.2) 0%,transparent 70%)' }} />
        
        {/* Dot pattern */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle,var(--border) 1px,transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />

        <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>

          {/* LEFT: Copy */}
          <div>
            {/* Badge */}
            <div data-sr style={{ opacity: 0, transform: 'translateY(32px)', transition: 'opacity .7s, transform .7s', display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{ position: 'relative' }}>
                <Image src={logo} alt="EETRA" width={40} height={40} style={{ borderRadius: 10, display: 'block' }} />
                <span style={{ position: 'absolute', inset: -4, borderRadius: 14, border: '2px solid var(--accentS2)', pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 99, background: 'var(--glass-bg)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)' }}>
                <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                  <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-ring 2s ease-out infinite' }} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Version 2026</span>
              </div>
            </div>

            {/* Headline */}
            <h1 data-sr className="hero-h1" style={{ opacity: 0, transform: 'translateY(44px)', transition: 'opacity .85s .1s, transform .85s .1s', fontWeight: 900, lineHeight: .88, letterSpacing: '-.05em', color: 'var(--text)', marginBottom: 24 }}>
              <span style={{ display: 'block' }}>Vos documents</span>
              <span className="gradient-text" style={{ display: 'block', background: 'linear-gradient(135deg,var(--accent) 0%,#A855F7 50%,#EC4899 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradient-shift 5s ease infinite' }}>
                d&apos;exception.
              </span>
              <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, fontSize: '.72em', color: 'var(--text3)', display: 'block', marginTop: 8 }}>En quelques minutes.</span>
            </h1>

            {/* Subtitle */}
            <p data-sr style={{ opacity: 0, transform: 'translateY(32px)', transition: 'opacity .85s .22s, transform .85s .22s', fontSize: 17, lineHeight: 1.75, color: 'var(--text3)', maxWidth: 480, marginBottom: 32 }}>
              Business Plans, Audits, Contrats OHADA, Appels d&apos;Offres — creez des documents de niveau executif avec votre charte graphique, l&apos;IA, et exportez en PDF ou Word.
            </p>

            {/* CTAs */}
            <div data-sr className="hero-ctas" style={{ opacity: 0, transform: 'translateY(32px)', transition: 'opacity .85s .34s, transform .85s .34s', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
              <button onClick={() => router.push('/login')} className="hero-cta-primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '15px 30px', borderRadius: 14, background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 40px var(--electricGlow)' }}>
                Commencer gratuitement <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <button onClick={() => router.push('/designs')} className="hero-cta-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '15px 26px', borderRadius: 14, background: 'var(--glass-bg)', backdropFilter: 'blur(8px)', color: 'var(--text2)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                <Play size={14} fill="currentColor" /> Voir les designs
              </button>
            </div>

            {/* Trust badges */}
            <div data-sr className="hero-trust" style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity .85s .46s, transform .85s .46s', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: <Shield size={14} color="var(--success)" />, text: 'Aucune CB requise' },
                { icon: <Clock size={14} color="var(--success)" />, text: 'Configure en 3 min' },
                { icon: <TrendingUp size={14} color="var(--success)" />, text: '+8 000 documents crees' },
              ].map(({ icon, text }, i) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {i > 0 && <div className="sep" style={{ width: 1, height: 14, background: 'var(--border)', marginRight: 7 }} />}
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                  <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Document mockup */}
          <div className="hero-doc-wrap" data-sr style={{ opacity: 0, transform: 'translateX(56px)', transition: 'opacity 1s .2s, transform 1s .2s' }}>
            {/* Ambient glow behind doc */}
            <div data-p="0.03" style={{ position: 'absolute', top: '10%', left: '5%', right: '5%', bottom: '10%', borderRadius: '50%', background: 'radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

            {/* Background doc */}
            <div style={{ position: 'absolute', top: 50, right: -5, width: 260, height: 360, background: 'var(--surface)', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,.1)', border: '1px solid var(--border)', transform: 'rotate(6deg)', opacity: .4, overflow: 'hidden' }}>
              <div style={{ height: 10, background: 'var(--success)' }} />
              <div style={{ padding: 20 }}>
                {[65, 50, 65, 45].map((w, i) => <div key={i} style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, width: `${w}%`, marginBottom: 10 }} />)}
              </div>
            </div>

            {/* Main document */}
            <div className="hero-doc" style={{ position: 'absolute', top: 0, left: '50%', width: 280, background: 'var(--surface)', borderRadius: 20, boxShadow: '0 32px 100px rgba(0,0,0,.18),0 14px 36px rgba(0,0,0,.12)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', padding: '24px 22px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -30, top: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
                <div style={{ position: 'absolute', left: -20, bottom: -20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, position: 'relative', zIndex: 1 }}>
                  <Image src={logo} alt="EETRA" width={22} height={22} style={{ borderRadius: 5, opacity: .95 }} />
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.2em', color: 'rgba(255,255,255,.7)', textTransform: 'uppercase' }}>ACACIA CONSULTING</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1, position: 'relative', zIndex: 1 }}>BUSINESS<br />PLAN</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', marginTop: 6, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>2026 — 2030 · Confidentiel</div>
              </div>
              
              {/* Content */}
              <div style={{ padding: '18px 20px 22px' }}>
                {/* KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 16 }}>
                  {[['12M', 'Revenus'], ['+34%', 'Croissance'], ['47', 'Effectifs']].map(([v, l]) => (
                    <div key={l} style={{ background: 'var(--bg2)', borderTop: '3px solid var(--accent)', borderRadius: '0 0 8px 8px', padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', letterSpacing: '-.02em' }}>{v}</div>
                      <div style={{ fontSize: 7, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                
                {/* Text lines */}
                {[85, 70, 85, 55].map((w, i) => <div key={i} style={{ height: 5, background: 'var(--bg3)', borderRadius: 2.5, width: `${w}%`, marginBottom: 6 }} />)}
                
                {/* Table */}
                <div style={{ marginTop: 14, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--accent)', padding: '5px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['Exercice', 'CA', 'Marge'].map(h => <span key={h} style={{ fontSize: 6, color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{h}</span>)}
                  </div>
                  {[['2024', '9.2M', '16%'], ['2025', '12M', '21%'], ['2026', '15.6M', '25%']].map(([y, ca, m], i) => (
                    <div key={i} style={{ padding: '4px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: i % 2 ? 'var(--bg2)' : 'var(--surface)' }}>
                      {[y, ca, m].map(c => <span key={c} style={{ fontSize: 7, color: 'var(--text3)' }}>{c}</span>)}
                    </div>
                  ))}
                </div>
                
                {/* Footer */}
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ height: 18, width: 64, borderBottom: '1.5px solid var(--text)' }} />
                    <div style={{ fontSize: 7, color: 'var(--text4)', marginTop: 4 }}>DG — ACACIA</div>
                  </div>
                  <div style={{ width: 32, height: 32, background: 'var(--bg2)', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 5 }}>
                    {[0, 1, 2, 3].map(i => <div key={i} style={{ background: i < 3 ? 'var(--text4)' : 'var(--bg3)', borderRadius: 2 }} />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            {[
              { icon: <Sparkles size={14} color="var(--accent)" />, label: 'PDF exporte', sub: '12 pages · HD', style: { top: 20, right: 20 }, delay: '.4s' },
              { icon: <Shield size={14} color="var(--success)" />, label: 'Contrat finalise', sub: 'Orange Telecom CI', style: { top: 220, left: -20 }, delay: '.8s' },
              { icon: <TrendingUp size={14} color="var(--electric)" />, label: 'IA generee', sub: '3 paragraphes pro', style: { bottom: 100, right: 10 }, delay: '1.2s' },
            ].map((b, i) => (
              <div key={i} className="hero-badge glass-card" style={{
                position: 'absolute', ...b.style,
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 14, whiteSpace: 'nowrap', zIndex: 12,
                opacity: 0, animation: `fadeUp .7s ${b.delay} forwards, float-badge 5.5s ${b.delay} ease-in-out infinite`,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text4)' }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div data-sr className="hero-stats" style={{ opacity: 0, transform: 'translateY(36px)', transition: 'opacity 1s .15s, transform 1s .15s' }}>
          {[
            { n: 8000, s: '+', label: 'Documents crees', sub: 'depuis le lancement' },
            { n: 97, s: '%', label: 'Taux de satisfaction', sub: 'note client 4.9/5' },
            { n: 5, s: 'x', label: 'Plus rapide que Word', sub: 'mise en page auto' },
            { n: 17, s: '', label: 'Pays OHADA', sub: 'cadre juridique unifie' },
          ].map(({ n, s, label, sub }, i) => (
            <div key={label} className="stat-card" style={{
              textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              padding: '16px 24px', borderRadius: 16, cursor: 'default', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 900, letterSpacing: '-.04em', color: 'var(--accent)', lineHeight: 1 }}>
                <AnimatedCounter end={n} suffix={s} />
              </div>
              <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
