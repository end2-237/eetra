'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import logo from '../../app/icon.png'
import { ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react'

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
  @keyframes float-doc { 0%,100%{transform:translateX(-52%) rotate(-2deg) translateY(0px)} 50%{transform:translateX(-52%) rotate(-2deg) translateY(-14px)} }
  @keyframes float-badge { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
  @keyframes pulse-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes gradient-text { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes glow { 0%,100%{opacity:1} 50%{opacity:.8} }

  .hero-section { width:100%; padding:120px 48px 80px; position:relative; overflow:hidden; }
  .hero-grid { display:grid; grid-template-columns:1fr 1.05fr; gap:80px; align-items:flex-start; padding-bottom:60px; max-width:1400px; margin:0 auto; }
  .hero-doc-wrap { display:flex; position:relative; justify-content:center; height:580px; }
  .hero-doc { animation:float-doc 7.5s ease-in-out infinite; filter:drop-shadow(0 32px 64px rgba(27,79,216,.25)); }
  .hero-badge { animation:float-badge 4.5s ease-in-out infinite; }
  .hero-badge:nth-child(2) { animation-delay:.6s; animation-duration:5.2s; }
  .hero-badge:nth-child(3) { animation-delay:1.2s; animation-duration:6.3s; }
  .hero-cta-primary { transition:transform .3s cubic-bezier(.23,1,.32,1),box-shadow .3s,background .3s; }
  .hero-cta-primary:hover { transform:translateY(-4px) scale(1.01)!important; box-shadow:0 24px 64px rgba(27,79,216,.4)!important; }
  .hero-cta-ghost { transition:all .3s cubic-bezier(.23,1,.32,1); }
  .hero-cta-ghost:hover { border-color:var(--accent)!important; color:var(--accent)!important; background:var(--accentS2)!important; transform:translateY(-2px); }
  .stat-card { transition:transform .3s cubic-bezier(.23,1,.32,1),background .3s,border-color .3s; cursor:pointer; }
  .stat-card:hover { background:var(--surface)!important; transform:translateY(-4px)!important; border-color:var(--accent)!important; }
  .hero-stats { border-top:none; border-bottom:none; display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:56px; padding:0; }
  .hero-h1 { font-size:clamp(42px,5.5vw,76px); line-height:0.95; letter-spacing:-.06em; }

  @media (max-width: 1023px) {
    .hero-section { padding:100px 40px 60px; }
    .hero-grid { grid-template-columns:1fr; gap:56px; padding-bottom:48px; }
    .hero-doc-wrap { height:460px; }
    .hero-stats { grid-template-columns:repeat(2,1fr); gap:12px; margin-top:48px; }
  }
  @media (max-width: 768px) {
    .hero-section { padding:80px 24px 48px; }
    .hero-grid { gap:40px; padding-bottom:32px; }
    .hero-doc-wrap { height:380px; }
    .hero-h1 { font-size:clamp(32px,6vw,48px); line-height:1.05; letter-spacing:-.04em; }
    .hero-stats { grid-template-columns:1fr 1fr; gap:10px; margin-top:40px; }
    .hero-stats > div { padding:20px 16px!important; border-radius:12px!important; border:1px solid var(--border)!important; background:var(--surface)!important; }
    .hero-badge { display:none!important; }
    .hero-ctas { flex-direction:column; gap:12px!important; width:100%; }
    .hero-cta-primary, .hero-cta-ghost { width:100%; justify-content:center; padding:14px 24px!important; font-size:15px!important; border-radius:12px!important; }
    .hero-trust { flex-direction:column; align-items:flex-start!important; gap:12px!important; }
    .hero-trust > div { margin:0!important; }
    .hero-trust .sep { display:none; }
  }
  @media (max-width: 640px) {
    .hero-doc-wrap { display:none; }
    .hero-grid { grid-template-columns:1fr; gap:32px; padding-bottom:24px; }
    .hero-section { padding:60px 16px 40px; }
    .hero-h1 { font-size:clamp(28px,7vw,40px); line-height:1.1; }
    .hero-stats { grid-template-columns:1fr 1fr; gap:10px; margin-top:32px; }
    .hero-stats > div { padding:16px 12px!important; font-size:13px!important; }
    .hero-stats > div span:first-child { font-size:clamp(18px,4vw,24px); }
  }
  @media (max-width: 420px) {
    .hero-section { padding:48px 12px 32px; }
    .hero-h1 { font-size:clamp(24px,6vw,32px); }
    .hero-ctas { gap:10px; }
    .hero-cta-primary, .hero-cta-ghost { font-size:13px!important; padding:12px 16px!important; }
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
        {/* Background - More expansive gradients */}
        <div data-p="0.04" style={{ position: 'absolute', top: '-30%', left: '-20%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(27,79,216,.15) 0%,transparent 70%)', pointerEvents: 'none', filter: 'blur(80px)' }} />
        <div data-p="0.06" style={{ position: 'absolute', top: '20%', right: '-15%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(91,155,255,.1) 0%,transparent 70%)', pointerEvents: 'none', filter: 'blur(100px)' }} />
        <div data-p="0.05" style={{ position: 'absolute', bottom: '-10%', left: '40%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(124,58,237,.08) 0%,transparent 70%)', pointerEvents: 'none', filter: 'blur(80px)' }} />

        <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>

          {/* LEFT: Copy */}
          <div style={{ paddingTop: 16 }}>
            <div data-sr style={{ opacity: 0, transform: 'translateY(32px)', transition: 'opacity .7s, transform .7s', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
              <div style={{ position: 'relative' }}>
                <Image src={logo} alt="EETRA" width={40} height={40} style={{ borderRadius: 10, display: 'block' }} />
                <span style={{ position: 'absolute', inset: -4, borderRadius: 14, border: '2px solid rgba(27,79,216,.3)', pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'var(--accentS2)', border: '1px solid rgba(27,79,216,.25)', backdropFilter: 'blur(8px)' }}>
                <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                  <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-ring 2.2s ease-out infinite' }} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>Nouvelle version 2026</span>
              </div>
            </div>

            <h1 data-sr className="hero-h1" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity .8s .1s, transform .8s .1s', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-.06em', color: 'var(--text)', marginBottom: 32 }}>
              Vos documents<br />
              <span style={{ background: 'linear-gradient(135deg,var(--accent) 0%,#5B9BFF 50%,#7C3AED 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradient-text 4s ease infinite' }}>
                d'exception.
              </span><br />
              <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, fontSize: '.75em', color: 'var(--text4)', letterSpacing: '-.02em' }}>En quelques minutes.</span>
            </h1>

            <p data-sr style={{ opacity: 0, transform: 'translateY(28px)', transition: 'opacity .8s .2s, transform .8s .2s', fontSize: 16, lineHeight: 1.8, color: 'var(--text3)', maxWidth: 500, marginBottom: 40 }}>
              Business Plans, Audits, Contrats OHADA, Appels d'Offres — créez des documents de niveau exécutif avec votre charte graphique, l'IA, et exportez en PDF ou Word.
            </p>

            <div data-sr className="hero-ctas" style={{ opacity: 0, transform: 'translateY(28px)', transition: 'opacity .8s .3s, transform .8s .3s', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
              <button onClick={() => router.push('/login')} className="hero-cta-primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '16px 32px', borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 40px rgba(27,79,216,.4)', letterSpacing: '-.02em' }}>
                Commencer gratuitement <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <button onClick={() => router.push('/designs')} className="hero-cta-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 28px', borderRadius: 12, background: 'var(--surface)', color: 'var(--text2)', border: '1.5px solid var(--border2)', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '-.01em' }}>
                Voir les designs
              </button>
            </div>

            <div data-sr className="hero-trust" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity .8s .42s, transform .8s .42s', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginTop: 4 }}>
              {[
                { icon: <Shield size={13} color="var(--success)" strokeWidth={2} />, text: 'Aucune CB requise' },
                { icon: <Clock size={13} color="var(--success)" strokeWidth={2} />, text: 'Configuré en 3 min' },
                { icon: <TrendingUp size={13} color="var(--success)" strokeWidth={2} />, text: '+8 000 documents créés' },
              ].map(({ icon, text }, i) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {i > 0 && <div className="sep" style={{ width: 1, height: 14, background: 'var(--border)', marginRight: 4 }} />}
                  <div style={{ opacity: 0.85 }}>{icon}</div>
                  <span style={{ fontSize: 13, color: 'var(--text4)', fontWeight: 600 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Document mockup */}
          <div className="hero-doc-wrap" data-sr style={{ opacity: 0, transform: 'translateX(48px)', transition: 'opacity .9s .2s, transform .9s .2s', paddingTop: 20 }}>
            <div data-p="0.04" style={{ position: 'absolute', top: '10%', left: '15%', right: '5%', bottom: '10%', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(27,79,216,.22) 0%,transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            {/* Background doc */}
            <div style={{ position: 'absolute', top: 32, right: 0, width: 240, height: 340, background: '#fff', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,.12)', border: '1px solid #E8E8E8', transform: 'rotate(6deg)', opacity: .55, overflow: 'hidden' }}>
              <div style={{ height: 10, background: '#059669' }} />
              <div style={{ padding: 20 }}>
                {[65, 50, 65, 45].map((w, i) => <div key={i} style={{ height: 6, background: '#F0F0F0', borderRadius: 3, width: `${w}%`, marginBottom: 10 }} />)}
              </div>
            </div>

            {/* Main doc - More prominent */}
            <div className="hero-doc" style={{ position: 'absolute', top: 0, left: '50%', width: 280, background: '#fff', borderRadius: 18, boxShadow: '0 40px 100px rgba(0,0,0,.22),0 16px 40px rgba(0,0,0,.12)', border: '1px solid #DDE4F0', overflow: 'hidden' }}>
              <div style={{ background: '#1B4FD8', padding: '22px 22px 18px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -24, top: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, position: 'relative', zIndex: 1 }}>
                  <Image src={logo} alt="EETRA" width={22} height={22} style={{ borderRadius: 5, opacity: .95 }} />
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.2em', color: 'rgba(255,255,255,.75)', textTransform: 'uppercase' }}>ACACIA CONSULTING</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-.03em', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>BUSINESS<br />PLAN</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', marginTop: 6, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>2026 — 2030 · Confidentiel</div>
              </div>
              <div style={{ padding: '16px 18px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
                  {[['12M', 'Revenus'], ['+34%', 'Croissance'], ['47', 'Effectifs']].map(([v, l]) => (
                    <div key={l} style={{ background: '#F5F7FA', borderTop: '3px solid #1B4FD8', borderRadius: '2px 2px 7px 7px', padding: '7px 5px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#111', letterSpacing: '-.03em' }}>{v}</div>
                      <div style={{ fontSize: 7, color: '#999', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 2, fontWeight: 600 }}>{l}</div>
                    </div>
                  ))}
                </div>
                {[80, 65, 80, 50].map((w, i) => <div key={i} style={{ height: 5, background: '#F0F0F0', borderRadius: 2.5, width: `${w}%`, marginBottom: 6 }} />)}
                <div style={{ marginTop: 12, border: '1px solid #E8E8E8', borderRadius: 7, overflow: 'hidden' }}>
                  <div style={{ background: '#1B4FD8', padding: '5px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['Exercice', 'CA', 'Marge'].map(h => <span key={h} style={{ fontSize: 6.5, color: 'rgba(255,255,255,.85)', fontWeight: 700, letterSpacing: '.05em' }}>{h}</span>)}
                  </div>
                  {[['2024', '9.2M', '16%'], ['2025', '12M', '21%'], ['2026', '15.6M', '25%']].map(([y, ca, m], i) => (
                    <div key={i} style={{ padding: '4px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: i % 2 ? '#F8F9FB' : '#fff' }}>
                      {[y, ca, m].map(c => <span key={c} style={{ fontSize: 7, color: '#555', fontWeight: 500 }}>{c}</span>)}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, borderTop: '1px solid #F0F0F0', paddingTop: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ height: 17, width: 58, borderBottom: '1.5px solid #333' }} />
                    <div style={{ fontSize: 7.5, color: '#999', marginTop: 3, fontWeight: 600 }}>DG — ACACIA</div>
                  </div>
                  <div style={{ width: 30, height: 30, background: '#F5F5F5', borderRadius: 5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 4.5 }}>
                    {[0, 1, 2, 3].map(i => <div key={i} style={{ background: i < 3 ? '#CCC' : '#E8E8E8', borderRadius: 2 }} />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            {[
              { icon: '📄', label: 'PDF exporté', sub: '12 pages · Haute qualité', style: { top: 16, right: 14 }, delay: '.3s' },
              { icon: '✅', label: 'Contrat finalisé', sub: 'Orange Telecom CI', style: { top: 200, left: -10 }, delay: '.65s' },
              { icon: '🤖', label: 'IA générée', sub: '3 paragraphes pro', style: { bottom: 80, right: 4 }, delay: '1s' },
            ].map((b, i) => (
              <div key={i} className="hero-badge" style={{
                position: 'absolute', ...b.style,
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,.13)', whiteSpace: 'nowrap', zIndex: 12,
                opacity: 0, animation: `fadeUp .7s ${b.delay} forwards, float-badge 5s ${b.delay} ease-in-out infinite`,
                backdropFilter: 'blur(10px)',
              }}>
                <span style={{ fontSize: 16 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{b.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--text4)' }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div data-sr className="hero-stats" style={{ opacity: 0, transform: 'translateY(32px)', transition: 'opacity .9s .1s, transform .9s .1s' }}>
          {[
            { n: 8000, s: '+', label: 'Documents créés', sub: 'depuis le lancement' },
            { n: 97, s: '%', label: 'Taux de satisfaction', sub: 'note client 4.9/5' },
            { n: 5, s: '×', label: 'Plus rapide que Word', sub: 'mise en page auto' },
            { n: 17, s: '', label: 'Pays OHADA', sub: 'cadre juridique unifié' },
          ].map(({ n, s, label, sub }, i) => (
            <div key={label} className="stat-card" style={{
              textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              padding: '12px 20px', borderRadius: 12, cursor: 'default',
            }}>
              <div style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-.04em', color: 'var(--accent)', lineHeight: 1 }}>
                <AnimatedCounter end={n} suffix={s} />
              </div>
              <div style={{ fontSize: 'clamp(11px,1.5vw,13px)', fontWeight: 700, color: 'var(--text2)', marginTop: 6 }}>{label}</div>
              <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
