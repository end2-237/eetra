'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Camera, Upload, Check, RefreshCw } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/Loading'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'

/**
 * TemplateCoverModal
 *
 * Allows the user to set a real preview image for a template.
 * Two modes:
 * 1. Capture: renders the CoverPage component in a hidden off-screen div,
 *    then takes a screenshot via html2canvas → PNG data URL.
 * 2. Upload: user picks a PNG/JPG file from disk.
 */

const PAGE_W = 794
const PAGE_H = 1123

interface Props {
  templateId: string
  templateName: string
  coverStyle: CoverStyle
  currentPreviewUrl?: string | null
  onSave: (templateId: string, imageDataUrl: string) => Promise<void>
  onClose: () => void
  /** The rendered CoverPage component at 1× zoom — passed in by parent */
  CoverPageElement: React.ReactNode
}

type Mode = 'choose' | 'capturing' | 'captured' | 'upload' | 'error'

export function TemplateCoverModal({
  templateId,
  templateName,
  coverStyle,
  currentPreviewUrl,
  onSave,
  onClose,
  CoverPageElement,
}: Props) {
  const [mode, setMode] = useState<Mode>('choose')
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPreviewUrl ?? null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const captureNow = useCallback(async () => {
    setMode('capturing')
    setError('')
    try {
      const html2canvas = (await import('html2canvas')).default
      const el = captureRef.current
      if (!el) throw new Error('Element introuvable')

      // Give a tick for the DOM to paint
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise(r => setTimeout(r, 200))

      const canvas = await html2canvas(el, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: PAGE_W,
        height: PAGE_H,
        windowWidth: PAGE_W,
        windowHeight: PAGE_H,
        logging: false,
      })

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      setPreviewUrl(dataUrl)
      setMode('captured')
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la capture')
      setMode('error')
    }
  }, [])

  // Auto-capture on mount
  useEffect(() => {
    captureNow()
  }, [captureNow])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image doit être inférieure à 5 MB')
      setMode('error')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      setPreviewUrl(ev.target?.result as string)
      setMode('captured')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!previewUrl) return
    setSaving(true)
    try {
      await onSave(templateId, previewUrl)
      onClose()
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Modal overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9600,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, width: '100%', maxWidth: 540,
          boxShadow: '0 24px 60px rgba(0,0,0,.22)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Aperçu du template</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 2 }}>{templateName}</div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', display: 'flex', gap: 18 }}>

            {/* Left — preview panel */}
            <div style={{ width: 160, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>Aperçu</div>
              <div style={{
                width: 160, aspectRatio: '.707',
                border: '1px solid var(--border)', borderRadius: 8,
                background: '#fff', overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {mode === 'capturing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <LoadingSpinner size={20} className="text-[var(--accent)]" />
                    <span style={{ fontSize: 10, color: 'var(--text4)' }}>Capture…</span>
                  </div>
                )}
                {(mode === 'captured' || mode === 'error') && previewUrl && (
                  <img src={previewUrl} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
                {mode === 'choose' && currentPreviewUrl && (
                  <img src={currentPreviewUrl} alt="Aperçu actuel" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
                {mode === 'choose' && !currentPreviewUrl && (
                  <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text4)', padding: 8 }}>Aucun aperçu</div>
                )}
                {mode === 'captured' && (
                  <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>

            {/* Right — options */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 2 }}>Options</div>

              {/* Option 1 — Recapture */}
              <button
                onClick={captureNow}
                disabled={mode === 'capturing'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  borderRadius: 10, border: `1.5px solid ${mode === 'captured' ? 'var(--accent)' : 'var(--border)'}`,
                  background: mode === 'captured' ? 'var(--accentS)' : 'var(--bg2)',
                  cursor: mode === 'capturing' ? 'wait' : 'pointer', textAlign: 'left',
                  width: '100%', transition: 'all .12s',
                  opacity: mode === 'capturing' ? .6 : 1,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {mode === 'capturing' ? <LoadingSpinner size={13} className="text-white" /> : <Camera size={14} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                    {mode === 'capturing' ? 'Capture en cours…' : 'Capturer la cover actuelle'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>
                    Image réelle générée via html2canvas
                  </div>
                </div>
                {mode === 'capturing' && <RefreshCw size={12} color="var(--accent)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </button>

              {/* Option 2 — Upload */}
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  borderRadius: 10, border: '1.5px solid var(--border)',
                  background: 'var(--bg2)', cursor: 'pointer', textAlign: 'left',
                  width: '100%', transition: 'all .12s',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                  <Upload size={14} color="var(--text3)" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Importer une image</div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>PNG ou JPG — max 5 MB</div>
                </div>
              </button>

              {/* Error */}
              {mode === 'error' && error && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.2)', fontSize: 11, color: '#DC2626' }}>
                  {error}
                </div>
              )}

              {/* Info */}
              <div style={{ marginTop: 'auto', padding: '8px 10px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text4)', lineHeight: 1.5 }}>
                La capture utilise le même moteur que l'export PDF — le rendu est fidèle à votre document réel.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!previewUrl || saving || mode === 'capturing'}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: previewUrl && mode !== 'capturing' ? 'var(--accent)' : 'var(--bg3)',
                color: previewUrl && mode !== 'capturing' ? '#fff' : 'var(--text4)',
                cursor: previewUrl && mode !== 'capturing' ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                opacity: saving ? .6 : 1,
              }}
            >
              {saving ? <LoadingSpinner size={12} className="text-current" /> : <Check size={12} />}
              {saving ? 'Sauvegarde…' : 'Enregistrer cet aperçu'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden off-screen capture zone — full A4 at 1× */}
      <div
        style={{
          position: 'fixed', top: -9999, left: -9999,
          width: PAGE_W, height: PAGE_H, overflow: 'hidden',
          pointerEvents: 'none', zIndex: -1,
        }}
        aria-hidden="true"
      >
        <div ref={captureRef} style={{ width: PAGE_W, height: PAGE_H }}>
          {CoverPageElement}
        </div>
      </div>

      {/* File input */}
      <input type="file" ref={fileRef} accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFileUpload} />
    </>
  )
}