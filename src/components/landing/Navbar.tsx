'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import logo from '../../app/icon.png'

interface NavbarProps {
  onScrollTo?: (id: string) => void
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const router = useRouter()

  const handleNav = (item: { label: string; id?: string; href?: string }) => {
    if (item.href) {
      router.push(item.href)
      return
    }
    if (item.id) {
      const el = document.getElementById(item.id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      onScrollTo?.(item.id)
    }
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top micro-bar */}
      <div
        className="border-b px-12 py-2 flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}
      >
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: 'var(--success)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--success)' }} />
            Statut : Opérationnel
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text4)' }}>
            v2.0 · Paiements FCFA · Orange Money · Wave · MTN Mobile Money
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px]" style={{ color: 'var(--text4)' }}>
            Essai gratuit — Aucune carte bancaire requise
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="px-12 flex items-center justify-between" style={{ height: '80px' }}>

        {/* Logo — inline SVG exact du favicon */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0" style={{ textDecoration: 'none' }}>
          <Image
            src={logo}
            alt="EETRA logo"
            width={40}
            height={40}
            style={{ borderRadius: 9 }}
          />
          <div>
            <div
              className="text-xl font-black tracking-tight leading-none"
              style={{ color: 'var(--text)', letterSpacing: '-0.04em' }}
            >
              EETRA
            </div>
            <div
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text4)', letterSpacing: '.15em' }}
            >
              Document Intelligence
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Fonctionnalités', id: 'features' },
            { label: 'Templates',       id: 'templates' },
            { label: 'Designs',         href: '/designs' },
            { label: 'Tarifs',          id: 'pricing' },
            { label: 'FAQ',             id: 'faq' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => handleNav(item)}
              className="px-4 py-2.5 rounded-lg text-[13px] transition-all duration-150 cursor-pointer border border-transparent"
              style={{ color: 'var(--text3)', fontWeight: 500, background: 'transparent' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color      = 'var(--text)'
                el.style.background = 'var(--bg2)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color      = 'var(--text3)'
                el.style.background = 'transparent'
              }}
            >
              {item.label}
              {/* Petit point accentué pour "Designs" — nouveau */}
              {item.href === '/designs' && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--accent)',
                    marginLeft: 5, verticalAlign: 'middle',
                    opacity: .7,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-px h-6" style={{ background: 'var(--border)' }} />
          <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
            Connexion
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/login')}>
            Essai gratuit
            <span className="text-white/60">→</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}