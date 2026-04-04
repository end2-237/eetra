'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, FileText, Users, Download, BarChart3, ChevronDown, Check, X, Star, Globe, Lock, Sparkles, Play, TrendingUp, Clock, Award, Menu } from 'lucide-react'
import logo from './icon.png'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

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
function Counter({ end, suffix = '', prefix = '', duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
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
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])
  return <span ref={ref}>{prefix}{count.toLocaleString('fr-FR')}{suffix}</span>
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const navItems = [
    { label: 'Fonctionnalites', id: 'features' },
    { label: 'Templates', id: 'templates' },
    { label: 'Designs', id: 'designs' },
    { label: 'Tarifs', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--border)] shadow-lg' : 'py-5 bg-transparent'}`}>
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src={logo} alt="EETRA" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-extrabold tracking-tight text-[var(--text)]">EETRA</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-[var(--accentS)] text-[var(--accent)] rounded-full border border-[var(--accent)]/25 tracking-widest">2026</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-4 py-2 text-sm font-medium text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:block w-px h-5 bg-[var(--border)]" />
            <button
              onClick={() => router.push('/login')}
              className="hidden sm:flex px-4 py-2 text-sm font-medium text-[var(--text2)] hover:text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] rounded-xl transition-all"
            >
              Se connecter
            </button>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] rounded-xl shadow-lg shadow-[var(--electricGlow)] hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span className="hidden xs:inline">Demarrer</span>
              <ArrowRight size={14} />
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile menu */}
      <div className={`fixed top-0 right-0 bottom-0 w-[280px] z-50 bg-[var(--surface)] border-l border-[var(--border)] p-6 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="EETRA" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-[var(--text)]">Menu</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-[var(--bg2)] text-[var(--text3)]">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="w-full text-left px-4 py-3 text-[var(--text2)] hover:text-[var(--accent)] hover:bg-[var(--accentS)] rounded-xl font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="h-px bg-[var(--border)] my-6" />
        
        <button
          onClick={() => { setMobileOpen(false); router.push('/login') }}
          className="w-full px-4 py-3 text-[var(--text3)] hover:text-[var(--text)] rounded-xl font-medium transition-colors"
        >
          Connexion
        </button>
        
        <button
          onClick={() => { setMobileOpen(false); router.push('/login') }}
          className="w-full mt-4 px-4 py-3 text-white font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] rounded-xl flex items-center justify-center gap-2"
        >
          Essai gratuit <ArrowRight size={15} />
        </button>
      </div>
    </>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [typed, setTyped] = useState('')
  const words = ['Business Plans', 'Audits', 'Contrats OHADA', 'Appels d\'Offres']
  const wordIdx = useRef(0)
  const charIdx = useRef(0)
  const deleting = useRef(false)
  const timeout = useRef<NodeJS.Timeout | null>(null)

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
    return () => { if (timeout.current) clearTimeout(timeout.current) }
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = canvas.width = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.5 + 0.1
    }))
    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(107,71,237,${p.o})`; ctx.fill()
      })
      particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(107,71,237,${0.08 * (1 - d / 100)})`; ctx.stroke()
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
    <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Radial glows */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse,var(--electricGlow)_0%,transparent_70%)] pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(ellipse,rgba(236,72,153,0.1)_0%,transparent_70%)] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-30" />

      <div className="max-w-[900px] w-full text-center relative z-10">
        {/* Badge */}
        <div className="sr-hidden inline-flex items-center gap-2 px-4 py-2 bg-[var(--accentS)] border border-[var(--accent)]/20 rounded-full mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)] animate-pulse" />
          <span className="text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">Document Intelligence - Afrique de l&apos;Ouest</span>
        </div>

        {/* Headline */}
        <h1 className="sr-hidden text-[clamp(40px,6vw,80px)] font-extrabold tracking-tighter leading-[0.95] text-[var(--text)] mb-6">
          <span className="block">Creez des</span>
          <span className="block font-serif font-normal italic text-[1.1em] text-[var(--text3)]">
            {typed}<span className="inline-block w-[3px] h-[0.9em] bg-[var(--accent)] ml-0.5 rounded-sm align-text-bottom animate-pulse" />
          </span>
          <span className="block">
            <span className="gradient-text">de niveau executif.</span>
          </span>
        </h1>

        {/* Subline */}
        <p className="sr-hidden text-lg text-[var(--text3)] leading-relaxed max-w-[600px] mx-auto mb-10">
          La plateforme B2B qui transforme vos idees en documents professionnels — avec IA, charte graphique, cadre OHADA et export PDF-Word.
        </p>

        {/* CTAs */}
        <div className="sr-hidden flex gap-3 justify-center flex-wrap mb-14">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 px-8 py-4 text-[15px] font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] rounded-xl shadow-lg shadow-[var(--electricGlow)] hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Commencer gratuitement <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.push('/designs')}
            className="flex items-center gap-2 px-7 py-4 text-[15px] font-semibold text-[var(--text2)] bg-[var(--glass-bg)] backdrop-blur-lg border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
          >
            <Play size={14} fill="currentColor" /> Voir la demo
          </button>
        </div>

        {/* Social proof */}
        <div className="sr-hidden flex items-center justify-center gap-6 flex-wrap">
          {[
            { icon: <Shield size={14} />, text: 'Aucune CB requise' },
            { icon: <Clock size={14} />, text: 'Setup en 3 min' },
            { icon: <Star size={14} />, text: '+500 entreprises' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-[var(--text3)] text-sm">
              <span className="text-[var(--accent)]">{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>

      {/* Hero mockup */}
      <div className="sr-scale max-w-[900px] w-full mt-16 relative">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Window bar */}
          <div className="px-5 py-3 bg-[var(--bg2)] border-b border-[var(--border)] flex items-center gap-4">
            <div className="flex gap-1.5">
              {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
            </div>
            <div className="flex-1 bg-[var(--bg3)] rounded-md px-3 py-1 text-xs text-[var(--text3)] font-mono flex items-center gap-2">
              <Lock size={10} /> eetra.app/editor
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] rounded-md">
              <Download size={11} /> Exporter
            </button>
          </div>

          {/* Editor layout */}
          <div className="flex h-[420px]">
            {/* Sidebar */}
            <div className="w-[220px] border-r border-[var(--border)] p-4 flex-col gap-1.5 hidden md:flex">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text3)] px-2 mb-1.5">Structure</div>
              {[
                { label: 'Resume Executif', active: true },
                { label: 'Analyse Marche', active: false },
                { label: 'Projections', active: false },
                { label: 'Equipe', active: false },
              ].map(({ label, active }) => (
                <div key={label} className={`px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${active ? 'bg-[var(--accentS)] border border-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text3)] hover:bg-[var(--bg2)]'}`}>
                  {label}
                </div>
              ))}
              
              <div className="mt-auto">
                <div className="p-2.5 rounded-lg bg-[var(--accentS)] border border-[var(--accent)]/15 text-center">
                  <Sparkles size={14} className="text-[var(--accent)] mx-auto mb-1" />
                  <div className="text-[10px] text-[var(--accent)] font-semibold">IA Redactionnelle</div>
                  <div className="text-[9px] text-[var(--text3)] mt-0.5">Generer intro</div>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-[var(--bg3)] p-5 flex justify-center overflow-hidden">
              <div className="w-full max-w-[340px] bg-white dark:bg-[#1a1a2e] rounded shadow-xl text-[#111] dark:text-white">
                <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--electric)] -mx-0 -mt-0 px-5 py-4 rounded-t">
                  <div className="text-[9px] text-white/70 font-bold tracking-widest uppercase mb-1.5">ACACIA CONSULTING - CONFIDENTIEL</div>
                  <div className="text-lg font-black text-white leading-tight">BUSINESS PLAN<br/>2026 — 2030</div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {[['12M', 'CA'], ['+34%', 'Croissance'], ['47', 'Effectifs']].map(([v, l]) => (
                      <div key={l} className="bg-[var(--bg2)] border-t-2 border-[var(--accent)] rounded-b-md px-1.5 py-2 text-center">
                        <div className="text-sm font-black text-[var(--text)]">{v}</div>
                        <div className="text-[7px] text-[var(--text3)] uppercase tracking-wide">{l}</div>
                      </div>
                    ))}
                  </div>
                  {[90, 75, 85, 60].map((w, i) => (
                    <div key={i} className="h-1.5 bg-[var(--bg3)] rounded-full mb-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w}%`, background: i === 0 ? 'var(--accent)' : 'var(--border)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="w-[200px] border-l border-[var(--border)] p-3 flex-col gap-2 hidden lg:flex">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text3)] px-1 mb-1">Proprietes</div>
              {[['Couleur', '#6B47ED'], ['Design', 'Classic'], ['Police', 'Outfit']].map(([k, v]) => (
                <div key={k} className="flex justify-between px-2 py-1.5 bg-[var(--surface)] rounded-md text-[11px]">
                  <span className="text-[var(--text3)]">{k}</span>
                  <span className="text-[var(--text)] font-medium">{v}</span>
                </div>
              ))}
              <div className="mt-2 p-2.5 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)] rounded-lg">
                <div className="text-[10px] text-[var(--success)] font-semibold mb-1">Score IA</div>
                <div className="h-1.5 bg-[rgba(16,185,129,0.15)] rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-[var(--success)] rounded-full transition-all" />
                </div>
                <div className="text-[9px] text-[var(--text3)] mt-1">87% - Document complet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute -top-5 -left-5 hidden md:flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl backdrop-blur-xl shadow-lg animate-bounce">
          <div className="w-7 h-7 rounded-lg bg-[rgba(16,185,129,0.12)] flex items-center justify-center text-[var(--success)]">
            <Download size={12} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--text)]">PDF exporte - 12 pages</div>
            <div className="text-[10px] text-[var(--text3)]">Il y a 2 min</div>
          </div>
        </div>
        <div className="absolute bottom-10 -right-5 hidden md:flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl backdrop-blur-xl shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
          <div className="w-7 h-7 rounded-lg bg-[var(--accentS)] flex items-center justify-center text-[var(--accent)]">
            <Check size={12} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--text)]">Contrat signe</div>
            <div className="text-[10px] text-[var(--text3)]">Orange Telecom CI</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[var(--text3)] text-[11px] tracking-wider uppercase">
        <span>Defiler</span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--text3)] to-transparent" />
      </div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <section className="border-t border-b border-[var(--border)] bg-[var(--bg2)] py-12 px-6">
      <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: 8000, suffix: '+', label: 'Documents crees', icon: <FileText size={20} /> },
          { value: 500, suffix: '+', label: 'Entreprises actives', icon: <Globe size={20} /> },
          { value: 99, suffix: '%', label: 'Satisfaction client', icon: <Star size={20} /> },
          { value: 3, suffix: ' min', label: 'Setup initial', icon: <Zap size={20} /> },
        ].map(({ value, suffix, label, icon }) => (
          <div key={label} className="sr-hidden text-center">
            <div className="text-[var(--accent)] mb-2.5 opacity-70 flex justify-center">{icon}</div>
            <div className="text-[clamp(28px,3vw,44px)] font-extrabold tracking-tight text-[var(--text)] mb-1.5">
              <Counter end={value} suffix={suffix} />
            </div>
            <div className="text-sm text-[var(--text3)] font-medium">{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features Bento ───────────────────────────────────────────────────────────
function Features() {
  const router = useRouter()
  const features = [
    {
      icon: <Zap size={24} />, title: 'IA Redactionnelle',
      desc: 'Generation d\'introductions professionnelles, reformulation corporate, suggestions contextuelles.',
      color: 'var(--accent)', span: 2,
      badge: 'Intelligence Artificielle',
      visual: (
        <div className="mt-4 bg-[var(--bg3)] rounded-lg p-3 font-mono text-xs">
          <div className="text-[var(--text3)] mb-1.5">// Generation en cours...</div>
          <div className="text-[var(--success)]">→ &quot;Dans un contexte de croissance soutenue,</div>
          <div className="text-[var(--success)] flex items-center gap-1">
            votre entreprise se positionne comme<span className="inline-block w-2 h-3.5 bg-[var(--success)] rounded-sm animate-pulse ml-0.5" />
          </div>
        </div>
      )
    },
    {
      icon: <Shield size={24} />, title: 'Cadre OHADA',
      desc: '17 pays membres, clauses conformes, contrats certifies.',
      color: 'var(--danger)', span: 1,
      badge: '17 pays',
    },
    {
      icon: <Download size={24} />, title: 'Export PDF & Word',
      desc: 'PDF haute resolution A4, .docx Microsoft Word editable.',
      color: 'var(--success)', span: 1,
      badge: 'Instant',
    },
    {
      icon: <BarChart3 size={24} />, title: 'Analytics Temps Reel',
      desc: 'Score de completude, repartition des blocs, KPIs documentaires.',
      color: 'var(--warn)', span: 1,
      badge: 'Live',
    },
    {
      icon: <Users size={24} />, title: 'Collaboration Equipe',
      desc: 'Curseurs en temps reel, annotations, gestion des roles et acces.',
      color: 'var(--electric)', span: 2,
      badge: 'Realtime',
    },
  ]

  return (
    <section id="features" className="py-28 px-6 bg-[var(--bg)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <div className="sr-hidden inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accentS)] border border-[var(--accent)]/15 rounded-full mb-5">
            <Sparkles size={12} className="text-[var(--accent)]" />
            <span className="text-[11px] font-bold text-[var(--accent)] tracking-wider uppercase">Fonctionnalites</span>
          </div>
          <h2 className="sr-hidden text-[clamp(32px,4vw,56px)] font-extrabold tracking-tight text-[var(--text)] leading-[0.95] mb-4">
            Tout ce qu&apos;une direction
            <br /><span className="font-serif font-normal italic text-[var(--text2)]">a besoin.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon, title, desc, color, span, badge, visual }, i) => (
            <div key={title} className={`sr-hidden p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:-translate-y-1 transition-all ${span === 2 ? 'lg:col-span-2' : ''}`} style={{ transitionDelay: `${i * 0.07}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}>
                  {icon}
                </div>
                {badge && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>{badge}</span>}
              </div>
              <h3 className="text-lg font-bold text-[var(--text)] mb-2 tracking-tight">{title}</h3>
              <p className="text-sm text-[var(--text3)] leading-relaxed">{desc}</p>
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
  const items = ['Business Plan', 'Rapport d\'Audit', 'Appel d\'Offres', 'Contrat OHADA', 'Note de Direction', 'Devis Pro', 'Export PDF', 'Export Word', 'IA Redactionnelle']
  const doubled = [...items, ...items]
  return (
    <div className="border-t border-b border-[var(--border)] bg-[var(--bg2)] py-4 overflow-hidden relative">
      <div className="flex w-[200%] animate-[marquee_30s_linear_infinite]">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-6 px-6 flex-shrink-0">
            <span className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap ${i % 2 === 0 ? 'text-[var(--text2)]' : 'text-[var(--text3)]'}`}>{item}</span>
            <div className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-40 flex-shrink-0" />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}

// ─── Designs Showcase ─────────────────────────────────────────────────────────
function DesignsShowcase() {
  const router = useRouter()
  const designs = [
    { name: 'Classic', color: '#6B47ED' },
    { name: 'Bold', color: '#7C3AED' },
    { name: 'Minimal', color: '#374151' },
    { name: 'Split', color: '#059669' },
    { name: 'Editorial', color: '#B45309' },
  ]

  return (
    <section id="designs" className="py-28 px-6 bg-gradient-to-b from-[var(--bg)] to-[var(--bg2)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
          <div>
            <div className="sr-left inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accentS)] border border-[var(--accent)]/15 rounded-full mb-5">
              <span className="text-[11px] font-bold text-[var(--accent)] tracking-wider uppercase">9 designs A4</span>
            </div>
            <h2 className="sr-left text-[clamp(28px,3.5vw,52px)] font-extrabold tracking-tight text-[var(--text)] leading-[0.95]">
              Votre document,<br />
              <span className="font-serif font-normal italic text-[var(--text2)]">votre signature.</span>
            </h2>
          </div>
          <button onClick={() => router.push('/designs')} className="sr-left flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--text2)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-xl transition-all">
            Voir tous <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {designs.map(({ name, color }, i) => (
            <div key={name} className="sr-hidden cursor-pointer group" style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="bg-white rounded-lg aspect-[0.707] overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-[1.03] group-hover:-translate-y-2 transition-all border border-[var(--border)]">
                {/* Cover mini */}
                <div className="h-[45%] relative overflow-hidden" style={{ background: color }}>
                  <div className="absolute -right-[20%] -top-[20%] w-[60%] h-[60%] rounded-full bg-white/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <div className="text-[6px] text-white/60 font-bold tracking-widest uppercase mb-1">EETRA DOC</div>
                    <div className="text-[10px] font-black text-white leading-tight">BUSINESS<br />PLAN 2026</div>
                  </div>
                </div>
                <div className="p-2.5">
                  {[85, 70, 90, 60].map((w, j) => <div key={j} className="h-1 rounded-full mb-1.5" style={{ background: j === 0 ? `${color}30` : '#F0F0F0', width: `${w}%` }} />)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 justify-center">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-semibold text-[var(--text2)]">{name}</span>
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
    { icon: <BarChart3 size={22} />, name: 'Business Plan', tags: ['Finances', 'Vision'], color: 'var(--accent)' },
    { icon: <FileText size={22} />, name: "Appel d'Offres", tags: ['Proposition', 'Planning'], color: 'var(--success)' },
    { icon: <TrendingUp size={22} />, name: "Rapport d'Audit", tags: ['Risques', 'KPIs'], color: 'var(--electric)' },
    { icon: <FileText size={22} />, name: 'Note de Direction', tags: ['Memo', 'Decision'], color: 'var(--warn)' },
    { icon: <Shield size={22} />, name: 'Contrat OHADA', tags: ['Clauses', 'Signature'], color: 'var(--danger)' },
    { icon: <Download size={22} />, name: 'Devis Pro', tags: ['Facturation', 'FCFA'], color: '#EF4444' },
  ]

  return (
    <section id="templates" className="py-28 px-6 bg-[var(--bg)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <div className="sr-hidden inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accentS)] border border-[var(--accent)]/15 rounded-full mb-5">
            <span className="text-[11px] font-bold text-[var(--accent)] tracking-wider uppercase">Smart Templates</span>
          </div>
          <h2 className="sr-hidden text-[clamp(32px,4vw,56px)] font-extrabold tracking-tight text-[var(--text)] leading-[0.95] mb-4">
            6 modeles prets a l&apos;emploi
          </h2>
          <p className="sr-hidden text-[15px] text-[var(--text3)]">
            Enrichis avec tableaux, clauses, KPIs et zones de signature.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {templates.map(({ icon, name, tags, color }, i) => (
            <div key={name} className="sr-hidden p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:-translate-y-1 cursor-pointer transition-all" style={{ transitionDelay: `${i * 0.06}s` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}>
                {icon}
              </div>
              <div className="text-sm font-bold text-[var(--text)] tracking-tight mb-2">{name}</div>
              <div className="flex gap-1 flex-wrap">
                {tags.map(t => (
                  <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>{t}</span>
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
  const router = useRouter()
  const [annual, setAnnual] = useState(false)
  const plans = [
    { name: 'Starter', price: 0, annualPrice: 0, color: '#6B7280', cta: 'Commencer', features: ['5 docs / mois', 'Export PDF', '2 pages max', '3 templates'] },
    { name: 'Etudiant', price: 2000, annualPrice: 1700, color: '#10B981', cta: 'Choisir', features: ['20 docs / mois', 'Export PDF + Word', '2 pages max', 'Templates inclus'] },
    { name: 'Pro', price: 14900, annualPrice: 11900, color: 'var(--accent)', cta: 'Passer au Pro', featured: true, features: ['Documents illimites', 'IA redactionnelle', 'Pages illimitees', 'Export PDF + Word', 'Sans filigrane', 'Templates communaute'] },
    { name: 'Business', price: 39900, annualPrice: 31900, color: 'var(--success)', cta: 'Choisir', features: ['Tout le Pro', '10 utilisateurs', 'Espace partage', 'Analytics avances', 'Support 24h'] },
    { name: 'Enterprise', price: null, annualPrice: null, color: 'var(--warn)', cta: 'Nous contacter', features: ['Utilisateurs illimites', 'API REST dediee', 'SSO / LDAP', 'SLA 99.9%', 'Support dedie'] },
  ]

  return (
    <section id="pricing" className="py-28 px-6 bg-gradient-to-b from-[var(--bg)] to-[var(--bg2)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <div className="sr-hidden inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accentS)] border border-[var(--accent)]/15 rounded-full mb-5">
            <span className="text-[11px] font-bold text-[var(--accent)] tracking-wider uppercase">Tarification</span>
          </div>
          <h2 className="sr-hidden text-[clamp(32px,4vw,56px)] font-extrabold tracking-tight text-[var(--text)] leading-[0.95] mb-4">
            Simple. Transparent.
            <br /><span className="font-serif font-normal italic text-[var(--text2)]">En FCFA.</span>
          </h2>

          {/* Toggle */}
          <div className="sr-hidden inline-flex items-center gap-1 p-1 bg-[var(--bg3)] border border-[var(--border)] rounded-full">
            {[{ v: false, l: 'Mensuel' }, { v: true, l: 'Annuel -20%' }].map(({ v, l }) => (
              <button key={l} onClick={() => setAnnual(v)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual === v ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text3)]'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {plans.map(({ name, price, annualPrice, color, cta, features, featured }, i) => (
            <div key={name} className={`sr-hidden rounded-2xl p-6 border relative ${featured ? 'border-[var(--accent)]/40 bg-[var(--accentS)]' : 'border-[var(--border)] bg-[var(--surface)]'}`} style={{ transitionDelay: `${i * 0.07}s`, boxShadow: featured ? '0 0 60px rgba(107,71,237,0.15)' : 'none' }}>
              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-[var(--accent)] rounded-full text-[10px] font-bold text-white whitespace-nowrap tracking-wide">
                  POPULAIRE
                </div>
              )}
              <div className="text-[11px] font-bold tracking-wider uppercase mb-3.5" style={{ color }}>{name}</div>
              <div className="mb-2">
                {price === null ? (
                  <div className="text-[28px] font-extrabold text-[var(--text)]">Sur devis</div>
                ) : price === 0 ? (
                  <div className="text-[32px] font-extrabold text-[var(--text)]">Gratuit</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-extrabold text-[var(--text)]">{(annual ? annualPrice : price).toLocaleString('fr-FR')}</span>
                    <span className="text-[10px] text-[var(--text3)]">FCFA/mois</span>
                  </div>
                )}
              </div>
              <div className="h-px bg-[var(--border)] my-3.5" />
              <ul className="flex flex-col gap-2 mb-4.5">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                      <Check size={9} style={{ color }} strokeWidth={3} />
                    </div>
                    <span className="text-[var(--text2)]">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/login')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${featured ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] text-white shadow-lg' : 'bg-[var(--bg3)] text-[var(--text)]'}`}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm font-semibold text-[var(--text)]">Essai gratuit 14 jours. Aucune CB requise.</div>
          <div className="flex gap-2.5 flex-wrap">
            {['Orange Money', 'MTN MoMo', 'Wave', 'Virement UEMOA'].map(p => (
              <span key={p} className="text-[11px] px-3 py-1 bg-[var(--bg3)] border border-[var(--border)] rounded-full text-[var(--text3)]">{p}</span>
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
    { q: 'Le PDF exporte ressemble-t-il a l\'apercu ?', a: 'Oui. EETRA capture les elements rendus dans le navigateur via html2canvas + jsPDF. Ce que vous voyez est ce que vous obtenez, a 2x de resolution pour l\'impression.' },
    { q: 'Puis-je exporter en format Word ?', a: 'Absolument. L\'export .docx genere un fichier Microsoft Word structure avec entetes, tableaux, clauses, zones de signature, numerotation et pied de page corporate.' },
    { q: 'Mes donnees sont-elles stockees sur vos serveurs ?', a: 'Vos documents sont stockes dans notre base de donnees securisee (PostgreSQL). Seules les requetes IA incluent le titre et le nom de l\'entite. Vous gardez un controle total.' },
    { q: 'Le cadre juridique OHADA est-il integre ?', a: 'Oui. Les templates Contrat incluent des clauses OHADA (confidentialite, propriete intellectuelle, juridiction CCJA), le Devis reference la TVA locale (18%) et les conditions UEMOA.' },
    { q: 'Comment fonctionnent les paiements en FCFA ?', a: 'Nous acceptons Orange Money (CI, SN, ML, BF, CM), MTN Mobile Money, Wave et virement bancaire UEMOA. Toutes les transactions sont traitees en Francs CFA.' },
  ]

  return (
    <section id="faq" className="py-28 px-6 bg-[var(--bg)]">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-20 items-start">
        <div className="lg:sticky lg:top-28">
          <div className="sr-left inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accentS)] border border-[var(--accent)]/15 rounded-full mb-5">
            <span className="text-[11px] font-bold text-[var(--accent)] tracking-wider uppercase">FAQ</span>
          </div>
          <h2 className="sr-left text-[clamp(28px,3.5vw,48px)] font-extrabold tracking-tight text-[var(--text)] leading-[0.95] mb-4">
            Questions<br />
            <span className="font-serif font-normal italic text-[var(--text2)]">frequentes.</span>
          </h2>
          <p className="sr-left text-sm text-[var(--text3)] leading-relaxed">
            Une question ? <a href="mailto:contact@eetra.app" className="text-[var(--accent)] hover:underline">contact@eetra.app</a>
          </p>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-1.5">
          {faqs.map((faq, i) => (
            <div key={i} className={`sr-hidden rounded-2xl border overflow-hidden transition-all ${open === i ? 'border-[var(--accent)]/30 bg-[var(--accentS)]' : 'border-[var(--border)] bg-[var(--surface)]'}`} style={{ transitionDelay: `${i * 0.06}s` }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex justify-between items-center p-4.5 text-left gap-4">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[11px] font-medium ${open === i ? 'text-[var(--accent)]' : 'text-[var(--text3)]'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-semibold text-[var(--text)] leading-snug">{faq.q}</span>
                </div>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${open === i ? 'bg-[var(--accent)]' : 'bg-[var(--bg3)]'}`}>
                  <ChevronDown size={14} className={`transition-transform ${open === i ? 'rotate-180 text-white' : 'text-[var(--text3)]'}`} />
                </div>
              </button>
              <div className={`overflow-hidden transition-all ${open === i ? 'max-h-48' : 'max-h-0'}`}>
                <div className="px-4.5 pb-4.5 pl-12 text-sm text-[var(--text3)] leading-relaxed">{faq.a}</div>
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
  const router = useRouter()
  return (
    <section className="py-28 px-6 bg-[var(--bg2)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,var(--electricGlow)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(236,72,153,0.1)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="max-w-[700px] mx-auto text-center relative z-10">
        <div className="sr-scale inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accentS)] border border-[var(--accent)]/20 rounded-full mb-7">
          <Sparkles size={12} className="text-[var(--accent)]" />
          <span className="text-[11px] font-bold text-[var(--accent)] tracking-wider uppercase">Commencez aujourd&apos;hui</span>
        </div>
        <h2 className="sr-hidden text-[clamp(36px,5vw,68px)] font-extrabold tracking-tight leading-[0.92] text-[var(--text)] mb-5">
          Pret a creer des documents
          <br /><span className="gradient-text">qui impressionnent ?</span>
        </h2>
        <p className="sr-hidden text-[15px] text-[var(--text3)] mb-10">
          Rejoignez +500 entreprises, cabinets et consultants qui font confiance a EETRA.
        </p>
        <div className="sr-hidden flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 px-9 py-4 text-[15px] font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] rounded-xl shadow-xl shadow-[var(--electricGlow)] hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            Demarrer gratuitement <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.push('/designs')}
            className="flex items-center gap-2 px-7 py-4 text-[15px] font-semibold text-[var(--text2)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-xl transition-all"
          >
            Voir les designs
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[var(--bg)] border-t border-[var(--border)] pt-16 pb-8 px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--electric)] flex items-center justify-center">
                <FileText size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-[17px] font-extrabold tracking-tight text-[var(--text)]">EETRA</div>
                <div className="text-[9px] text-[var(--text3)] tracking-widest uppercase">Document Intelligence</div>
              </div>
            </div>
            <p className="text-sm text-[var(--text3)] leading-relaxed mb-5">Plateforme B2B de creation de documents professionnels pour l&apos;Afrique de l&apos;Ouest.</p>
            <div className="flex flex-col gap-2">
              {[['Douala, Cameroun'], ['contact@eetra.app'], ['eetra.buyticle.com']].map(([t]) => (
                <span key={t} className="text-xs text-[var(--text3)]">{t}</span>
              ))}
            </div>
          </div>
          {[
            { title: 'Produit', links: ['Fonctionnalites', 'Templates', 'Designs', 'Tarifs'] },
            { title: 'Ressources', links: ['Bibliotheque OHADA', 'Guides business', 'Blog', 'Documentation'] },
            { title: 'Entreprise', links: ['A propos', 'Mentions legales', 'Confidentialite', 'Contact'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div className="text-[11px] font-bold tracking-wider uppercase text-[var(--text3)] mb-4">{title}</div>
              <div className="flex flex-col gap-2.5">
                {links.map(l => (
                  <a key={l} href="#" className="text-sm text-[var(--text3)] hover:text-[var(--text)] transition-colors">{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] pt-6 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-[var(--text3)]">&copy; 2026 EETRA - Tous droits reserves - Douala, Cameroun</span>
          <span className="text-[11px] text-[var(--text3)] font-mono">v2.2.0</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function EetraLanding() {
  useScrollObserver()

  return (
    <div className="font-sans">
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
