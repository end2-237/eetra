'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import logo from '../../app/icon.png'
import { ArrowRight, Shield, Clock, TrendingUp, Sparkles, Play, FileText, Type, Table2, Image as ImageIcon, Palette, Download, ChevronDown, Bold, Italic, Underline, AlignLeft, List, Undo, Redo, ZoomIn, MoreHorizontal } from 'lucide-react'

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

// Typing animation hook
function useTypingAnimation(texts: string[], speed = 80, pause = 2000) {
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const text = texts[currentIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pause)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(text.slice(0, currentText.length - 1))
        } else {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [currentText, currentIndex, isDeleting, texts, speed, pause])

  return currentText
}

const CSS = `
  [data-sr].sr-in { opacity:1!important; transform:none!important; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float-badge { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
  @keyframes pulse-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes glow-pulse { 0%,100%{opacity:0.6;filter:blur(40px)} 50%{opacity:0.9;filter:blur(50px)} }
  @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes typing-cursor { 0%,100%{border-color:var(--accent)} 50%{border-color:transparent} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes slide-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .hero-section { width:100%; max-width:1400px; margin:0 auto; padding:80px 56px 0; position:relative; overflow:visible; }
  .hero-grid { display:grid; grid-template-columns:1fr 1.2fr; gap:56px; align-items:center; padding-bottom:72px; }
  
  .hero-editor-wrap { 
    position:relative; 
    perspective:1000px;
  }
  
  .hero-editor {
    background:var(--surface);
    border-radius:20px;
    border:1px solid var(--border);
    box-shadow:0 40px 100px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.1);
    overflow:hidden;
    transform:rotateY(-3deg) rotateX(2deg);
    transition:transform .5s cubic-bezier(.23,1,.32,1);
  }
  .hero-editor:hover {
    transform:rotateY(0deg) rotateX(0deg);
  }
  
  .editor-toolbar {
    background:var(--bg2);
    border-bottom:1px solid var(--border);
    padding:10px 16px;
    display:flex;
    align-items:center;
    gap:8px;
  }
  
  .editor-toolbar-btn {
    width:28px; height:28px;
    display:flex; align-items:center; justify-content:center;
    border-radius:6px;
    color:var(--text3);
    transition:all .2s;
    cursor:pointer;
    border:none;
    background:transparent;
  }
  .editor-toolbar-btn:hover {
    background:var(--bg3);
    color:var(--text);
  }
  .editor-toolbar-btn.active {
    background:var(--accentS);
    color:var(--accent);
  }
  
  .editor-sidebar {
    width:52px;
    background:var(--bg2);
    border-right:1px solid var(--border);
    padding:12px 0;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:4px;
  }
  
  .sidebar-btn {
    width:36px; height:36px;
    display:flex; align-items:center; justify-content:center;
    border-radius:8px;
    color:var(--text3);
    transition:all .2s;
    cursor:pointer;
    border:none;
    background:transparent;
  }
  .sidebar-btn:hover {
    background:var(--bg3);
    color:var(--text);
  }
  .sidebar-btn.active {
    background:var(--accentS);
    color:var(--accent);
  }
  
  .editor-canvas {
    background:var(--bg3);
    padding:24px;
    min-height:400px;
    display:flex;
    justify-content:center;
    overflow:hidden;
  }
  
  .document-page {
    width:100%;
    max-width:380px;
    background:#fff;
    border-radius:4px;
    box-shadow:0 4px 20px rgba(0,0,0,0.1);
    padding:28px 24px;
    position:relative;
  }
  
  .dark .document-page {
    background:#1a1a2e;
  }
  
  .typing-line {
    display:inline;
    border-right:2px solid var(--accent);
    animation:typing-cursor 1s ease-in-out infinite;
  }
  
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
  .hero-h1 { font-size:clamp(36px,4.5vw,68px); }
  
  .hero-glow {
    position:absolute; width:500px; height:500px; border-radius:50%;
    background:radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%);
    animation:glow-pulse 4s ease-in-out infinite;
    pointer-events:none;
  }
  
  .shimmer-line {
    background:linear-gradient(90deg,var(--bg3) 25%,var(--bg2) 50%,var(--bg3) 75%);
    background-size:200% 100%;
    animation:shimmer 2s infinite;
  }

  @media (max-width: 1200px) {
    .hero-grid { grid-template-columns:1fr 1fr; gap:40px; }
    .hero-editor { transform:none; }
    .editor-canvas { padding:16px; min-height:360px; }
    .document-page { max-width:320px; padding:20px 18px; }
  }
  
  @media (max-width: 1023px) {
    .hero-grid { grid-template-columns:1fr; gap:48px; padding-bottom:56px; }
    .hero-editor-wrap { max-width:600px; margin:0 auto; }
    .hero-section { padding:64px 40px 0; }
    .hero-stats { margin:0 -40px; padding:28px 40px; }
    .editor-canvas { min-height:340px; }
  }
  
  @media (max-width: 767px) {
    .hero-section { padding:48px 24px 0; }
    .hero-grid { gap:36px; padding-bottom:44px; }
    .hero-stats { grid-template-columns:1fr 1fr; margin:0 -24px; padding:24px; gap:0; }
    .hero-stats > div { border-right:none!important; padding:18px 14px; border-bottom:1px solid var(--border); }
    .hero-stats > div:nth-child(1),
    .hero-stats > div:nth-child(2) { border-right:1px solid var(--border)!important; }
    .hero-stats > div:nth-child(3),
    .hero-stats > div:nth-child(4) { border-bottom:none; }
    .hero-badge { transform:scale(0.9); }
    .hero-ctas { flex-direction:column; gap:12px!important; }
    .hero-cta-primary, .hero-cta-ghost { width:100%; justify-content:center; }
    .hero-trust { flex-direction:column; align-items:flex-start!important; gap:10px!important; }
    .hero-trust > div { margin:0!important; }
    .hero-trust .sep { display:none; }
    .editor-sidebar { display:none; }
    .editor-canvas { padding:12px; min-height:280px; }
    .document-page { padding:16px 14px; }
  }
  
  @media (max-width: 479px) {
    .hero-editor-wrap { display:block; }
    .hero-grid { grid-template-columns:1fr; gap:28px; padding-bottom:36px; }
    .hero-section { padding:36px 18px 0; }
    .hero-h1 { font-size:clamp(28px,7vw,40px); line-height:1.05; }
    .hero-stats { grid-template-columns:1fr 1fr; margin:0 -18px; padding:18px; gap:0; }
    .hero-stats > div { padding:16px 12px; }
    .hero-stats > div span:first-child { font-size:clamp(22px,4vw,30px); }
    .editor-toolbar { padding:8px 12px; gap:4px; overflow-x:auto; }
    .editor-toolbar-btn { width:24px; height:24px; flex-shrink:0; }
    .hero-badge { display:none; }
  }
`

