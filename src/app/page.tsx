'use client'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'
import { TEMPLATES } from '@/lib/templates'
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <main className="flex-1 flex flex-col items-center">
        <Hero />
        <section className="w-full border-t border-b py-12" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="max-w-[900px] mx-auto grid grid-cols-4 gap-0 text-center px-12">
            {[['8 000+','Documents créés'],['97%','Taux de satisfaction'],['5×','Plus rapide que Word'],['RGPD','Conforme & sécurisé']].map(([n,l],i) => (
              <div key={i} className="px-6" style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div className="text-[38px] font-black tracking-tight" style={{ color: 'var(--accent)' }}>{n}</div>
                <div className="text-[12px] font-500 mt-1" style={{ color: 'var(--text3)', fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </section>
        <Features />
        <section id="templates" className="w-full py-20 px-12 border-t" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="max-w-[1140px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>Smart Templates</div>
              <h2 className="text-[36px] font-black tracking-tight" style={{ color: 'var(--text)' }}>5 modèles prêts à l&apos;emploi</h2>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {TEMPLATES.map(t => (
                <div key={t.id} className="rounded-xl border p-5 cursor-default transition-all duration-150" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--accent)'; el.style.transform='translateY(-3px)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.transform='' }}>
                  <div className="text-[28px] mb-3">{t.icon}</div>
                  <div className="text-[13px] font-bold mb-2" style={{ color: 'var(--text)' }}>{t.name}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {t.tags.map(tag => <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>{tag}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Pricing /><FAQ /><Footer />
      </main>
    </div>
  )
}
