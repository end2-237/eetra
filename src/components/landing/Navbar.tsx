'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { X, Menu } from 'lucide-react'
import logo from '../../app/icon.png'

interface NavbarProps {
  onScrollTo?: (id: string) => void
}

const NAV_ITEMS = [
  { label: 'Fonctionnalités', id: 'features' },
  { label: 'Templates',       id: 'templates' },
  { label: 'Designs',         href: '/designs' },
  { label: 'Tarifs',          id: 'pricing' },
  { label: 'FAQ',             id: 'faq' },
]

const CSS = `
  .nav-micro { border-bottom:1px solid rgba(255,255,255,.08); background:linear-gradient(180deg,var(--bg) 0%,rgba(0,0,0,.02) 100%); padding:0 48px; display:flex; align-items:center; justify-content:space-between; height:36px; }
  .nav-main  { padding:0 48px; display:flex; align-items:center; justify-content:space-between; height:80px; }
  .nav-links  { display:flex; align-items:center; gap:2px; }
  .nav-btn-item { padding:8px 16px; border-radius:10px; border:1px solid rgba(27,79,216,.1); cursor:pointer; font-size:13px; font-weight:500; color:var(--text3); background:rgba(255,255,255,.4); backdrop-filter:blur(8px); transition:all .2s cubic-bezier(.23,1,.32,1); white-space:nowrap; }
  .nav-btn-item:hover { color:var(--accent); background:rgba(27,79,216,.08); border-color:rgba(27,79,216,.3); transform:translateY(-1px); }
  .nav-hamburger { display:none; background:none; border:none; cursor:pointer; color:var(--text); padding:6px; }
  .nav-mobile-overlay { display:none; position:fixed; inset:0; z-index:200; }
  .nav-mobile-menu { position:fixed; top:0; right:0; bottom:0; width:280px; background:var(--surface); backdrop-filter:blur(20px); border-left:1px solid rgba(255,255,255,.08); z-index:201; padding:20px; display:flex; flex-direction:column; gap:4px; box-shadow:-12px 4px 40px rgba(0,0,0,.2); transform:translateX(100%); transition:transform .3s cubic-bezier(.23,1,.32,1); }
  .nav-mobile-menu.open { transform:translateX(0); }
  .nav-mobile-overlay.open { display:block; background:rgba(0,0,0,.5); }
  .nav-mobile-item { width:100%; text-align:left; padding:13px 14px; border-radius:12px; background:rgba(27,79,216,.05); border:1px solid rgba(27,79,216,.1); cursor:pointer; font-size:15px; font-weight:600; color:var(--text2); transition:all .15s; }
  .nav-mobile-item:hover { background:rgba(27,79,216,.12); border-color:rgba(27,79,216,.3); transform:translateX(4px); }
  .nav-actions { display:flex; align-items:center; gap:10px; }

  @media (max-width: 767px) {
    .nav-micro   { padding:0 16px; height:32px; }
    .nav-micro-right { display:none; }
    .nav-micro-left span:last-child { display:none; }
    .nav-main    { padding:0 16px; height:60px; }
    .nav-main > a > div:last-child { display:none; }
    .nav-links   { display:none; }
    .nav-hamburger { display:flex; }
    .nav-actions .btn-ghost { display:none; }
    .nav-actions .btn-primary { font-size:12px; padding:8px 14px; }
  }
  @media (max-width: 479px) {
    .nav-micro   { padding:0 12px; height:28px; font-size:10px; }
    .nav-micro-left span:first-child { display:none; }
    .nav-main    { padding:0 12px; height:56px; gap:8px; }
    .nav-main > a { gap:6px; }
    .nav-main > a > div:first-child { width:28px; height:28px; }
    .nav-actions .btn-primary { font-size:11px; padding:6px 10px; }
    .nav-actions .btn-primary span { display:none; }
  }
`

export function Navbar({ onScrollTo }: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

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

      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(255,255,255,.7)', borderColor: 'rgba(255,255,255,.1)', backdropFilter: 'blur(16px)', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>

        {/* Micro-bar */}
        <div className="nav-micro">
          <div className="nav-micro-left" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--success)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              Statut : Opérationnel
            </span>
            <span style={{ fontSize: 11, color: 'var(--text4)' }}>
              v2.0 · Mobile Money · Orange · Wave · MTN
            </span>
          </div>
          <div className="nav-micro-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text4)' }}>Essai gratuit — Aucune carte requise</span>
          </div>
        </div>

        {/* Main nav */}
        <div className="nav-main">
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <Image src={logo} alt="EETRA" width={36} height={36} style={{ borderRadius: 9 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-.04em', color: 'var(--text)' }}>EETRA</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)' }}>Document Intelligence</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            {NAV_ITEMS.map(item => (
              <button key={item.label} className="nav-btn-item" onClick={() => handleNav(item)}>
                {item.label}
                {item.href === '/designs' && (
                  <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', marginLeft: 5, verticalAlign: 'middle', opacity: .7 }} />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <ThemeToggle />
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Connexion</Button>
            <button onClick={() => router.push('/login')} style={{
              background: 'linear-gradient(135deg,#1B4FD8 0%,#5B9BFF 100%)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .25s cubic-bezier(.23,1,.32,1)',
              boxShadow: '0 8px 24px rgba(27,79,216,.35)',
              position: 'relative', overflow: 'hidden',
              onMouseEnter: (e) => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 12px 36px rgba(27,79,216,.45)' }),
              onMouseLeave: (e) => Object.assign(e.currentTarget.style, { transform: 'translateY(0)', boxShadow: '0 8px 24px rgba(27,79,216,.35)' }),
            }} onMouseEnter={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 12px 36px rgba(27,79,216,.45)' })} onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(0)', boxShadow: '0 8px 24px rgba(27,79,216,.35)' })}>
              Essai gratuit →
            </button>
            <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`nav-mobile-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile menu */}
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Menu</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {NAV_ITEMS.map(item => (
          <button key={item.label} className="nav-mobile-item" onClick={() => handleNav(item)}>
            {item.label}
          </button>
        ))}

        <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
        <button className="nav-mobile-item" style={{ color: 'var(--text4)' }} onClick={() => { setMenuOpen(false); router.push('/login') }}>
          Connexion
        </button>
        <button onClick={() => { setMenuOpen(false); router.push('/login') }}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, marginTop: 8 }}>
          Essai gratuit →
        </button>
      </div>
    </>
  )
}
