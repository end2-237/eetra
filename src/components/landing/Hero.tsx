'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Zap, Play } from 'lucide-react'

export function Hero() {
  const router = useRouter()
  return (
    <section className="max-w-[1140px] mx-auto px-12 pt-20 pb-16 w-full">
      <div className="max-w-[680px]">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-widest uppercase mb-8 animate-fade-up"
          style={{ borderColor: 'var(--border2)', color: 'var(--text3)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-dot"
            style={{ background: 'var(--success)' }}
          />
          Plateforme Document B2B — v2.0
        </div>

        <h1
          className="text-[clamp(42px,5.5vw,70px)] font-black leading-[.92] tracking-tighter mb-6 animate-fade-up delay-100"
          style={{ color: 'var(--text)' }}
        >
          Vos documents<br />
          professionnels,{' '}
          <span
            className="font-serif italic font-light"
            style={{ color: 'var(--text3)', fontSize: '1.05em' }}
          >
            sans compromis.
          </span>
        </h1>

        <p
          className="text-[16px] leading-relaxed mb-8 animate-fade-up delay-200 max-w-[520px]"
          style={{ color: 'var(--text3)' }}
        >
          EETRA vous permet de créer des Business Plans, Audits, Appels d&apos;Offres
          et Contrats de niveau exécutif — en quelques minutes, avec votre charte graphique.
        </p>

        <div className="flex gap-3 flex-wrap mb-5 animate-fade-up delay-300">
          <Button variant="primary" size="lg" onClick={() => router.push('/login')}>
            <Zap size={16} />
            Commencer gratuitement
          </Button>
          <Button variant="ghost" size="lg" onClick={() => router.push('/login?demo=1')}>
            <Play size={15} />
            Voir la démo
          </Button>
        </div>
        <p className="text-[12px] animate-fade-up delay-400" style={{ color: 'var(--text4)' }}>
          Aucune carte bancaire requise · Annulation à tout moment
        </p>
      </div>

      {/* Doc Mockup */}
      <div
        className="rounded-xl border overflow-hidden mt-14 animate-fade-up delay-500"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,.08), 0 1px 0 rgba(0,0,0,.04)',
          maxWidth: 920,
        }}
      >
        {/* Browser bar */}
        <div
          className="h-9 flex items-center px-3.5 gap-2 border-b"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          <div
            className="flex-1 h-5 rounded-md mx-3 flex items-center px-2.5"
            style={{ background: 'var(--bg3)' }}
          >
            <span className="font-mono text-[10px]" style={{ color: 'var(--text4)' }}>
              eetra.app/doc/BP-2026-Q3
            </span>
          </div>
        </div>
        {/* App preview */}
        <div className="flex" style={{ height: 340 }}>
          {/* Sidebar */}
          <div
            className="w-[110px] flex-shrink-0 border-r p-3 flex flex-col gap-1.5"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
          >
            <div
              className="h-7 rounded-md border-l-2"
              style={{
                background: 'var(--accentS)',
                borderColor: 'var(--accent)',
                borderLeftWidth: 2,
              }}
            />
            <div className="h-7 rounded-md" style={{ background: 'var(--bg3)' }} />
            <div className="h-7 rounded-md" style={{ background: 'var(--bg3)' }} />
            <div className="flex-1" />
            <div className="h-8 rounded-md" style={{ background: 'var(--accent)', opacity: .85 }} />
          </div>

          {/* Document preview */}
          <div
            className="flex-1 flex items-center justify-center p-5"
            style={{ background: 'var(--bg3)' }}
          >
            <div
              className="rounded shadow-xl p-5"
              style={{
                width: 240,
                background: '#fff',
                transform: 'rotate(-.5deg)',
                boxShadow: '0 4px 24px rgba(0,0,0,.12)',
              }}
            >
              <div className="border-l-[3px] border-[#1B4FD8] pl-2.5 mb-3">
                <div className="text-[7px] font-black uppercase tracking-widest text-gray-800">
                  EETRA · Business Plan
                </div>
                <div className="font-mono text-[6px] text-gray-400">REF: BP-2026-Q3</div>
              </div>
              <div className="font-black text-[18px] tracking-tighter leading-none mb-1.5 text-gray-900">
                PLAN DE<br />DÉVELOPPEMENT
              </div>
              <div className="font-serif italic text-[10px] text-gray-400 mb-3">2026 — 2030</div>
              <div className="h-px bg-gray-100 mb-2.5" />
              <div className="grid grid-cols-2 gap-1.5">
                {[['12M FCFA', 'Revenus'], ['+34%', 'Croissance']].map(([v, l]) => (
                  <div
                    key={l}
                    className="rounded p-2 text-center"
                    style={{ background: '#F5F7FA', borderTop: '2px solid #1B4FD8' }}
                  >
                    <div className="font-black text-[13px] text-gray-900">{v}</div>
                    <div className="text-[6px] uppercase tracking-widest text-gray-400 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Panel */}
          <div
            className="w-[130px] flex-shrink-0 border-l p-3 flex flex-col gap-2"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
          >
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>
              IA Rédaction
            </div>
            <div
              className="rounded-lg p-2.5 border"
              style={{ background: 'var(--accentS)', borderColor: 'var(--accentS2)' }}
            >
              <div
                className="h-1 rounded mb-1.5 opacity-60"
                style={{ background: 'var(--accent)' }}
              />
              <div className="h-0.5 rounded mb-1" style={{ background: 'var(--border)' }} />
              <div className="h-0.5 rounded w-3/4" style={{ background: 'var(--border)' }} />
            </div>
            <div className="h-6 rounded" style={{ background: 'var(--accent)', opacity: .9 }} />
          </div>
        </div>
      </div>
    </section>
  )
}
