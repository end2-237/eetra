'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { X, Menu, ArrowRight, Sparkles } from 'lucide-react'
import logo from '../../app/icon.png'

interface NavbarProps {
  onScrollTo?: (id: string) => void
}

const NAV_ITEMS = [
  { label: 'Fonctionnalites', id: 'features' },
  { label: 'Templates',       id: 'templates' },
  { label: 'Designs',         href: '/designs' },
  { label: 'Tarifs',          id: 'pricing' },
  { label: 'FAQ',             id: 'faq' },
]

const CSS = `
  .nav-wrapper {
    position: sticky; top: 0; z-index: 100;
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: background .3s, box-shadow .3s;
  }
  .nav-wrapper.scrolled {
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  .dark .nav-wrapper.scrolled {
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  
  .nav-micro { 
    border-bottom: 1px solid var(--border); 
    background: var(--bg2); 
    padding: 0 56px; 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    height: 38px; 
  }
  .nav-main { 
    padding: 0 56px; 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    height: 72px; 
  }
  
  .nav-links { display: flex; align-items: center; gap: 2px; }
  .nav-btn-item { 
    padding: 8px 16px; 
    border-radius: 10px; 
    border: 1px solid transparent; 
    cursor: pointer; 
    font-size: 14px; 
    font-weight: 600; 
    color: var(--text3); 
    background: transparent; 
    transition: all .2s cubic-bezier(.23,1,.32,1); 
    white-space: nowrap;
    position: relative;
  }
  .nav-btn-item::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--accent);
    border-radius: 1px;
    transition: width .2s, left .2s;
  }
  .nav-btn-item:hover { 
    color: var(--text); 
    background: var(--accentS); 
  }
  .nav-btn-item:hover::after {
    width: 20px;
    left: calc(50% - 10px);
  }
  
  .nav-hamburger { 
    display: none; 
    background: none; 
    border: none; 
    cursor: pointer; 
    color: var(--text); 
    padding: 8px;
    border-radius: 10px;
    transition: background .2s;
  }
  .nav-hamburger:hover {
    background: var(--bg2);
  }
  
  .nav-mobile-overlay { 
    display: none; 
    position: fixed; 
    inset: 0; 
    z-index: 200; 
    background: rgba(0,0,0,0);
    transition: background .3s;
  }
  .nav-mobile-overlay.open {
    display: block;
    background: rgba(0,0,0,0.5);
  }
  
  .nav-mobile-menu { 
    position: fixed; 
    top: 0; 
    right: 0; 
    bottom: 0; 
    width: 300px; 
    background: var(--surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid var(--border); 
    z-index: 201; 
    padding: 24px; 
    display: flex; 
    flex-direction: column; 
    gap: 6px; 
    box-shadow: -12px 0 40px rgba(0,0,0,0.15); 
    transform: translateX(100%); 
    transition: transform .35s cubic-bezier(.23,1,.32,1); 
  }
  .nav-mobile-menu.open { transform: translateX(0); }
  
  .nav-mobile-item { 
    width: 100%; 
    text-align: left; 
    padding: 14px 16px; 
    border-radius: 12px; 
    background: transparent; 
    border: none; 
    cursor: pointer; 
    font-size: 15px; 
    font-weight: 600; 
    color: var(--text2); 
    transition: all .15s; 
  }
  .nav-mobile-item:hover { 
    background: var(--accentS); 
    color: var(--accent);
  }
  
  .nav-actions { display: flex; align-items: center; gap: 12px; }
  
  .nav-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--electric) 100%);
    color: #fff;
    border: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 4px 16px var(--electricGlow);
  }
  .nav-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--electricGlow);
  }

  @media (max-width: 1023px) {
    .nav-links { display: none; }
    .nav-hamburger { display: flex; }
  }
  
  @media (max-width: 767px) {
    .nav-micro { padding: 0 18px; height: 32px; font-size: 10px; }
    .nav-micro-right { display: none; }
    .nav-micro-left span:last-child { display: none; }
    .nav-main { padding: 0 18px; height: 60px; gap: 10px; }
    .nav-main > a { gap: 10px; }
    .nav-main > a > div:last-child { display: none; }
    .nav-main > a > div:first-child { width: 36px; height: 36px; }
    .nav-actions .btn-ghost { display: none; }
    .nav-actions .nav-cta-btn { font-size: 12px; padding: 9px 16px; }
    .nav-hamburger { width: 40px; height: 40px; padding: 6px; }
    .nav-mobile-menu { width: 280px; }
  }
  
  @media (max-width: 599px) {
    .nav-micro { padding: 0 14px; height: 28px; font-size: 9px; }
    .nav-micro-left span { gap: 4px; }
    .nav-main { padding: 0 14px; height: 56px; }
    .nav-main > a > div:first-child { width: 34px; height: 34px; }
    .nav-main > a > div:first-child + div span:nth-child(1) { font-size: 16px; }
    .nav-actions { gap: 8px; }
    .nav-actions .nav-cta-btn { font-size: 12px; padding: 8px 14px; gap: 6px; }
    .nav-hamburger { width: 38px; }
  }
  
  @media (max-width: 479px) {
    .nav-micro { padding: 0 12px; height: 26px; font-size: 8px; }
    .nav-micro-left span { gap: 3px; }
    .nav-micro-left span:first-child { display: none; }
    .nav-main { padding: 0 12px; height: 52px; gap: 6px; }
    .nav-main > a { gap: 6px; }
    .nav-main > a > div:first-child { width: 32px; height: 32px; }
    .nav-main > a > div:nth-child(2) { display: none; }
    .nav-actions { gap: 6px; }
    .nav-actions .nav-cta-btn { font-size: 11px; padding: 7px 12px; gap: 5px; }
    .nav-actions .nav-cta-btn span { display: none; }
    .nav-hamburger { width: 36px; height: 36px; padding: 5px; }
    .nav-mobile-menu { width: 100vw; }
    .nav-mobile-overlay { display: block; }
  }
`

