'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowLeft, Share2, Clock } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function ViewPage() {
  const params = useParams()
  const docId = params.docId as string

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <FileText size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[520px] text-center">

          <div className="rounded-2xl border p-10"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--accentS)' }}>
              <Share2 size={28} color="var(--accent)" />
            </div>

            <div className="text-[22px] font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>
              Document Partagé
            </div>
            <p className="text-[14px] mb-8" style={{ color: 'var(--text3)' }}>
              Ce lien pointe vers le document <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>{docId}</span>.
              Les documents EETRA sont stockés localement chez leur créateur.
            </p>

            {/* Info box */}
            <div className="rounded-xl border p-5 text-left mb-8"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <Clock size={16} color="var(--text4)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div className="text-[13px] font-bold mb-1" style={{ color: 'var(--text)' }}>
                    Partage de documents
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text3)' }}>
                    Pour accéder au document complet, demandez à son créateur de vous envoyer
                    le fichier PDF exporté, ou de vous partager un accès à son espace EETRA.
                    La collaboration en temps réel sera disponible dans la prochaine version.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold border"
                style={{ borderColor: 'var(--border2)', color: 'var(--text2)', textDecoration: 'none' }}>
                <ArrowLeft size={13} />
                Accueil
              </Link>
              <Link href={`/verify/${docId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
                Vérifier l'authenticité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
