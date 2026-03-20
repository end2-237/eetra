'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { FileText } from 'lucide-react'
interface NavbarProps {
  onScrollTo?: (id: string) => void
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const router = useRouter()

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    onScrollTo?.(id)
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
          <span
            className="flex items-center gap-2 text-[11px] font-semibold"
            style={{ color: 'var(--success)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
              style={{ background: 'var(--success)' }}
            />
            Statut : Opérationnel
          </span>
          <span
            className="text-[11px]"
            style={{ color: 'var(--text4)' }}
          >
            v2.0 · Paiements FCFA · Orange Money · Wave · MTN Mobile Money
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px]" style={{ color: 'var(--text4)' }}>
            Essai gratuit — Aucune carte bancaire requise
          </span>
        </div>
      </div>

      {/* Main nav — 80px height */}
      <div className="px-12 flex items-center justify-between" style={{ height: '80px' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
          </div>
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
            { label: 'Templates', id: 'templates' },
            { label: 'Tarifs', id: 'pricing' },
            { label: 'FAQ', id: 'faq' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-4 py-2.5 rounded-lg text-[13px] font-500 transition-all duration-150 cursor-pointer border border-transparent"
              style={{ color: 'var(--text3)', fontWeight: 500 }}
              onMouseEnter={e => {
                ;(e.target as HTMLElement).style.color = 'var(--text)'
                ;(e.target as HTMLElement).style.background = 'var(--bg2)'
              }}
              onMouseLeave={e => {
                ;(e.target as HTMLElement).style.color = 'var(--text3)'
                ;(e.target as HTMLElement).style.background = 'transparent'
              }}
            >
              {item.label}
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