export function Hero() {
  const router = useRouter()
  useSR()
  useParallax()
  
  const typingText = useTypingAnimation([
    'Resumé Executif',
    'Analyse de Marche',
    'Projections Financieres',
    'Strategie Commerciale'
  ], 70, 1500)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="hero-section">
        {/* Ambient glow effects */}
        <div className="hero-glow" style={{ top: '-10%', left: '0%' }} />
        <div className="hero-glow" style={{ top: '30%', right: '-10%', animationDelay: '2s', background: 'radial-gradient(ellipse,rgba(236,72,153,0.2) 0%,transparent 70%)' }} />
        
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
            <h1 data-sr className="hero-h1" style={{ opacity: 0, transform: 'translateY(44px)', transition: 'opacity .85s .1s, transform .85s .1s', fontWeight: 900, lineHeight: .9, letterSpacing: '-.05em', color: 'var(--text)', marginBottom: 24 }}>
              <span style={{ display: 'block' }}>Vos documents</span>
              <span className="gradient-text" style={{ display: 'block', background: 'linear-gradient(135deg,var(--accent) 0%,#A855F7 50%,#EC4899 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradient-shift 5s ease infinite' }}>
                d&apos;exception.
              </span>
              <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, fontSize: '.68em', color: 'var(--text3)', display: 'block', marginTop: 8 }}>En quelques minutes.</span>
            </h1>

            {/* Subtitle */}
            <p data-sr style={{ opacity: 0, transform: 'translateY(32px)', transition: 'opacity .85s .22s, transform .85s .22s', fontSize: 17, lineHeight: 1.75, color: 'var(--text3)', maxWidth: 500, marginBottom: 32 }}>
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

          {/* RIGHT: Editor mockup */}
          <div className="hero-editor-wrap" data-sr style={{ opacity: 0, transform: 'translateX(56px)', transition: 'opacity 1s .2s, transform 1s .2s' }}>
            {/* Ambient glow behind editor */}
            <div data-p="0.02" style={{ position: 'absolute', top: '-10%', left: '-5%', right: '-5%', bottom: '-10%', borderRadius: '50%', background: 'radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: -1 }} />

            {/* Editor window */}
            <div className="hero-editor">
              {/* Window controls */}
              <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 8, background: 'var(--bg3)', fontSize: 12, color: 'var(--text3)' }}>
                  <FileText size={12} />
                  <span>Business_Plan_2026.eetra</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="editor-toolbar-btn"><Undo size={14} /></button>
                  <button className="editor-toolbar-btn"><Redo size={14} /></button>
                </div>
              </div>
              
              {/* Toolbar */}
              <div className="editor-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: 'var(--bg3)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer' }}>
                  <span>Titre 1</span>
                  <ChevronDown size={12} />
                </div>
                <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />
                <button className="editor-toolbar-btn active"><Bold size={14} /></button>
                <button className="editor-toolbar-btn"><Italic size={14} /></button>
                <button className="editor-toolbar-btn"><Underline size={14} /></button>
                <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />
                <button className="editor-toolbar-btn"><AlignLeft size={14} /></button>
                <button className="editor-toolbar-btn"><List size={14} /></button>
                <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />
                <button className="editor-toolbar-btn"><Table2 size={14} /></button>
                <button className="editor-toolbar-btn"><ImageIcon size={14} /></button>
                <div style={{ flex: 1 }} />
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--electric))', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  <Download size={12} /> Exporter
                </button>
              </div>

              {/* Main content area */}
              <div style={{ display: 'flex' }}>
                {/* Sidebar */}
                <div className="editor-sidebar">
                  <button className="sidebar-btn active"><FileText size={16} /></button>
                  <button className="sidebar-btn"><Type size={16} /></button>
                  <button className="sidebar-btn"><Table2 size={16} /></button>
                  <button className="sidebar-btn"><ImageIcon size={16} /></button>
                  <button className="sidebar-btn"><Palette size={16} /></button>
                  <div style={{ flex: 1 }} />
                  <button className="sidebar-btn"><ZoomIn size={16} /></button>
                  <button className="sidebar-btn"><MoreHorizontal size={16} /></button>
                </div>

                {/* Canvas */}
                <div className="editor-canvas" style={{ flex: 1 }}>
                  <div className="document-page">
                    {/* Document header */}
                    <div style={{ background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', margin: '-28px -24px 20px', padding: '20px 24px', borderRadius: '4px 4px 0 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Image src={logo} alt="EETRA" width={20} height={20} style={{ borderRadius: 4, opacity: 0.9 }} />
                        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.2em', color: 'rgba(255,255,255,.7)', textTransform: 'uppercase' }}>ACACIA CONSULTING</span>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>BUSINESS PLAN</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 6 }}>2026 — 2030 · Confidentiel</div>
                    </div>

                    {/* KPI boxes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {[['12M', 'Revenus'], ['+34%', 'Croissance'], ['47', 'Effectifs']].map(([v, l]) => (
                        <div key={l} style={{ background: 'var(--bg2)', borderTop: '3px solid var(--accent)', borderRadius: '0 0 8px 8px', padding: '10px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', letterSpacing: '-.02em' }}>{v}</div>
                          <div style={{ fontSize: 7, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 2 }}>{l}</div>
                        </div>
                      ))}
                    </div>

                    {/* Section title with typing effect */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Section 1</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center' }}>
                        {typingText}<span className="typing-line" style={{ marginLeft: 2 }}>&nbsp;</span>
                      </div>
                    </div>
                    
                    {/* Content lines */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[90, 75, 85, 60].map((w, i) => (
                        <div key={i} className="shimmer-line" style={{ height: 6, borderRadius: 3, width: `${w}%`, opacity: 0.7 - i * 0.1 }} />
                      ))}
                    </div>

                    {/* Mini table */}
                    <div style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ background: 'var(--accent)', padding: '6px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                        {['Exercice', 'CA', 'Marge'].map(h => <span key={h} style={{ fontSize: 7, color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>{h}</span>)}
                      </div>
                      {[['2024', '9.2M', '16%'], ['2025', '12M', '21%'], ['2026', '15.6M', '25%']].map(([y, ca, m], i) => (
                        <div key={i} style={{ padding: '5px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: i % 2 ? 'var(--bg2)' : 'var(--surface)' }}>
                          {[y, ca, m].map(c => <span key={c} style={{ fontSize: 8, color: 'var(--text3)' }}>{c}</span>)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            {[
              { icon: <Sparkles size={14} color="var(--accent)" />, label: 'PDF exporte', sub: '12 pages · HD', style: { top: -10, right: -20 }, delay: '.4s' },
              { icon: <Shield size={14} color="var(--success)" />, label: 'Contrat finalise', sub: 'Orange Telecom CI', style: { bottom: 80, left: -30 }, delay: '.8s' },
              { icon: <TrendingUp size={14} color="var(--electric)" />, label: 'IA generee', sub: '3 paragraphes', style: { bottom: 20, right: -10 }, delay: '1.2s' },
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
        <div className="hero-stats">
          {[
            { value: 8000, suffix: '+', label: 'Documents crees', icon: <FileText size={18} /> },
            { value: 340, suffix: '', label: 'Entreprises actives', icon: <TrendingUp size={18} /> },
            { value: 99, suffix: '%', label: 'Satisfaction client', icon: <Sparkles size={18} /> },
            { value: 6, suffix: ' types', label: 'de documents', icon: <Shield size={18} /> },
          ].map((stat, i) => (
            <div key={i} className="stat-card" style={{
              padding: '12px 20px',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: 'var(--accent)' }}>{stat.icon}</span>
                <span style={{ fontSize: 'clamp(26px,3vw,36px)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-.03em' }}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
