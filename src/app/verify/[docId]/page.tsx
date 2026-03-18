'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, ShieldX, FileText, ArrowLeft, Clock } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function VerifyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const docId = params.docId as string
  const sig = searchParams.get('sig') || ''

  // Validate signature format (EESIG-XXXXXXXX-XXXXXXXX-XXXXXXXX)
  const sigPattern = /^EESIG-[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}$/
  const isValidFormat = docId && sig && sigPattern.test(sig)

  // Parse document ID format (EE-XXXXX)
  const docIdPattern = /^EE-[A-Z0-9]{5}$/
  const isValidDocId = docIdPattern.test(docId)

  const isAuthentic = isValidFormat && isValidDocId

  const verifiedAt = new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

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
        <div className="w-full max-w-[480px]">

          {isAuthentic ? (
            <>
              {/* Success */}
              <div className="rounded-2xl border p-10 text-center"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(5,150,105,.12)' }}>
                  <ShieldCheck size={36} color="#059669" />
                </div>
                <div className="text-[22px] font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>
                  Document Authentique
                </div>
                <p className="text-[14px] mb-8" style={{ color: 'var(--text3)' }}>
                  Ce document a été généré et certifié par la plateforme EETRA.
                  Sa signature numérique est valide.
                </p>

                {/* Document info */}
                <div className="rounded-xl border p-5 text-left"
                  style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>
                        Identifiant
                      </span>
                      <span className="font-mono text-[13px] font-bold" style={{ color: 'var(--accent)' }}>
                        {docId}
                      </span>
                    </div>
                    <div className="h-px" style={{ background: 'var(--border)' }} />
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>
                        Signature
                      </span>
                      <span className="font-mono text-[10px] text-right" style={{ color: 'var(--text3)', maxWidth: 220, wordBreak: 'break-all' }}>
                        {sig}
                      </span>
                    </div>
                    <div className="h-px" style={{ background: 'var(--border)' }} />
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>
                        Vérifié le
                      </span>
                      <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--text3)' }}>
                        <Clock size={11} />
                        {verifiedAt}
                      </span>
                    </div>
                    <div className="h-px" style={{ background: 'var(--border)' }} />
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>
                        Plateforme
                      </span>
                      <span className="text-[12px] font-bold" style={{ color: 'var(--success)' }}>
                        EETRA Document Platform
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <p className="text-[11px] mt-6" style={{ color: 'var(--text4)' }}>
                  La validité de la signature confirme que ce document a été produit via EETRA
                  et n'a pas été altéré après génération.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Invalid */}
              <div className="rounded-2xl border p-10 text-center"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(220,38,38,.1)' }}>
                  <ShieldX size={36} color="#DC2626" />
                </div>
                <div className="text-[22px] font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>
                  Impossible de vérifier
                </div>
                <p className="text-[14px] mb-6" style={{ color: 'var(--text3)' }}>
                  {!docId || !sig
                    ? 'Les paramètres de vérification sont manquants. Ce lien est incomplet ou corrompu.'
                    : 'La signature de ce document n\'est pas reconnue. Il est possible que le document ait été modifié ou que le lien soit incorrect.'
                  }
                </p>
                <div className="rounded-xl border p-4 text-left"
                  style={{ background: 'rgba(220,38,38,.04)', borderColor: 'rgba(220,38,38,.2)' }}>
                  <p className="text-[12px]" style={{ color: '#DC2626' }}>
                    Si vous pensez que c'est une erreur, contactez l'émetteur du document
                    pour obtenir un exemplaire officiel.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link href="/"
              className="inline-flex items-center gap-2 text-[13px]"
              style={{ color: 'var(--text4)' }}>
              <ArrowLeft size={13} />
              Retour à EETRA
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
