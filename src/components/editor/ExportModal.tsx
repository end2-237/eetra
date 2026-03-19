'use client'

import { useState, useRef } from 'react'
import { X, Download, FileText, Check, Loader, AlertCircle } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePlan } from '@/contexts/PlanContext'
import { Button } from '@/components/ui/Button'
import { generateId } from '@/lib/utils'

interface Props {
  onClose: () => void
}

type ExportStep = 'options' | 'loading' | 'done' | 'error'

export function ExportModal({ onClose }: Props) {
  const { title, subtitle, pages, docId, markSaved, docStyle, confidentiality } = useDocument()
  const { profile } = useProfile()
  const { addEntry } = useHistory()
  const { addNotification } = useNotifications()
  const { plan, planId } = usePlan()

  const [step, setStep] = useState<ExportStep>('options')
  const [includeWatermark, setIncludeWatermark] = useState(planId === 'starter')
  const [quality, setQuality] = useState<'standard' | 'high'>('high')
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)

  const pageCount = pages.length + 1 // +1 for cover
  const blockCount = pages.reduce((acc, p) => acc + p.blocks.length, 0)

  const handleExport = async () => {
    setStep('loading')
    setProgress(0)

    try {
      // Simulate progress
      const tick = setInterval(() => setProgress(p => Math.min(p + 12, 90)), 200)

      // Dynamic import of html2pdf or jsPDF
      const { default: html2pdf } = await import('html2pdf.js').catch(() => ({ default: null }))

      clearInterval(tick)
      setProgress(95)

      const docName = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `${docName}_${new Date().toISOString().slice(0, 10)}.pdf`

      if (html2pdf) {
        // Get the document pages container
        const element = document.getElementById('eetra-doc-export-root') || document.body

        await html2pdf()
          .set({
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: quality === 'high' ? 0.98 : 0.85 },
            html2canvas: { scale: quality === 'high' ? 2 : 1.5, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css'] },
          })
          .from(element)
          .save()
      } else {
        // Fallback: print dialog
        window.print()
      }

      setProgress(100)

      // Record in history
      addEntry({
        id: generateId(),
        docId,
        title: title || 'Sans titre',
        entityName: profile.name || '',
        type: 'pdf',
        pageCount,
        blockCount,
        signature: `SIG-${generateId().toUpperCase()}`,
        qrData: `https://eetra.app/verify/${docId}`,
      })

      // Notification
      addNotification({
        type: 'export',
        title: 'Export réussi',
        message: `"${title || 'Document'}" — ${pageCount} page${pageCount > 1 ? 's' : ''} exporté${pageCount > 1 ? 'es' : 'e'} en PDF.`,
      })

      markSaved()
      setStep('done')

    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de l\'export. Veuillez réessayer.')
      setStep('error')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 460,
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,.25)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={15} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Exporter en PDF</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>
                {pageCount} page{pageCount > 1 ? 's' : ''} · {blockCount} blocs
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
            <X size={13} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* OPTIONS */}
          {step === 'options' && (
            <>
              {/* Doc summary */}
              <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={16} color="var(--accent)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title || 'Document sans titre'}</div>
                    {subtitle && <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>{subtitle}</div>}
                  </div>
                </div>
              </div>

              {/* Quality */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>
                  Qualité d'export
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'standard', label: 'Standard', desc: 'Fichier léger (~1–2 MB)', badge: null },
                    { id: 'high', label: 'Haute Qualité', desc: 'Impression optimale', badge: 'Recommandé' },
                  ].map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => setQuality(opt.id as typeof quality)}
                      style={{
                        padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${quality === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                        background: quality === opt.id ? 'var(--accentS)' : 'var(--bg2)',
                        transition: 'all .12s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${quality === opt.id ? 'var(--accent)' : 'var(--border2)'}`, background: quality === opt.id ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }}>
                          {quality === opt.id && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{opt.label}</span>
                        {opt.badge && (
                          <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 20, background: 'var(--accent)', color: '#fff' }}>{opt.badge}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text4)', paddingLeft: 20 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watermark */}
              <div style={{ marginBottom: 20 }}>
                <div
                  onClick={() => {
                    if (planId === 'starter') return
                    setIncludeWatermark(!includeWatermark)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    cursor: planId === 'starter' ? 'not-allowed' : 'pointer',
                    opacity: planId === 'starter' ? .7 : 1,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                      Filigrane EETRA
                      {planId === 'starter' && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: 'rgba(107,114,128,.15)', color: '#6B7280' }}>Plan Pro requis</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>Afficher "Généré par EETRA" dans le document</div>
                  </div>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    border: `2px solid ${includeWatermark ? 'var(--accent)' : 'var(--border2)'}`,
                    background: includeWatermark ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .12s', flexShrink: 0,
                  }}>
                    {includeWatermark && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              </div>

              <Button variant="primary" fullWidth size="lg" onClick={handleExport}>
                <Download size={14} /> Générer le PDF
              </Button>
            </>
          )}

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--accentS)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite', margin: '0 auto 20px' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Génération en cours…</div>
              <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 20 }}>Veuillez patienter</div>
              <div style={{ height: 6, borderRadius: 10, background: 'var(--bg3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 10, background: 'var(--accent)', width: `${progress}%`, transition: 'width .3s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 6 }}>{progress}%</div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(5,150,105,.1)', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={24} color="#059669" strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Export réussi !</div>
              <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 24 }}>
                Votre document a été téléchargé et enregistré dans l'historique.
              </div>
              <Button variant="ghost" fullWidth onClick={onClose}>Fermer</Button>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(220,38,38,.08)', border: '2px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={24} color="#DC2626" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Erreur d'export</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 20 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" fullWidth onClick={onClose}>Annuler</Button>
                <Button variant="primary" fullWidth onClick={() => setStep('options')}>Réessayer</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}