'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { FileText } from 'lucide-react'

export function Footer() {
  const router = useRouter()
  return (
    <>
      <section className="py-20 px-12 text-center border-t" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-[40px] font-black tracking-tight mb-3" style={{ color: 'var(--text)' }}>
          Prêt à créer vos premiers documents ?
        </h2>
        <p className="text-[15px] mb-8" style={{ color: 'var(--text3)' }}>
          Rejoignez plus de 500 entreprises qui font confiance à EETRA.
        </p>
        <Button variant="primary" size="lg" onClick={() => router.push('/login')}>
          Démarrer gratuitement →
        </Button>
      </section>

      <footer className="px-12 py-8 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <FileText size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text4)' }}>
            © 2026 EETRA · Politique de confidentialité · CGU
          </span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text4)' }}>v2.0.0</span>
        </div>
      </footer>
    </>
  )
}