export function Navbar({ onScrollTo }: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (item: { label: string; id?: string; href?: string }) => {
    setMenuOpen(false)
    if (item.href) { router.push(item.href); return }
    if (item.id) {
      const el = document.getElementById(item.id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      onScrollTo?.(item.id)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className={`nav-wrapper${scrolled ? ' scrolled' : ''}`}>

        {/* Micro-bar */}
        <div className="nav-micro">
          <div className="nav-micro-left" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 600, color: 'var(--success)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 8px var(--success)' }} />
              Statut : Operationnel
            </span>
            <span style={{ fontSize: 11, color: 'var(--text4)' }}>
              v2.0 · Mobile Money · Orange · Wave · MTN
            </span>
          </div>
          <div className="nav-micro-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text4)' }}>
              <Sparkles size={11} color="var(--accent)" />
              Essai gratuit — Aucune carte requise
            </span>
          </div>
        </div>

        {/* Main nav */}
        <div className="nav-main">
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Image src={logo} alt="EETRA" width={38} height={38} style={{ borderRadius: 10 }} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: '-.04em', color: 'var(--text)' }}>EETRA</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text4)' }}>Document Intelligence</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            {NAV_ITEMS.map(item => (
              <button key={item.label} className="nav-btn-item" onClick={() => handleNav(item)}>
                {item.label}
                {item.href === '/designs' && (
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginLeft: 6, verticalAlign: 'middle', boxShadow: '0 0 6px var(--accent)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <ThemeToggle />
            <div style={{ width: 1, height: 22, background: 'var(--border)' }} />
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Connexion</Button>
            <button className="nav-cta-btn" onClick={() => router.push('/login')}>
              Essai gratuit <span><ArrowRight size={14} /></span>
            </button>
            <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`nav-mobile-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile menu */}
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src={logo} alt="EETRA" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Menu</span>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'var(--bg2)', border: 'none', borderRadius: 10, cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 8 }}>
            <X size={20} />
          </button>
        </div>

        {NAV_ITEMS.map(item => (
          <button key={item.label} className="nav-mobile-item" onClick={() => handleNav(item)}>
            {item.label}
          </button>
        ))}

        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
        
        <button className="nav-mobile-item" style={{ color: 'var(--text4)' }} onClick={() => { setMenuOpen(false); router.push('/login') }}>
          Connexion
        </button>
        
        <button onClick={() => { setMenuOpen(false); router.push('/login') }}
          style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, var(--accent) 0%, var(--electric) 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px var(--electricGlow)' }}>
          Essai gratuit <ArrowRight size={15} />
        </button>
      </div>
    </>
  )
}
