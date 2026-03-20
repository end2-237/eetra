'use client'

import { useState } from 'react'
import { X, Download, FileText, Check, AlertCircle } from 'lucide-react'
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
  const { title, subtitle, pages, docId, markSaved } = useDocument()
  const { profile } = useProfile()
  const { addEntry } = useHistory()
  const { addNotification } = useNotifications()
  const { planId } = usePlan()

  const [step, setStep] = useState<ExportStep>('options')
  const [includeWatermark, setIncludeWatermark] = useState(planId === 'starter')
  const [quality, setQuality] = useState<'standard' | 'high'>('high')
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)

  const pageCount = pages.length + 1
  const blockCount = pages.reduce((acc, p) => acc + p.blocks.length, 0)

  const handleExport = async () => {
    setStep('loading')
    setProgress(10)

    let captureWrapper: HTMLDivElement | null = null

    try {
      const html2pdf = (await import('html2pdf.js')).default
      setProgress(20)

      // ── Build off-screen capture wrapper ──────────────────────────────────
      // IMPORTANT: use position:absolute + left:-9999px (NOT position:fixed)
      // Fixed elements are composited with the rest of the page by html2canvas,
      // causing the modal backdrop to occlude the content → white PDF.
      // Absolute + off-screen keeps the element in the document flow but
      // invisible, so html2canvas captures only the wrapper's own content.
      captureWrapper = document.createElement('div')
      captureWrapper.id = 'eetra-pdf-capture'
      Object.assign(captureWrapper.style, {
        position: 'absolute',
        left: '-9999px',
        top: '0',
        width: '794px',
        background: '#ffffff',
        zIndex: '-1',
        pointerEvents: 'none',
      })

      // ── Clone cover page ──────────────────────────────────────────────────
      const coverOuter = document.getElementById('eetra-page-cover')
      const coverInner = coverOuter?.firstElementChild as HTMLElement | null
      if (coverInner) {
        const pageWrap = document.createElement('div')
        // Exact A4 pixel dimensions — no min-height, no overflow
        Object.assign(pageWrap.style, {
          width: '794px',
          height: '1123px',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          breakAfter: 'page',
        })
        pageWrap.className = 'eetra-pdf-page'

        const clone = coverInner.cloneNode(true) as HTMLElement
        // Strip any zoom transform from the viewer
        clone.style.transform = 'none'
        clone.style.transformOrigin = 'top left'
        clone.style.width = '794px'
        clone.style.height = '1123px'
        clone.style.position = 'absolute'
        clone.style.top = '0'
        clone.style.left = '0'

        pageWrap.appendChild(clone)
        captureWrapper.appendChild(pageWrap)
      }

      // ── Clone content pages ───────────────────────────────────────────────
      pages.forEach((_, idx) => {
        const pageOuter = document.getElementById(`eetra-page-${idx}`)
        const pageInner = pageOuter?.firstElementChild as HTMLElement | null
        if (pageInner) {
          const pageWrap = document.createElement('div')
          Object.assign(pageWrap.style, {
            width: '794px',
            height: '1123px',
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            pageBreakAfter: 'always',
            breakAfter: 'page',
          })
          pageWrap.className = 'eetra-pdf-page'

          const clone = pageInner.cloneNode(true) as HTMLElement
          clone.style.transform = 'none'
          clone.style.transformOrigin = 'top left'
          clone.style.width = '794px'
          clone.style.position = 'absolute'
          clone.style.top = '0'
          clone.style.left = '0'

          pageWrap.appendChild(clone)
          captureWrapper.appendChild(pageWrap)
        }
      })

      // ── Inject into DOM & apply pdf-exporting class ───────────────────────
      document.body.appendChild(captureWrapper)
      document.body.classList.add('pdf-exporting')
      setProgress(35)

      // Wait for browser to render the cloned DOM (fonts, images, CSS vars)
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise(r => setTimeout(r, 600))
      setProgress(55)

      // ── Wait for all images inside the capture wrapper to load ────────────
      const images = Array.from(captureWrapper.querySelectorAll('img'))
      await Promise.allSettled(
        images.map(img =>
          img.complete
            ? Promise.resolve()
            : new Promise(res => {
                img.onload = res
                img.onerror = res
                // Safety timeout
                setTimeout(res, 3000)
              })
        )
      )
      setProgress(65)

      const docName = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `EETRA_${docName}_${new Date().toISOString().slice(0, 10)}.pdf`
      const scale = quality === 'high' ? 2 : 1.5

      // ── html2pdf capture ─────────────────────────────────────────────────
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: quality === 'high' ? 0.98 : 0.85 },
          html2canvas: {
            scale,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            // Do NOT set windowWidth — it triggers CSS breakpoints that can
            // hide content. Do NOT set scrollX/scrollY for absolute elements.
          },
          jsPDF: {
            unit: 'px',
            format: [794, 1123],
            orientation: 'portrait',
            compress: true,
          },
          pagebreak: {
            mode: ['css'],
            before: '.eetra-pdf-page',
          },
        })
        .from(captureWrapper)
        .save()

      setProgress(95)

      // ── Cleanup ───────────────────────────────────────────────────────────
      document.body.removeChild(captureWrapper)
      captureWrapper = null
      document.body.classList.remove('pdf-exporting')
      setProgress(100)

      // Log to history
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

      addNotification({
        type: 'export',
        title: 'PDF téléchargé',
        message: `"${title || 'Document'}" — ${pageCount} page${pageCount > 1 ? 's' : ''} générée${pageCount > 1 ? 's' : ''}.`,
      })

      markSaved()
      setStep('done')

    } catch (err: any) {
      // Cleanup on error
      document.body.classList.remove('pdf-exporting')
      if (captureWrapper?.parentNode) {
        document.body.removeChild(captureWrapper)
      }
      // Fallback cleanup in case ref was lost
      const orphan = document.getElementById('eetra-pdf-capture')
      if (orphan) document.body.removeChild(orphan)

      setErrorMsg(err?.message || 'Erreur lors de la génération. Réessayez.')
      setStep('error')
    }
  }

  return (
    <div
      style={{
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
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--accentS)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Download size={15} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Exporter en PDF</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>
                {pageCount} page{pageCount > 1 ? 's' : ''} · {blockCount} bloc{blockCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: '1px solid var(--border)', background: 'var(--bg2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text4)',
            }}
          >
            <X size={13} />
          </button>
        </div>

        <div style={{ padding: 24 }}>

          {/* ── OPTIONS ── */}
          {step === 'options' && (
            <>
              {/* Document summary */}
              <div style={{
                padding: '14px 16px', borderRadius: 12,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={16} color="var(--accent)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                      {title || 'Document sans titre'}
                    </div>
                    {subtitle && (
                      <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>{subtitle}</div>
                    )}
                    <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2 }}>
                      {pageCount} page{pageCount > 1 ? 's' : ''} au total (couverture incluse)
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality selector */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '.15em',
                  textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10,
                }}>
                  Qualité d'export
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'standard', label: 'Standard', desc: 'Fichier léger (~1–2 MB)', badge: null },
                    { id: 'high', label: 'Haute Qualité', desc: 'Impression optimale (~4–6 MB)', badge: 'Recommandé' },
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
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%',
                          border: `2px solid ${quality === opt.id ? 'var(--accent)' : 'var(--border2)'}`,
                          background: quality === opt.id ? 'var(--accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .12s',
                        }}>
                          {quality === opt.id && (
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                          )}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{opt.label}</span>
                        {opt.badge && (
                          <span style={{
                            fontSize: 8, fontWeight: 800, padding: '1px 5px',
                            borderRadius: 20, background: 'var(--accent)', color: '#fff',
                          }}>
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text4)', paddingLeft: 20 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watermark toggle */}
              <div style={{ marginBottom: 20 }}>
                <div
                  onClick={() => { if (planId !== 'starter') setIncludeWatermark(!includeWatermark) }}
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
                      {planId === 'starter' && (
                        <span style={{
                          marginLeft: 6, fontSize: 9, fontWeight: 700,
                          padding: '1px 6px', borderRadius: 20,
                          background: 'rgba(107,114,128,.15)', color: '#6B7280',
                        }}>
                          Plan Pro requis
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>
                      Afficher "Généré par EETRA" dans le document
                    </div>
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
                <Download size={14} /> Télécharger le PDF
              </Button>
            </>
          )}

          {/* ── LOADING ── */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid var(--accentS)', borderTopColor: 'var(--accent)',
                animation: 'spin .8s linear infinite', margin: '0 auto 20px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Génération du PDF…
              </div>
              <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 20 }}>
                {progress < 40 ? 'Rendu des pages…' : progress < 70 ? 'Chargement images…' : progress < 90 ? 'Conversion en PDF…' : 'Finalisation…'}
              </div>
              <div style={{ height: 6, borderRadius: 10, background: 'var(--bg3)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 10, background: 'var(--accent)',
                  width: `${progress}%`, transition: 'width .4s ease',
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 6 }}>{progress}%</div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(5,150,105,.1)', border: '2px solid #059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Check size={24} color="#059669" strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                PDF téléchargé !
              </div>
              <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 24 }}>
                Le fichier a été enregistré dans vos téléchargements
                et ajouté à l'historique.
              </div>
              <Button variant="ghost" fullWidth onClick={onClose}>Fermer</Button>
            </div>
          )}

          {/* ── ERROR ── */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(220,38,38,.08)', border: '2px solid #DC2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <AlertCircle size={24} color="#DC2626" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                Erreur d'export
              </div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 20 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" fullWidth onClick={onClose}>Annuler</Button>
                <Button variant="primary" fullWidth onClick={() => { setStep('options'); setProgress(0) }}>
                  Réessayer
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
