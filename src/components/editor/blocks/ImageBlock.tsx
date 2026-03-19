'use client'

import { useState, useRef, useCallback } from 'react'
import { Image, Upload, X, AlignLeft, AlignCenter, AlignRight, Maximize2 } from 'lucide-react'

interface ImageBlockProps {
  blockId: string
  initialSrc?: string
  initialCaption?: string
  initialAlign?: 'left' | 'center' | 'right'
  initialSize?: 'sm' | 'md' | 'lg' | 'full'
  onUpdate?: (data: { src: string; caption: string; align: string; size: string }) => void
}

export function ImageBlock({
  blockId,
  initialSrc = '',
  initialCaption = '',
  initialAlign = 'center',
  initialSize = 'lg',
  onUpdate,
}: ImageBlockProps) {
  const [src, setSrc] = useState(initialSrc)
  const [caption, setCaption] = useState(initialCaption)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialAlign)
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'full'>(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const SIZE_MAP = { sm: '40%', md: '60%', lg: '80%', full: '100%' }
  const ALIGN_MAP = { left: 'flex-start', center: 'center', right: 'flex-end' }

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const newSrc = e.target?.result as string
      setSrc(newSrc)
      onUpdate?.({ src: newSrc, caption, align, size })
    }
    reader.readAsDataURL(file)
  }, [caption, align, size, onUpdate])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleUrlPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')
    if (text.startsWith('http') && (text.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || text.includes('images'))) {
      setSrc(text)
      onUpdate?.({ src: text, caption, align, size })
    }
  }, [caption, align, size, onUpdate])

  if (!src) {
    return (
      <div
        className="relative rounded-xl border-2 border-dashed transition-all"
        style={{ borderColor: isDragging ? 'var(--accent)' : '#DDE1EA', background: isDragging ? 'rgba(27,79,216,.04)' : '#fafafa' }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(27,79,216,.08)' }}>
            <Image size={20} color="#1B4FD8" />
          </div>
          <div className="text-center">
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1B4FD8', marginBottom: 2 }}>Cliquez ou déposez une image</p>
            <p style={{ fontSize: 10, color: '#aaa' }}>PNG, JPG, SVG — max 5MB</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: '#1B4FD8', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
            >
              <Upload size={11} /> Importer
            </button>
          </div>
          <input
            placeholder="Ou collez une URL image..."
            onPaste={handleUrlPaste}
            onChange={e => {
              if (e.target.value.startsWith('http')) {
                setSrc(e.target.value)
                onUpdate?.({ src: e.target.value, caption, align, size })
              }
            }}
            style={{ fontSize: 11, padding: '6px 12px', border: '1px solid #e8e8e8', borderRadius: 8, outline: 'none', width: '60%', background: '#fff', color: '#555' }}
          />
        </div>
        <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Controls bar */}
      <div className="pdf-hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Align */}
        <div style={{ display: 'flex', gap: 2, background: '#f5f7fa', borderRadius: 8, padding: 2 }}>
          {[
            { id: 'left', icon: <AlignLeft size={11} /> },
            { id: 'center', icon: <AlignCenter size={11} /> },
            { id: 'right', icon: <AlignRight size={11} /> },
          ].map(a => (
            <button key={a.id} onClick={() => { setAlign(a.id as typeof align); onUpdate?.({ src, caption, align: a.id, size }) }}
              style={{ padding: '4px 6px', borderRadius: 6, border: 'none', cursor: 'pointer', background: align === a.id ? '#1B4FD8' : 'transparent', color: align === a.id ? '#fff' : '#888' }}>
              {a.icon}
            </button>
          ))}
        </div>

        {/* Size */}
        <div style={{ display: 'flex', gap: 2, background: '#f5f7fa', borderRadius: 8, padding: 2 }}>
          {(['sm', 'md', 'lg', 'full'] as const).map(s => (
            <button key={s} onClick={() => { setSize(s); onUpdate?.({ src, caption, align, size: s }) }}
              style={{ padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, background: size === s ? '#1B4FD8' : 'transparent', color: size === s ? '#fff' : '#888' }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Remove */}
        <button onClick={() => { setSrc(''); onUpdate?.({ src: '', caption, align, size }) }}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
          <X size={10} /> Supprimer
        </button>
      </div>

      {/* Image display */}
      <div style={{ display: 'flex', justifyContent: ALIGN_MAP[align] }}>
        <div style={{ width: SIZE_MAP[size], position: 'relative' }}>
          <img
            src={src}
            alt={caption || 'Image'}
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 6, border: '1px solid #f0f0f0' }}
            onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect fill="%23f0f0f0" width="100" height="60"/><text fill="%23aaa" x="50" y="35" text-anchor="middle" font-size="10">Image introuvable</text></svg>' }}
          />
          {caption && (
            <p style={{ fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>{caption}</p>
          )}
        </div>
      </div>

      {/* Caption input */}
      <input
        className="pdf-hidden"
        value={caption}
        onChange={e => { setCaption(e.target.value); onUpdate?.({ src, caption: e.target.value, align, size }) }}
        placeholder="Légende de l'image (optionnel)..."
        style={{ fontSize: 11, padding: '6px 10px', border: '1px solid #e8e8e8', borderRadius: 8, outline: 'none', background: '#fafafa', color: '#555' }}
      />
    </div>
  )
}
