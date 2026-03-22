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
  @keyframes float-doc { 0%,100%{transform:translateX(-52%) rotate(-1.5deg) translateY(0px)} 50%{transform:translateX(-52%) rotate(-1.5deg) translateY(-10px)} }
  @keyframes float-badge { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
  @keyframes pulse-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes gradient-text { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

  .hero-section { width:100%; max-width:1200px; margin:0 auto; padding:88px 48px 0; position:relative; overflow:hidden; }
  .hero-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; padding-bottom:80px; }
  .hero-doc-wrap { display:flex; position:relative; justify-content:center; height:540px; }
  .hero-doc { animation:float-doc 7s ease-in-out infinite; }
  .hero-badge { animation:float-badge 4s ease-in-out infinite; }
  .hero-badge:nth-child(2) { animation-delay:.5s; animation-duration:5s; }
  .hero-badge:nth-child(3) { animation-delay:1s; animation-duration:6s; }
  .hero-cta-primary { transition:transform .25s cubic-bezier(.23,1,.32,1),box-shadow .25s; }
  .hero-cta-primary:hover { transform:translateY(-3px)!important; box-shadow:0 16px 48px rgba(27,79,216,.5)!important; }
  .hero-cta-ghost { transition:all .2s; }
  .hero-cta-ghost:hover { border-color:var(--accent)!important; color:var(--accent)!important; transform:translateY(-1px); }
  .stat-card { transition:transform .2s,background .2s; }
  .stat-card:hover { background:var(--bg3)!important; transform:translateY(-2px); }
  .hero-stats { border-top:1px solid var(--border); border-bottom:1px solid var(--border); display:grid; grid-template-columns:repeat(4,1fr); background:var(--bg2); margin:0 -48px; padding:30px 48px; }
  .hero-h1 { font-size:clamp(38px,4.5vw,72px); }

  @media (max-width: 1023px) {
    .hero-grid { grid-template-columns:1fr; gap:40px; padding-bottom:48px; }
    .hero-doc-wrap { height:360px; }
    .hero-section { padding:56px 32px 0; }
    .hero-stats { margin:0 -32px; padding:24px 32px; }
  }
  @media (max-width: 767px) {
    .hero-section { padding:40px 20px 0; }
    .hero-grid { gap:32px; padding-bottom:40px; }
    .hero-doc-wrap { height:280px; }
    .hero-stats { grid-template-columns:1fr 1fr; margin:0 -20px; padding:20px; gap:0; }
    .hero-stats > div { border-right:none!important; padding:16px 12px; border-bottom:1px solid var(--border); }
    .hero-stats > div:nth-child(1),
    .hero-stats > div:nth-child(2) { border-right:1px solid var(--border)!important; }
    .hero-stats > div:nth-child(3),
    .hero-stats > div:nth-child(4) { border-bottom:none; }
    .hero-badge { display:none!important; }
    .hero-ctas { flex-direction:column; gap:10px!important; }
    .hero-cta-primary, .hero-cta-ghost { width:100%; justify-content:center; }
    .hero-trust { flex-direction:column; align-items:flex-start!important; gap:8px!important; }
    .hero-trust > div { margin:0!important; }
    .hero-trust .sep { display:none; }
  }
  @media (max-width: 479px) {
    .hero-doc-wrap { display:none; }
    .hero-grid { grid-template-columns:1fr; }
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
        {/* Background */}
        <div data-p="0.06" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 80% 50% at 20% 40%,rgba(27,79,216,.1) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 85% 65%,rgba(91,155,255,.07) 0%,transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle,rgba(27,79,216,.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>

          {/* LEFT: Copy */}
          <div>
            <div data-sr style={{ opacity: 0, transform: 'translateY(32px)', transition: 'opacity .7s, transform .7s', display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <Image src={logo} alt="EETRA" width={36} height={36} style={{ borderRadius: 9, display: 'block' }} />
                <span style={{ position: 'absolute', inset: -3, borderRadius: 12, border: '1.5px solid rgba(27,79,216,.3)', pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 99, background: 'var(--accentS2)', border: '1px solid rgba(27,79,216,.2)' }}>
                <span style={{ position: 'relative', width: 7, height: 7, flexShrink: 0 }}>
                  <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-ring 2s ease-out infinite' }} />
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>Nouvelle version 2026</span>
              </div>
            </div>

            <h1 data-sr className="hero-h1" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity .8s .1s, transform .8s .1s', fontWeight: 900, lineHeight: .9, letterSpacing: '-.05em', color: 'var(--text)', marginBottom: 20 }}>
              Vos documents<br />
              <span style={{ background: 'linear-gradient(135deg,var(--accent) 0%,#5B9BFF 50%,#7C3AED 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradient-text 4s ease infinite' }}>
                d'exception.
              </span><br />
              <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, fontSize: '.8em', color: 'var(--text3)' }}>En quelques minutes.</span>
            </h1>

            <p data-sr style={{ opacity: 0, transform: 'translateY(28px)', transition: 'opacity .8s .2s, transform .8s .2s', fontSize: 15, lineHeight: 1.72, color: 'var(--text3)', maxWidth: 460, marginBottom: 28 }}>
              Business Plans, Audits, Contrats OHADA, Appels d'Offres — créez des documents de niveau exécutif avec votre charte graphique, l'IA, et exportez en PDF ou Word.
            </p>

            <div data-sr className="hero-ctas" style={{ opacity: 0, transform: 'translateY(28px)', transition: 'opacity .8s .3s, transform .8s .3s', display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <button onClick={() => router.push('/login')} className="hero-cta-primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 26px', borderRadius: 14, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 32px rgba(27,79,216,.35)' }}>
                Commencer gratuitement <ArrowRight size={15} />
              </button>
              <button onClick={() => router.push('/designs')} className="hero-cta-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 22px', borderRadius: 14, background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border2)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Voir les designs →
              </button>
            </div>

            <div data-sr className="hero-trust" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity .8s .42s, transform .8s .42s', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {[
                { icon: <Shield size={12} color="var(--success)" />, text: 'Aucune CB requise' },
                { icon: <Clock size={12} color="var(--success)" />, text: 'Configuré en 3 min' },
                { icon: <TrendingUp size={12} color="var(--success)" />, text: '+8 000 documents créés' },
              ].map(({ icon, text }, i) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {i > 0 && <div className="sep" style={{ width: 1, height: 12, background: 'var(--border)', marginRight: 5 }} />}
                  {icon}
                  <span style={{ fontSize: 12, color: 'var(--text4)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Document mockup */}
          <div className="hero-doc-wrap" data-sr style={{ opacity: 0, transform: 'translateX(48px)', transition: 'opacity .9s .2s, transform .9s .2s' }}>
            <div data-p="0.04" style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '5%', borderRadius: '50%', background: 'rgba(27,79,216,.14)', filter: 'blur(44px)', pointerEvents: 'none' }} />

            {/* Background doc */}
            <div style={{ position: 'absolute', top: 40, right: -10, width: 240, height: 340, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.09)', border: '1px solid #E8E8E8', transform: 'rotate(5deg)', opacity: .5, overflow: 'hidden' }}>
              <div style={{ height: 8, background: '#059669' }} />
              <div style={{ padding: 18 }}>
                {[60, 45, 60, 40].map((w, i) => <div key={i} style={{ height: 5, background: '#F0F0F0', borderRadius: 3, width: `${w}%`, marginBottom: 8 }} />)}
              </div>
            </div>

            {/* Main doc */}
            <div className="hero-doc" style={{ position: 'absolute', top: 0, left: '50%', width: 260, background: '#fff', borderRadius: 16, boxShadow: '0 28px 88px rgba(0,0,0,.2),0 10px 28px rgba(0,0,0,.1)', border: '1px solid #E0E4EF', overflow: 'hidden' }}>
              <div style={{ background: '#1B4FD8', padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                  <Image src={logo} alt="EETRA" width={20} height={20} style={{ borderRadius: 4, opacity: .9 }} />
                  <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '.18em', color: 'rgba(255,255,255,.7)', textTransform: 'uppercase' }}>ACACIA CONSULTING</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1, position: 'relative', zIndex: 1 }}>BUSINESS<br />PLAN</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.5)', marginTop: 5, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>2026 — 2030 · Confidentiel</div>
              </div>
              <div style={{ padding: '14px 16px 18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 12 }}>
                  {[['12M', 'Revenus'], ['+34%', 'Croissance'], ['47', 'Effectifs']].map(([v, l]) => (
                    <div key={l} style={{ background: '#F5F7FA', borderTop: '2.5px solid #1B4FD8', borderRadius: '0 0 6px 6px', padding: '6px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#111', letterSpacing: '-.02em' }}>{v}</div>
                      <div style={{ fontSize: 6, color: '#999', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 1 }}>{l}</div>
                    </div>
                  ))}
                </div>
                {[80, 65, 80, 50].map((w, i) => <div key={i} style={{ height: 4, background: '#F0F0F0', borderRadius: 2, width: `${w}%`, marginBottom: 5 }} />)}
                <div style={{ marginTop: 10, border: '1px solid #E8E8E8', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ background: '#1B4FD8', padding: '4px 7px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['Exercice', 'CA', 'Marge'].map(h => <span key={h} style={{ fontSize: 5.5, color: 'rgba(255,255,255,.8)', fontWeight: 700 }}>{h}</span>)}
                  </div>
                  {[['2024', '9.2M', '16%'], ['2025', '12M', '21%'], ['2026', '15.6M', '25%']].map(([y, ca, m], i) => (
                    <div key={i} style={{ padding: '3px 7px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: i % 2 ? '#F8F9FB' : '#fff' }}>
                      {[y, ca, m].map(c => <span key={c} style={{ fontSize: 6, color: '#555' }}>{c}</span>)}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, borderTop: '1px solid #F0F0F0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ height: 16, width: 56, borderBottom: '1px solid #333' }} />
                    <div style={{ fontSize: 6.5, color: '#999', marginTop: 3 }}>DG — ACACIA</div>
                  </div>
                  <div style={{ width: 28, height: 28, background: '#F5F5F5', borderRadius: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, padding: 4 }}>
                    {[0, 1, 2, 3].map(i => <div key={i} style={{ background: i < 3 ? '#CCC' : '#E8E8E8', borderRadius: 1.5 }} />)}
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