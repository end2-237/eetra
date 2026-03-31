'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { DesignShowcase } from '@/components/landing/DesignShowcase'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { PremiumCTA } from '@/components/landing/PremiumCTA'
import { Footer } from '@/components/landing/Footer'
import { TEMPLATES } from '@/lib/templates'
import { ArrowRight, Sparkles } from 'lucide-react'

// ── Scroll reveal engine ────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('sr-in')
      }),
      { threshold: 0.07, rootMargin: '0px 0px -48px 0px' }
    )
    document.querySelectorAll('[data-sr]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ── Parallax engine ─────────────────────────────────────────────────────────
function useParallax() {
  useEffect(() => {
    let raf: number
    const tick = () => {
      const sy = window.scrollY
      document.querySelectorAll<HTMLElement>('[data-p]').forEach(el => {
        const r = parseFloat(el.dataset.p || '0.2')
        el.style.transform = `translateY(${sy * r}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
}

// ── Progress bar ────────────────────────────────────────────────────────────
function ProgressBar() {
  useEffect(() => {
    const bar = document.getElementById('__pg')
    const onScroll = () => {
      if (!bar) return
      const h = document.documentElement.scrollHeight - window.innerHeight
      bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, pointerEvents: 'none' }}>
      <div id="__pg" style={{
        height: '100%', width: '0%',
        background: 'linear-gradient(90deg,#1B4FD8,#5B9BFF 50%,#7C3AED)',
        boxShadow: '0 0 14px rgba(91,155,255,.7)',
        transition: 'width .04s linear',
      }} />
    </div>
  )
}

// ── SR wrapper ───────────────────────────────────────────────────────────────
function SR({ children, d = 0, from = 'up', style = {}, className = '' }:
  { children: React.ReactNode; d?: number; from?: 'up'|'left'|'right'|'scale'|'fade'; style?: React.CSSProperties; className?: string }) {
  const t: Record<string,string> = {
    up: 'translateY(44px)', left: 'translateX(-36px)', right: 'translateX(36px)',
    scale: 'scale(0.91)', fade: 'translateY(16px)',
  }
  return (
    <div data-sr className={className} style={{
      opacity: 0, transform: t[from] || t.up,
      transition: `opacity .75s cubic-bezier(.23,1,.32,1) ${d}ms, transform .75s cubic-bezier(.23,1,.32,1) ${d}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────
const Ico = {
  bp: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 16l4-5 4 3 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ao: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  audit: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  memo: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  contrat: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  devis: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 9h20" stroke="currentColor" strokeWidth="1.5"/><path d="M6 14h4M14 14h4M6 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
}

// ── Mini cover SVGs ───────────────────────────────────────────────────────────
function Classic({ a }: { a: string }) {
  return <svg viewBox="0 0 120 170" style={{ width:'100%',height:'100%',display:'block' }}>
    <rect width="120" height="170" fill="#fff"/>
    <rect x="0" y="0" width="5" height="170" fill={a}/>
    <rect x="5" y="0" width="115" height="3" fill={a} opacity=".15"/>
    <rect x="14" y="14" width="28" height="28" rx="6" fill={a} opacity=".1"/>
    <rect x="18" y="20" width="12" height="2.5" rx="1.25" fill={a}/>
    <rect x="18" y="25" width="16" height="2.5" rx="1.25" fill={a} opacity=".55"/>
    <rect x="18" y="30" width="10" height="2" rx="1" fill={a} opacity=".35"/>
    <rect x="47" y="22" width="36" height="3.5" rx="1.75" fill="#111" opacity=".8"/>
    <rect x="47" y="29" width="24" height="2.5" rx="1.25" fill="#999" opacity=".55"/>
    <rect x="14" y="52" width="22" height="2.5" rx="1.25" fill={a}/>
    <rect x="38" y="53" width="68" height="1" fill="#E8E8E8"/>
    <rect x="14" y="60" width="48" height="2.5" rx="1.25" fill={a} opacity=".45"/>
    <rect x="14" y="72" width="88" height="7.5" rx="3.75" fill="#0D1117" opacity=".88"/>
    <rect x="14" y="84" width="68" height="7.5" rx="3.75" fill="#0D1117" opacity=".82"/>
    <rect x="14" y="97" width="44" height="5" rx="2.5" fill="#555" opacity=".38"/>
    <rect x="14" y="114" width="92" height="28" rx="5" fill="#F5F7FA"/>
    {[0,1,2].map(i=><g key={i}><rect x={19+i*33} y="119" width="18" height="2.5" rx="1.25" fill="#BBB"/><rect x={19+i*33} y="125" width="24" height="2.5" rx="1.25" fill="#555"/></g>)}
    <rect x="14" y="152" width="92" height=".75" fill="#F0F0F0"/>
    <rect x="14" y="158" width="40" height="2.5" rx="1.25" fill="#CCC"/>
    <rect x="96" y="153" width="14" height="14" rx="3" fill="#F5F5F5"/>
    <rect x="98" y="155" width="4" height="4" rx=".5" fill="#DDD"/>
    <rect x="104" y="155" width="4" height="4" rx=".5" fill="#DDD"/>
    <rect x="98" y="161" width="4" height="4" rx=".5" fill="#DDD"/>
    <rect x="104" y="161" width="2" height="2" rx=".5" fill="#DDD"/>
  </svg>
}

function Bold({ a }: { a: string }) {
  return <svg viewBox="0 0 120 170" style={{ width:'100%',height:'100%',display:'block' }}>
    <rect width="120" height="170" fill={a}/>
    <circle cx="108" cy="28" r="52" fill="rgba(255,255,255,.06)"/>
    <circle cx="12" cy="152" r="32" fill="rgba(255,255,255,.04)"/>
    <rect x="12" y="16" width="26" height="26" rx="6" fill="rgba(255,255,255,.16)"/>
    <rect x="17" y="22" width="10" height="2" rx="1" fill="rgba(255,255,255,.8)"/>
    <rect x="17" y="26" width="14" height="2" rx="1" fill="rgba(255,255,255,.5)"/>
    <rect x="17" y="30" width="8" height="2" rx="1" fill="rgba(255,255,255,.35)"/>
    <rect x="60" y="18" width="48" height="10" rx="5" fill="rgba(255,255,255,.12)"/>
    <rect x="64" y="21.5" width="28" height="3" rx="1.5" fill="rgba(255,255,255,.6)"/>
    <rect x="12" y="72" width="55" height="3" rx="1.5" fill="rgba(255,255,255,.45)"/>
    <rect x="12" y="82" width="88" height="10" rx="5" fill="rgba(255,255,255,.92)"/>
    <rect x="12" y="96" width="66" height="10" rx="5" fill="rgba(255,255,255,.88)"/>
    <rect x="12" y="112" width="44" height="5" rx="2.5" fill="rgba(255,255,255,.38)"/>
    <rect x="12" y="125" width="22" height="2" rx="1" fill="rgba(255,255,255,.3)"/>
    <rect x="12" y="133" width="30" height="3" rx="1.5" fill="rgba(255,255,255,.65)"/>
    <rect x="50" y="133" width="30" height="3" rx="1.5" fill="rgba(255,255,255,.65)"/>
    <rect x="0" y="156" width="120" height="14" fill="rgba(0,0,0,.22)"/>
    <rect x="12" y="161" width="40" height="2.5" rx="1.25" fill="rgba(255,255,255,.42)"/>
    <rect x="96" y="158" width="12" height="12" rx="2" fill="rgba(255,255,255,.14)"/>
    <rect x="97.5" y="159.5" width="3.5" height="3.5" rx=".5" fill="rgba(255,255,255,.5)"/>
    <rect x="103" y="159.5" width="3.5" height="3.5" rx=".5" fill="rgba(255,255,255,.5)"/>
    <rect x="97.5" y="165" width="3.5" height="3.5" rx=".5" fill="rgba(255,255,255,.5)"/>
  </svg>
}

function Minimal({ a }: { a: string }) {
  return <svg viewBox="0 0 120 170" style={{ width:'100%',height:'100%',display:'block' }}>
    <rect width="120" height="170" fill="#fff"/>
    <rect x="0" y="167" width="120" height="3" fill={a}/>
    <rect x="12" y="16" width="50" height="3" rx="1.5" fill="#999" opacity=".55"/>
    <rect x="12" y="22" width="32" height="2" rx="1" fill="#CCC" opacity=".45"/>
    <rect x="12" y="68" width="96" height="11" rx="5.5" fill="#0D1117" opacity=".9"/>
    <rect x="12" y="84" width="74" height="9" rx="4.5" fill="#0D1117" opacity=".82"/>
    <rect x="12" y="99" width="52" height="6.5" rx="3.25" fill="#444" opacity=".36"/>
    <rect x="12" y="115" width="96" height=".75" fill="#E0E0E0"/>
    {[0,1,2].map(i=><g key={i}>
      <rect x="12" y={123+i*9} width="22" height="2.5" rx="1.25" fill="#BBB"/>
      <rect x="38" y={123+i*9} width={[36,44,28][i]} height="2.5" rx="1.25" fill="#555"/>
    </g>)}
    <rect x="96" y="153" width="14" height="14" rx="3" fill="#F5F5F5"/>
    <rect x="98" y="155" width="4" height="4" rx=".5" fill="#DDD"/>
    <rect x="104" y="155" width="4" height="4" rx=".5" fill="#DDD"/>
    <rect x="98" y="161" width="4" height="4" rx=".5" fill="#DDD"/>
  </svg>
}

function Split({ a }: { a: string }) {
  return <svg viewBox="0 0 120 170" style={{ width:'100%',height:'100%',display:'block' }}>
    <rect width="120" height="170" fill="#fff"/>
    <rect x="0" y="0" width="54" height="170" fill={a}/>
    <circle cx="27" cy="22" r="42" fill="rgba(255,255,255,.07)"/>
    <rect x="10" y="14" width="22" height="22" rx="5" fill="rgba(255,255,255,.18)"/>
    <rect x="14" y="19" width="8" height="2" rx="1" fill="rgba(255,255,255,.8)"/>
    <rect x="14" y="23" width="12" height="1.5" rx=".75" fill="rgba(255,255,255,.5)"/>
    <rect x="14" y="27" width="6" height="1.5" rx=".75" fill="rgba(255,255,255,.35)"/>
    <rect x="10" y="80" width="38" height="3" rx="1.5" fill="rgba(255,255,255,.45)"/>
    <rect x="10" y="88" width="34" height="9" rx="4.5" fill="rgba(255,255,255,.92)"/>
    <rect x="10" y="101" width="26" height="7" rx="3.5" fill="rgba(255,255,255,.68)"/>
    <rect x="10" y="116" width="18" height="1.5" rx=".75" fill="rgba(255,255,255,.28)"/>
    <rect x="10" y="122" width="30" height="2.5" rx="1.25" fill="rgba(255,255,255,.52)"/>
    <rect x="10" y="129" width="22" height="2.5" rx="1.25" fill="rgba(255,255,255,.32)"/>
    <rect x="60" y="14" width="48" height="10" rx="5" fill={a} opacity=".08"/>
    <rect x="64" y="18" width="24" height="2" rx="1" fill={a} opacity=".5"/>
    {[0,1,2].map(i=><g key={i}>
      <rect x="60" y={50+i*28} width="48" height="20" rx="4" fill="#F8F9FB"/>
      <rect x="65" y={56+i*28} width="16" height="2" rx="1" fill="#CCC"/>
      <rect x="65" y={62+i*28} width="28" height="2.5" rx="1.25" fill="#555"/>
    </g>)}
    <rect x="60" y="142" width="48" height=".75" fill="#F0F0F0"/>
    <rect x="60" y="148" width="36" height="2.5" rx="1.25" fill="#CCC"/>
    <rect x="60" y="155" width="24" height="2" rx="1" fill="#DDD"/>
  </svg>
}

function Editorial({ a }: { a: string }) {
  return <svg viewBox="0 0 120 170" style={{ width:'100%',height:'100%',display:'block' }}>
    <rect width="120" height="170" fill="#0D1117"/>
    <rect x="0" y="0" width="120" height="44" fill={a}/>
    <polygon points="0,44 62,44 0,72" fill={a} opacity=".22"/>
    <rect x="12" y="12" width="50" height="3" rx="1.5" fill="rgba(255,255,255,.9)"/>
    <rect x="12" y="18" width="32" height="2.5" rx="1.25" fill="rgba(255,255,255,.5)"/>
    <rect x="12" y="24" width="20" height="2" rx="1" fill="rgba(255,255,255,.32)"/>
    <rect x="84" y="13" width="24" height="8" rx="4" fill="rgba(255,255,255,.12)"/>
    <rect x="87" y="16" width="14" height="2" rx="1" fill="rgba(255,255,255,.5)"/>
    <rect x="12" y="72" width="88" height="8" rx="4" fill="rgba(255,255,255,.88)"/>
    <rect x="12" y="85" width="66" height="7" rx="3.5" fill="rgba(255,255,255,.72)"/>
    <rect x="12" y="100" width="88" height=".75" fill="rgba(255,255,255,.08)"/>
    {[0,1,2,3].map(i=><rect key={i} x="12" y={108+i*10} width={[88,66,74,52][i]} height="3" rx="1.5" fill="rgba(255,255,255,.1)"/>)}
    <rect x="0" y="154" width="120" height="16" fill={a}/>
    <rect x="12" y="160" width="40" height="2.5" rx="1.25" fill="rgba(255,255,255,.68)"/>
    <rect x="102" y="159" width="7" height="4" rx="1" fill="rgba(255,255,255,.28)"/>
  </svg>
}

function Corporate({ a }: { a: string }) {
  return <svg viewBox="0 0 120 170" style={{ width:'100%',height:'100%',display:'block' }}>
    <rect width="120" height="170" fill="#fff"/>
    <rect x="0" y="0" width="120" height="6" fill={a}/>
    <polygon points="0,6 46,6 0,46" fill={a} opacity=".05"/>
    <rect x="12" y="16" width="44" height="3" rx="1.5" fill="#111" opacity=".78"/>
    <rect x="88" y="16" width="20" height="3" rx="1.5" fill="#999" opacity=".55"/>
    <rect x="12" y="22" width="26" height=".75" fill="#E8E8E8"/>
    {[0,1,2].map(i=><g key={i}>
      <rect x={12+i*37} y="32" width="31" height="22" rx="4" fill="#F5F7FA"/>
      <rect x={12+i*37} y="32" width="31" height="3" rx="2" fill={a}/>
      <rect x={16+i*37} y="41" width="16" height="4" rx="2" fill={a} opacity=".22"/>
      <rect x={16+i*37} y="49" width="20" height="2.5" rx="1.25" fill="#AAA"/>
    </g>)}
    <rect x="12" y="62" width="22" height="2.5" rx="1.25" fill={a}/>
    <rect x="36" y="63" width="72" height=".75" fill="#E8E8E8"/>
    <rect x="12" y="72" width="92" height="9" rx="4.5" fill="#0D1117" opacity=".88"/>
    <rect x="12" y="86" width="70" height="8" rx="4" fill="#0D1117" opacity=".8"/>
    <rect x="12" y="100" width="46" height="6" rx="3" fill="#666" opacity=".36"/>
    {[0,1,2].map(i=><rect key={i} x="12" y={115+i*9} width={i===1?72:88} height="3.5" rx="1.75" fill="#F0F0F0"/>)}
    <rect x="12" y="150" width="96" height=".75" fill="#E8E8E8"/>
    <rect x="12" y="157" width="48" height="2.5" rx="1.25" fill="#CCC"/>
    <rect x="96" y="153" width="14" height="14" rx="3" fill="#F5F5F5"/>
    <rect x="98" y="155" width="4" height="4" rx=".5" fill="#DDD"/>
    <rect x="104" y="155" width="4" height="4" rx=".5" fill="#DDD"/>
    <rect x="98" y="161" width="4" height="4" rx=".5" fill="#DDD"/>
  </svg>
}

const DESIGNS = [
  { a:'#1B4FD8', name:'Classic',   C: Classic },
  { a:'#059669', name:'Bold',      C: Bold },
  { a:'#374151', name:'Minimal',   C: Minimal },
  { a:'#7C3AED', name:'Split',     C: Split },
  { a:'#B45309', name:'Editorial', C: Editorial },
  { a:'#0E7490', name:'Corporate', C: Corporate },
]

// ── Global styles ────────────────────────────────────────────────────────────
const CSS = `
  [data-sr].sr-in { opacity:1 !important; transform:none !important; }

  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }

  .d-card {
    border-radius: 18px; overflow: hidden;
    border: 1.5px solid rgba(27,79,216,.12);
    box-shadow: 0 8px 32px rgba(0,0,0,.08);
    transition: transform .3s cubic-bezier(.23,1,.32,1), box-shadow .3s ease, border-color .2s;
    cursor: pointer; position: relative; background: rgba(255,255,255,.6); backdrop-filter: blur(8px);
  }
  .d-card:hover { transform: translateY(-12px) scale(1.04) !important; box-shadow: 0 20px 60px rgba(27,79,216,.15) !important; border-color: rgba(27,79,216,.25) !important; }

  .tpl-card {
    border-radius: 18px; border: 1.5px solid rgba(27,79,216,.1);
    padding: 24px 20px; cursor: pointer;
    background: rgba(255,255,255,.6); backdrop-filter: blur(12px);
    transition: transform .25s cubic-bezier(.23,1,.32,1), box-shadow .25s, border-color .2s, background .2s;
  }
  .tpl-card:hover {
    border-color: rgba(27,79,216,.3) !important;
    transform: translateY(-6px);
    box-shadow: 0 16px 48px rgba(27,79,216,.12);
    background: rgba(255,255,255,.8) !important;
  }

  .cta-btn {
    transition: transform .25s cubic-bezier(.23,1,.32,1), box-shadow .25s, background .25s;
    background: linear-gradient(135deg,#1B4FD8 0%,#5B9BFF 100%);
    position: relative; overflow: hidden;
  }
  .cta-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); transform: translateX(-100%); transition: transform .6s; }
  .cta-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 60px rgba(27,79,216,.5) !important;
  }
  .cta-btn:hover::before { transform: translateX(100%); }

  .ghost-btn {
    transition: border-color .2s, color .2s, background .2s;
    background: rgba(27,79,216,.06) !important;
    border: 1.5px solid rgba(27,79,216,.2) !important;
  }
  .ghost-btn:hover {
    border-color: var(--accent) !important;
    color: var(--accent) !important;
    background: rgba(27,79,216,.12) !important;
  }
`

export default function LandingPage() {
  const router = useRouter()
  useScrollReveal()
  useParallax()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <ProgressBar />

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <Hero />
          <DesignShowcase />
          <Features />

          {/* ── Marquee strip ── */}
          <SR style={{ width: '100%', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#1B4FD8 0%,#5B9BFF 100%)', padding: '16px 0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(27,79,216,.25)' }}>
              <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 24s linear infinite', alignItems: 'center' }}>
                {Array.from({ length: 4 }).flatMap(() =>
                  ['Business Plan','·','Rapport d\'Audit','·','Appel d\'Offres','·','Contrat OHADA','·','Note de Direction','·','Devis Pro','·','Export PDF','·','Export Word .docx','·','IA Rédactionnelle','·']
                ).map((t, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: t==='·'?400:700, color: t==='·'?'rgba(255,255,255,.25)':'rgba(255,255,255,.88)', letterSpacing: '.04em', marginRight: 28, textTransform: t==='·'?'none':'capitalize' }}>{t}</span>
                ))}
              </div>
            </div>
          </SR>

          {/* ── Design showcase ── */}
          <section style={{ width:'100%', padding:'100px 0', background:'var(--bg2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
            <div data-p="0.12" style={{ position:'absolute', top:-100, right:-100, width:450, height:450, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(27,79,216,.06),transparent 70%)', pointerEvents:'none' }}/>
            <div data-p="0.07" style={{ position:'absolute', bottom:-60, left:-60, width:320, height:320, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(124,58,237,.05),transparent 70%)', pointerEvents:'none' }}/>

            <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 48px', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:56, flexWrap:'wrap', gap:16 }}>
                <div>
                  <SR d={0}><div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:99, background:'var(--accentS2)', color:'var(--accent)', fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:14 }}><Sparkles size={10}/> 9 designs A4</div></SR>
                  <SR d={70}><h2 style={{ fontSize:'clamp(26px,3vw,44px)', fontWeight:900, letterSpacing:'-.04em', color:'var(--text)', lineHeight:.95, margin:0 }}>Votre document,{' '}<span style={{ fontFamily:'var(--font-playfair,Georgia,serif)', fontStyle:'italic', fontWeight:400, color:'var(--text3)' }}>votre signature.</span></h2></SR>
                </div>
                <SR d={140} from="left">
                  <button className="ghost-btn" onClick={()=>router.push('/designs')} style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 22px', borderRadius:12, background:'transparent', color:'var(--accent)', border:'1.5px solid var(--accent)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    Voir tous les designs <ArrowRight size={13}/>
                  </button>
                </SR>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:16, alignItems:'end' }}>
                {DESIGNS.map(({ a, name, C }, i) => (
                  <SR key={i} d={i*75} from="up">
                    <div onClick={()=>router.push('/designs')} style={{ cursor:'pointer', display:'flex', flexDirection:'column', gap:10, marginTop:[0,22,8,30,4,18][i] }}>
                      <div className="d-card" style={{ '--hc': a } as any}
                        onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow=`0 24px 56px rgba(0,0,0,.18),0 8px 16px ${a}28`;el.style.borderColor=a}}
                        onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='';el.style.borderColor='var(--border)'}}>
                        <C a={a}/>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:a, flexShrink:0 }}/>
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--text3)' }}>{name}</span>
                      </div>
                    </div>
                  </SR>
                ))}
              </div>
            </div>
          </section>

          {/* ── Templates ── */}
          <section id="templates" style={{ width:'100%', padding:'100px 0', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
            <div data-p="0.08" style={{ position:'absolute', top:'25%', left:'50%', transform:'translateX(-50%)', width:600, height:400, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(27,79,216,.04),transparent 60%)', pointerEvents:'none' }}/>

            <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 48px', position:'relative' }}>
              <div style={{ textAlign:'center', marginBottom:56 }}>
                <SR d={0}><div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:99, background:'var(--accentS2)', color:'var(--accent)', fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:16 }}>Smart Templates</div></SR>
                <SR d={70}><h2 style={{ fontSize:'clamp(28px,3vw,48px)', fontWeight:900, letterSpacing:'-.04em', color:'var(--text)', lineHeight:.95, marginBottom:14 }}>6 modèles prêts à l'emploi</h2></SR>
                <SR d={140}><p style={{ fontSize:14, color:'var(--text3)' }}>Chacun enrichi avec tableaux, clauses, KPIs et zones de signature.</p></SR>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14 }}>
                {TEMPLATES.map((t, i) => {
                  const Icon = Ico[t.id as keyof typeof Ico] || Ico.ao
                  return (
                    <SR key={t.id} d={i*55} from="up">
                      <div className="tpl-card" onClick={()=>router.push('/login')} style={{ display:'flex', flexDirection:'column', gap:12, height:'100%' }}>
                        <div style={{ color:'var(--accent)' }}><Icon/></div>
                        <div style={{ fontSize:13, fontWeight:800, color:'var(--text)', letterSpacing:'-.01em' }}>{t.name}</div>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          {t.tags.slice(0,2).map(tag=><span key={tag} style={{ fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', padding:'2px 7px', borderRadius:99, background:'var(--accentS2)', color:'var(--accent)' }}>{tag}</span>)}
                        </div>
                      </div>
                    </SR>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── Pricing ── */}
          <div style={{ width:'100%' }} data-sr style={{ opacity:0, transform:'translateY(32px)', transition:'opacity .75s cubic-bezier(.23,1,.32,1), transform .75s cubic-bezier(.23,1,.32,1)' } as any}>
            <Pricing/>
          </div>

          {/* ── FAQ ── */}
          <div data-sr style={{ width:'100%', opacity:0, transform:'translateY(32px)', transition:'opacity .75s cubic-bezier(.23,1,.32,1), transform .75s cubic-bezier(.23,1,.32,1)' } as any}>
            <FAQ/>
          </div>

          {/* ── Premium CTA ── */}
          <div style={{ width:'100%' }}>
            <PremiumCTA/>
          </div>

          {/* ── Footer ── */}
          <div data-sr style={{ width:'100%', opacity:0, transform:'translateY(24px)', transition:'opacity .75s cubic-bezier(.23,1,.32,1), transform .75s cubic-bezier(.23,1,.32,1)' } as any}>
            <Footer/>
          </div>

        </main>
      </div>
    </>
  )
}
