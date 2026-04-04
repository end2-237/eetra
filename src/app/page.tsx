'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowRight, Zap, Shield, FileText, Users, Download, BarChart3, ChevronDown, Check, X, Star, Globe, Lock, Sparkles, Play, TrendingUp, Clock, Award, Menu } from 'lucide-react'
import logo from './icon.png'
// ─── CSS Variables & Global Styles ────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --bg: #06070A;
      --bg2: #0C0E14;
      --bg3: #111420;
      --surface: rgba(255,255,255,0.04);
      --surface2: rgba(255,255,255,0.07);
      --border: rgba(255,255,255,0.08);
      --border2: rgba(255,255,255,0.14);
      --text: #F0F2FF;
      --text2: #A8ADBF;
      --text3: #6B7094;
      --accent: #5B7FFF;
      --accent2: #7C6FFF;
      --green: #2DD4BF;
      --pink: #F472B6;
      --amber: #FBBF24;
      --glow: rgba(91,127,255,0.15);
      --glow2: rgba(124,111,255,0.1);
      --font: 'Outfit', sans-serif;
      --mono: 'JetBrains Mono', monospace;
      --serif: 'Instrument Serif', serif;
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
      --r: 12px;
      --r2: 20px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font); background: var(--bg); color: var(--text); overflow-x: hidden; -webkit-font-smoothing: antialiased; }

    .sr-hidden { opacity: 0; transform: translateY(32px); transition: opacity 0.8s var(--ease), transform 0.8s var(--ease); }
    .sr-hidden.visible { opacity: 1; transform: translateY(0); }
    .sr-left { opacity: 0; transform: translateX(-32px); transition: opacity 0.8s var(--ease), transform 0.8s var(--ease); }
    .sr-left.visible { opacity: 1; transform: translateX(0); }
    .sr-scale { opacity: 0; transform: scale(0.94); transition: opacity 0.8s var(--ease), transform 0.8s var(--ease); }
    .sr-scale.visible { opacity: 1; transform: scale(1); }

    @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
    @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
    @keyframes spin-slow { to{transform:rotate(360deg)} }
    @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes counter { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

    .gradient-text {
      background: linear-gradient(135deg, #fff 0%, var(--accent) 50%, var(--green) 100%);
      background-size: 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradient-x 6s ease infinite;
    }

    .card-glow {
      position: relative;
      border: 1px solid var(--border);
      background: var(--surface);
      backdrop-filter: blur(20px);
      border-radius: var(--r2);
      transition: border-color 0.3s, transform 0.3s var(--ease), box-shadow 0.3s;
    }
    .card-glow:hover {
      border-color: var(--border2);
      transform: translateY(-4px);
      box-shadow: 0 24px 80px rgba(91,127,255,0.12);
    }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 28px;
      background: var(--accent);
      color: #fff; border: none; border-radius: var(--r);
      font-family: var(--font); font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.25s var(--ease);
      position: relative; overflow: hidden;
      white-space: nowrap;
    }
    .btn-primary::before {
      content:''; position:absolute; inset:0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(91,127,255,0.4); }
    .btn-primary:hover::before { opacity: 1; }

    .btn-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 24px;
      background: transparent; color: var(--text2);
      border: 1px solid var(--border2);
      border-radius: var(--r); font-family: var(--font); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.25s var(--ease); white-space: nowrap;
    }
    .btn-ghost:hover { border-color: rgba(255,255,255,0.3); color: var(--text); background: var(--surface2); }

    .noise { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.025;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: rgba(91,127,255,0.3); border-radius: 2px; }

    section { position: relative; }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }
  `}</style>
)

// ─── Scroll Observer Hook ─────────────────────────────────────────────────────
function useScrollObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    )
    document.querySelectorAll('.sr-hidden,.sr-left,.sr-scale').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ end, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = performance.now()
        const tick = now => {
          const p = Math.min((now - t0) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 4)
          setCount(Math.floor(ease * end))
          if (p < 1) requestAnimationFrame(tick); else setCount(end)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])
  return <span ref={ref}>{prefix}{count.toLocaleString('fr-FR')}{suffix}</span>
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: scrolled ? '12px 0' : '20px 0',
      transition: 'all 0.4s var(--ease)',
      background: scrolled ? 'rgba(6,7,10,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logo} alt="" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>EETRA</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', background: 'rgba(91,127,255,0.15)', color: 'var(--accent)', borderRadius: 99, border: '1px solid rgba(91,127,255,0.25)', letterSpacing: '0.08em' }}>2026</span>
        </div>

        {/* Desktop nav */}
        <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {['Fonctionnalités', 'Templates', 'Designs', 'Tarifs', 'FAQ'].map(item => (
            <button key={item} style={{ padding: '8px 16px', background: 'none', border: 'none', color: 'var(--text3)', fontSize: 14, fontWeight: 500, cursor: 'pointer', borderRadius: 8, fontFamily: 'var(--font)', transition: 'color 0.2s, background 0.2s' }}
              onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'var(--surface)' }}
              onMouseLeave={e => { e.target.style.color = 'var(--text3)'; e.target.style.background = 'none' }}>
              {item}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost hide-mobile" style={{ padding: '9px 18px', fontSize: 13 }}>Se connecter</button>
          <button className="btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>
            Démarrer <ArrowRight size={14} />
          </button>
          <button className="hide-mobile" style={{ display: 'none' }} />
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text)' }}
            className="mobile-menu-btn">
            <Menu size={18} />
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  const canvasRef = useRef(null)
  const [typed, setTyped] = useState('')
  const words = ['Business Plans', 'Audits', 'Contrats OHADA', 'Appels d\'Offres']
  const wordIdx = useRef(0)
  const charIdx = useRef(0)
  const deleting = useRef(false)
  const timeout = useRef(null)

  useEffect(() => {
    const tick = () => {
      const word = words[wordIdx.current]
      if (!deleting.current) {
        setTyped(word.slice(0, ++charIdx.current))
        if (charIdx.current === word.length) { deleting.current = true; timeout.current = setTimeout(tick, 1800); return }
      } else {
        setTyped(word.slice(0, --charIdx.current))
        if (charIdx.current === 0) { deleting.current = false; wordIdx.current = (wordIdx.current + 1) % words.length }
      }
      timeout.current = setTimeout(tick, deleting.current ? 40 : 80)
    }
    timeout.current = setTimeout(tick, 600)
    return () => clearTimeout(timeout.current)
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.5 + 0.1
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(91,127,255,${p.o})`; ctx.fill()
      })
      particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(91,127,255,${0.08 * (1 - d / 100)})`; ctx.stroke()
        }
      }))
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Radial glows */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(91,127,255,0.12) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse-glow 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '40%', left: '20%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(45,212,191,0.07) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse-glow 8s ease-in-out infinite 2s' }} />
      <div style={{ position: 'absolute', top: '30%', right: '15%', width: 350, height: 350, background: 'radial-gradient(ellipse, rgba(244,114,182,0.06) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse-glow 7s ease-in-out infinite 4s' }} />

      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 900, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div className="sr-hidden" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(91,127,255,0.1)', border: '1px solid rgba(91,127,255,0.2)', borderRadius: 99, marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulse-glow 2s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Document Intelligence · Afrique de l'Ouest</span>
        </div>

        {/* Headline */}
        <h1 className="sr-hidden" style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, color: 'var(--text)', marginBottom: 24 }}>
          <span style={{ display: 'block' }}>Créez des</span>
          <span style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 400, fontStyle: 'italic', fontSize: '1.1em', color: 'var(--text2)' }}>
            {typed}<span style={{ animation: 'blink 1s infinite', display: 'inline-block', width: 3, height: '0.9em', background: 'var(--accent)', marginLeft: 3, borderRadius: 1, verticalAlign: 'text-bottom' }} />
          </span>
          <span style={{ display: 'block' }}>
            <span className="gradient-text">de niveau exécutif.</span>
          </span>
        </h1>

        {/* Subline */}
        <p className="sr-hidden" style={{ fontSize: 18, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px', transitionDelay: '0.1s' }}>
          La plateforme B2B qui transforme vos idées en documents professionnels — avec IA, charte graphique, cadre OHADA et export PDF·Word.
        </p>

        {/* CTAs */}
        <div className="sr-hidden" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56, transitionDelay: '0.2s' }}>
          <button className="btn-primary" style={{ fontSize: 15, padding: '16px 32px' }}>
            Commencer gratuitement <ArrowRight size={16} />
          </button>
          <button className="btn-ghost" style={{ fontSize: 15, padding: '15px 28px' }}>
            <Play size={14} fill="currentColor" /> Voir la démo
          </button>
        </div>

        {/* Social proof */}
        <div className="sr-hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap', transitionDelay: '0.3s' }}>
          {[
            { icon: <Shield size={14} />, text: 'Aucune CB requise' },
            { icon: <Clock size={14} />, text: 'Setup en 3 min' },
            { icon: <Star size={14} />, text: '+500 entreprises' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 13 }}>
              <span style={{ color: 'var(--accent)' }}>{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>

      {/* Hero mockup */}
      <div className="sr-scale" style={{ maxWidth: 900, width: '100%', marginTop: 64, position: 'relative', transitionDelay: '0.4s' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
          {/* Window bar */}
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '5px 12px', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={10} /> eetra.app/editor
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-primary" style={{ padding: '5px 12px', fontSize: 11, gap: 4 }}>
                <Download size={11} /> Exporter
              </button>
            </div>
          </div>

          {/* Editor layout */}
          <div style={{ display: 'flex', height: 420 }}>
            {/* Sidebar */}
            <div style={{ width: 220, borderRight: '1px solid var(--border)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text3)', padding: '0 8px', marginBottom: 6 }}>Structure</div>
              {[
                { label: 'Résumé Exécutif', active: true },
                { label: 'Analyse Marché', active: false },
                { label: 'Projections', active: false },
                { label: 'Équipe', active: false },
              ].map(({ label, active }) => (
                <div key={label} style={{ padding: '8px 10px', borderRadius: 8, background: active ? 'rgba(91,127,255,0.15)' : 'transparent', border: active ? '1px solid rgba(91,127,255,0.2)' : '1px solid transparent', color: active ? 'var(--accent)' : 'var(--text3)', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer' }}>
                  {label}
                </div>
              ))}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ padding: '10px', borderRadius: 10, background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.15)', textAlign: 'center' }}>
                  <Sparkles size={14} color="var(--accent)" style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>IA Rédactionnelle</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>Générer intro</div>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, background: '#1a1c26', padding: 20, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ width: '100%', maxWidth: 340, background: '#fff', borderRadius: 4, padding: '24px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#111' }}>
                <div style={{ background: 'linear-gradient(135deg, #1B4FD8, #5B7FFF)', margin: '-24px -20px 16px', padding: '16px 20px', borderRadius: '4px 4px 0 0' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>ACACIA CONSULTING · CONFIDENTIEL</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>BUSINESS PLAN<br/>2026 — 2030</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                  {[['12M', 'CA'], ['+34%', 'Croissance'], ['47', 'Effectifs']].map(([v, l]) => (
                    <div key={l} style={{ background: '#F5F7FB', borderTop: '3px solid #1B4FD8', borderRadius: '0 0 6px 6px', padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#0D1117' }}>{v}</div>
                      <div style={{ fontSize: 7, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {[90, 75, 85, 60].map((w, i) => (
                  <div key={i} style={{ height: 6, background: '#F0F0F0', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${w}%`, background: i === 0 ? '#1B4FD8' : '#E8ECFB', borderRadius: 3 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div style={{ width: 200, borderLeft: '1px solid var(--border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text3)', padding: '0 4px', marginBottom: 4 }}>Propriétés</div>
              {[['Couleur', '#1B4FD8'], ['Design', 'Classic'], ['Police', 'Outfit']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--surface)', borderRadius: 6, fontSize: 11 }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, fontFamily: k === 'Couleur' ? 'var(--mono)' : 'inherit' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: 10, background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>Score IA</div>
                <div style={{ height: 6, background: 'rgba(45,212,191,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '87%', background: 'var(--green)', borderRadius: 3, transition: 'width 1s var(--ease)' }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3 }}>87% · Document complet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        {[
          { text: 'PDF exporté · 12 pages', sub: 'Il y a 2 min', color: '#2DD4BF', icon: <Download size={12} />, style: { top: -20, left: -20 } },
          { text: 'Contrat signé', sub: 'Orange Telecom CI', color: '#5B7FFF', icon: <Check size={12} />, style: { bottom: 40, right: -20 } },
        ].map(({ text, sub, color, icon, style }) => (
          <div key={text} style={{
            position: 'absolute', ...style,
            background: 'rgba(6,7,10,0.9)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'float 5s ease-in-out infinite',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{text}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        <span>Défiler</span>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--text3), transparent)' }} />
      </div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
        {[
          { value: 8000, suffix: '+', label: 'Documents créés', icon: <FileText size={20} /> },
          { value: 500, suffix: '+', label: 'Entreprises actives', icon: <Globe size={20} /> },
          { value: 99, suffix: '%', label: 'Satisfaction client', icon: <Star size={20} /> },
          { value: 3, suffix: ' min', label: 'Setup initial', icon: <Zap size={20} /> },
        ].map(({ value, suffix, label, icon }) => (
          <div key={label} className="sr-hidden" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--accent)', marginBottom: 10, opacity: 0.7 }}>{icon}</div>
            <div style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 6 }}>
              <Counter end={value} suffix={suffix} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features Bento ───────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: <Zap size={24} />, title: 'IA Rédactionnelle',
      desc: 'Génération d\'introductions professionnelles, reformulation corporate, suggestions contextuelles.',
      color: 'var(--accent)', span: 2,
      badge: 'GPT-4 Turbo + Claude',
      visual: (
        <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 12, fontFamily: 'var(--mono)', fontSize: 11 }}>
          <div style={{ color: 'var(--text3)', marginBottom: 6 }}>// Génération en cours...</div>
          <div style={{ color: 'var(--green)' }}>→ "Dans un contexte de croissance soutenue,</div>
          <div style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            votre entreprise se positionne comme<span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--green)', borderRadius: 1, animation: 'blink 1s infinite', marginLeft: 2 }} />
          </div>
        </div>
      )
    },
    {
      icon: <Shield size={24} />, title: 'Cadre OHADA',
      desc: '17 pays membres, clauses conformes, contrats certifiés.',
      color: 'var(--pink)', span: 1,
      badge: '17 pays',
    },
    {
      icon: <Download size={24} />, title: 'Export PDF & Word',
      desc: 'PDF haute résolution A4, .docx Microsoft Word éditable.',
      color: 'var(--green)', span: 1,
      badge: 'Instant',
    },
    {
      icon: <BarChart3 size={24} />, title: 'Analytics Temps Réel',
      desc: 'Score de complétude, répartition des blocs, KPIs documentaires.',
      color: 'var(--amber)', span: 1,
      badge: 'Live',
    },
    {
      icon: <Users size={24} />, title: 'Collaboration Équipe',
      desc: 'Curseurs en temps réel, annotations, gestion des rôles et accès.',
      color: 'var(--accent2)', span: 2,
      badge: 'Realtime',
    },
  ]

  return (
    <section id="features" style={{ padding: '120px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="sr-hidden" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.15)', borderRadius: 99, marginBottom: 20 }}>
            <Sparkles size={12} color="var(--accent)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Fonctionnalités</span>
          </div>
          <h2 className="sr-hidden" style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 0.95, transitionDelay: '0.1s' }}>
            Tout ce qu'une direction
            <br /><span style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontStyle: 'italic', color: 'var(--text2)' }}>a besoin.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, gridTemplateRows: 'auto auto' }}>
          {features.map(({ icon, title, desc, color, span, badge, visual }, i) => (
            <div key={title} className="sr-hidden card-glow" style={{
              gridColumn: `span ${span}`, padding: 28, transitionDelay: `${i * 0.07}s`,
              background: `linear-gradient(135deg, rgba(6,7,10,0.8), var(--bg3))`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  {icon}
                </div>
                {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', background: `${color}15`, color, borderRadius: 99, border: `1px solid ${color}25`, letterSpacing: '0.06em' }}>{badge}</span>}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65 }}>{desc}</p>
              {visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Marquee Banner ───────────────────────────────────────────────────────────
function MarqueeBanner() {
  const items = ['Business Plan', 'Rapport d\'Audit', 'Appel d\'Offres', 'Contrat OHADA', 'Note de Direction', 'Devis Pro', 'Export PDF', 'Export Word', 'IA Rédactionnelle']
  const doubled = [...items, ...items]
  return (
    <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--bg2), var(--bg3))', padding: '16px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', width: '200%', animation: 'marquee 30s linear infinite' }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: i % 2 === 0 ? 'var(--text2)' : 'var(--text3)', letterSpacing: '0.08em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{item}</span>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', opacity: 0.4, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Designs Showcase ─────────────────────────────────────────────────────────
function DesignsShowcase() {
  const designs = [
    { name: 'Classic', color: '#1B4FD8' },
    { name: 'Bold', color: '#7C3AED' },
    { name: 'Minimal', color: '#374151' },
    { name: 'Split', color: '#059669' },
    { name: 'Editorial', color: '#B45309' },
  ]

  return (
    <section id="designs" style={{ padding: '120px 24px', background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="sr-left" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.15)', borderRadius: 99, marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>9 designs A4</span>
            </div>
            <h2 className="sr-left" style={{ fontSize: 'clamp(28px, 3.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 0.95, transitionDelay: '0.1s' }}>
              Votre document,<br />
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontStyle: 'italic', color: 'var(--text2)' }}>votre signature.</span>
            </h2>
          </div>
          <button className="btn-ghost sr-left" style={{ transitionDelay: '0.2s' }}>
            Voir tous <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {designs.map(({ name, color }, i) => (
            <div key={name} className="sr-hidden" style={{ transitionDelay: `${i * 0.08}s`, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.querySelector('.doc-preview').style.transform = 'scale(1.03) translateY(-8px)'}
              onMouseLeave={e => e.currentTarget.querySelector('.doc-preview').style.transform = 'scale(1) translateY(0)'}>
              <div className="doc-preview" style={{ background: '#fff', borderRadius: 8, aspectRatio: '0.707', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', transition: 'transform 0.4s var(--ease)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                {/* Cover mini */}
                <div style={{ background: color, height: '45%', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-20%', top: '-20%', width: '60%', height: '60%', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 10px' }}>
                    <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>EETRA DOC</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>BUSINESS<br />PLAN 2026</div>
                  </div>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  {[85, 70, 90, 60].map((w, j) => <div key={j} style={{ height: 4, background: j === 0 ? `${color}30` : '#F0F0F0', borderRadius: 2, marginBottom: 5, width: `${w}%` }} />)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Templates Grid ───────────────────────────────────────────────────────────
function Templates() {
  const templates = [
    { icon: '📊', name: 'Business Plan', tags: ['Finances', 'Vision'], color: 'var(--accent)' },
    { icon: '🔍', name: "Appel d'Offres", tags: ['Proposition', 'Planning'], color: 'var(--green)' },
    { icon: '📋', name: "Rapport d'Audit", tags: ['Risques', 'KPIs'], color: 'var(--accent2)' },
    { icon: '📝', name: 'Note de Direction', tags: ['Mémo', 'Décision'], color: 'var(--amber)' },
    { icon: '⚖️', name: 'Contrat OHADA', tags: ['Clauses', 'Signature'], color: 'var(--pink)' },
    { icon: '💰', name: 'Devis Pro', tags: ['Facturation', 'FCFA'], color: '#EF4444' },
  ]

  return (
    <section id="templates" style={{ padding: '120px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="sr-hidden" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.15)', borderRadius: 99, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Smart Templates</span>
          </div>
          <h2 className="sr-hidden" style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 0.95, marginBottom: 16, transitionDelay: '0.1s' }}>
            6 modèles prêts à l'emploi
          </h2>
          <p className="sr-hidden" style={{ fontSize: 15, color: 'var(--text3)', transitionDelay: '0.2s' }}>
            Enrichis avec tableaux, clauses, KPIs et zones de signature.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {templates.map(({ icon, name, tags, color }, i) => (
            <div key={name} className="sr-hidden card-glow" style={{
              padding: '20px 16px', cursor: 'pointer',
              transitionDelay: `${i * 0.06}s`,
              background: `linear-gradient(135deg, var(--bg3), var(--bg2))`,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>
                {icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 8 }}>{name}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', background: `${color}12`, color, borderRadius: 99, border: `1px solid ${color}20`, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const [annual, setAnnual] = useState(false)
  const plans = [
    { name: 'Starter', price: 0, annualPrice: 0, color: '#6B7280', cta: 'Commencer', features: ['5 docs / mois', 'Export PDF', '2 pages max', '3 templates'] },
    { name: 'Étudiant', price: 2000, annualPrice: 1700, color: '#10B981', cta: 'Choisir', features: ['20 docs / mois', 'Export PDF + Word', '2 pages max', 'Templates inclus'] },
    { name: 'Pro', price: 14900, annualPrice: 11900, color: 'var(--accent)', cta: 'Passer au Pro', featured: true, features: ['Documents illimités', 'IA rédactionnelle', 'Pages illimitées', 'Export PDF + Word', 'Sans filigrane', 'Templates communauté'] },
    { name: 'Business', price: 39900, annualPrice: 31900, color: 'var(--green)', cta: 'Choisir', features: ['Tout le Pro', '10 utilisateurs', 'Espace partagé', 'Analytics avancés', 'Support 24h'] },
    { name: 'Enterprise', price: null, annualPrice: null, color: 'var(--amber)', cta: 'Nous contacter', features: ['Utilisateurs illimités', 'API REST dédiée', 'SSO / LDAP', 'SLA 99.9%', 'Support dédié'] },
  ]

  return (
    <section id="pricing" style={{ padding: '120px 24px', background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="sr-hidden" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.15)', borderRadius: 99, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tarification</span>
          </div>
          <h2 className="sr-hidden" style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 0.95, marginBottom: 16, transitionDelay: '0.1s' }}>
            Simple. Transparent.
            <br /><span style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontStyle: 'italic', color: 'var(--text2)' }}>En FCFA.</span>
          </h2>

          {/* Toggle */}
          <div className="sr-hidden" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 99, transitionDelay: '0.2s' }}>
            {[{ v: false, l: 'Mensuel' }, { v: true, l: 'Annuel −20%' }].map(({ v, l }) => (
              <button key={l} onClick={() => setAnnual(v)} style={{
                padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer',
                background: annual === v ? 'var(--accent)' : 'transparent',
                color: annual === v ? '#fff' : 'var(--text3)',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', transition: 'all 0.25s var(--ease)',
                boxShadow: annual === v ? '0 4px 16px rgba(91,127,255,0.3)' : 'none',
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {plans.map(({ name, price, annualPrice, color, cta, features, featured }, i) => (
            <div key={name} className="sr-hidden" style={{
              borderRadius: 20, padding: featured ? '28px 20px' : '24px 18px',
              border: featured ? `1px solid rgba(91,127,255,0.4)` : '1px solid var(--border)',
              background: featured ? 'linear-gradient(135deg, rgba(91,127,255,0.1), rgba(124,111,255,0.05))' : 'var(--surface)',
              position: 'relative', boxShadow: featured ? '0 0 60px rgba(91,127,255,0.15)' : 'none',
              transitionDelay: `${i * 0.07}s`,
            }}>
              {featured && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', background: 'var(--accent)', borderRadius: 99, fontSize: 10, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                  ⚡ POPULAIRE
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color, textTransform: 'uppercase', marginBottom: 14 }}>{name}</div>
              <div style={{ marginBottom: 8 }}>
                {price === null ? (
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Sur devis</div>
                ) : price === 0 ? (
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>Gratuit</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{(annual ? annualPrice : price).toLocaleString('fr-FR')}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>FCFA/mois</span>
                  </div>
                )}
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={9} color={color} strokeWidth={3} />
                    </div>
                    <span style={{ color: 'var(--text2)' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-primary" style={{
                width: '100%', justifyContent: 'center', padding: '10px',
                fontSize: 12,
                background: featured ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)',
                boxShadow: featured ? '0 6px 20px rgba(91,127,255,0.3)' : 'none',
                color: '#fff',
              }}>{cta}</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '20px 28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Essai gratuit 14 jours. Aucune CB requise.</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Orange Money', 'MTN MoMo', 'Wave', 'Virement UEMOA'].map(p => (
              <span key={p} style={{ fontSize: 11, padding: '4px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text3)' }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(0)
  const faqs = [
    { q: 'Le PDF exporté ressemble-t-il à l\'aperçu ?', a: 'Oui. EETRA capture les éléments rendus dans le navigateur via html2canvas + jsPDF. Ce que vous voyez est ce que vous obtenez, à 2x de résolution pour l\'impression.' },
    { q: 'Puis-je exporter en format Word ?', a: 'Absolument. L\'export .docx génère un fichier Microsoft Word structuré avec entêtes, tableaux, clauses, zones de signature, numérotation et pied de page corporate.' },
    { q: 'Mes données sont-elles stockées sur vos serveurs ?', a: 'Vos documents sont stockés dans notre base de données sécurisée (PostgreSQL). Seules les requêtes IA incluent le titre et le nom de l\'entité. Vous gardez un contrôle total.' },
    { q: 'Le cadre juridique OHADA est-il intégré ?', a: 'Oui. Les templates Contrat incluent des clauses OHADA (confidentialité, propriété intellectuelle, juridiction CCJA), le Devis référence la TVA locale (18%) et les conditions UEMOA.' },
    { q: 'Comment fonctionnent les paiements en FCFA ?', a: 'Nous acceptons Orange Money (CI, SN, ML, BF, CM), MTN Mobile Money, Wave et virement bancaire UEMOA. Toutes les transactions sont traitées en Francs CFA.' },
  ]

  return (
    <section id="faq" style={{ padding: '120px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 120 }}>
          <div className="sr-left" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.15)', borderRadius: 99, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FAQ</span>
          </div>
          <h2 className="sr-left" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 0.95, marginBottom: 18, transitionDelay: '0.1s' }}>
            Questions<br />
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontStyle: 'italic', color: 'var(--text2)' }}>fréquentes.</span>
          </h2>
          <p className="sr-left" style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, transitionDelay: '0.2s' }}>
            Une question ? <a href="mailto:contact@eetra.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact@eetra.app</a>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="sr-hidden" style={{
              borderRadius: 16, border: `1px solid ${open === i ? 'rgba(91,127,255,0.3)' : 'var(--border)'}`,
              background: open === i ? 'rgba(91,127,255,0.05)' : 'var(--surface)',
              overflow: 'hidden', transition: 'border-color 0.3s, background 0.3s',
              transitionDelay: `${i * 0.06}s`,
            }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: open === i ? 'var(--accent)' : 'var(--text3)', fontWeight: 500 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{faq.q}</span>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: open === i ? 'var(--accent)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s var(--ease)' }}>
                  <ChevronDown size={14} color={open === i ? '#fff' : 'var(--text3)'} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                </div>
              </button>
              <div style={{ maxHeight: open === i ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.35s var(--ease)' }}>
                <div style={{ padding: '0 22px 18px 46px', fontSize: 13, color: 'var(--text3)', lineHeight: 1.75 }}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: '120px 24px', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(91,127,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(45,212,191,0.08) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse-glow 6s infinite' }} />
      <div style={{ position: 'absolute', top: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(244,114,182,0.06) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse-glow 8s infinite 3s' }} />

      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="sr-scale" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(91,127,255,0.1)', border: '1px solid rgba(91,127,255,0.2)', borderRadius: 99, marginBottom: 28 }}>
          <Sparkles size={12} color="var(--accent)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Commencez aujourd'hui</span>
        </div>
        <h2 className="sr-hidden" style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.92, color: 'var(--text)', marginBottom: 20, transitionDelay: '0.1s' }}>
          Prêt à créer des documents
          <br /><span className="gradient-text">qui impressionnent ?</span>
        </h2>
        <p className="sr-hidden" style={{ fontSize: 15, color: 'var(--text3)', marginBottom: 40, transitionDelay: '0.2s' }}>
          Rejoignez +500 entreprises, cabinets et consultants qui font confiance à EETRA.
        </p>
        <div className="sr-hidden" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', transitionDelay: '0.3s' }}>
          <button className="btn-primary" style={{ fontSize: 15, padding: '16px 36px', boxShadow: '0 16px 48px rgba(91,127,255,0.35)' }}>
            Démarrer gratuitement <ArrowRight size={16} />
          </button>
          <button className="btn-ghost" style={{ fontSize: 15, padding: '15px 28px' }}>Voir les designs</button>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#030407', borderTop: '1px solid var(--border)', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>EETRA</div>
                <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Document Intelligence</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 20 }}>Plateforme B2B de création de documents professionnels pour l'Afrique de l'Ouest.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['📍', 'Douala, Cameroun'], ['✉️', 'contact@eetra.app'], ['🌐', 'eetra.buyticle.com']].map(([e, t]) => (
                <span key={t} style={{ fontSize: 12, color: 'var(--text3)' }}>{e} {t}</span>
              ))}
            </div>
          </div>
          {[
            { title: 'Produit', links: ['Fonctionnalités', 'Templates', 'Designs', 'Tarifs'] },
            { title: 'Ressources', links: ['Bibliothèque OHADA', 'Guides business', 'Blog', 'Documentation'] },
            { title: 'Entreprise', links: ['À propos', 'Mentions légales', 'Confidentialité', 'Contact'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>{title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(l => (
                  <a key={l} href="#" style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--text)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text3)'}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>© 2026 EETRA · Tous droits réservés · Douala, Cameroun</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>v2.2.0</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function EetraLanding() {
  useScrollObserver()

  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <GlobalStyle />
      <div className="noise" />
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <MarqueeBanner />
      <DesignsShowcase />
      <Templates />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  )
}