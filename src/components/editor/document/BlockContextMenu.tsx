'use client'

import { useEffect, useRef } from 'react'
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Trash2, ArrowUp, ArrowDown,
} from 'lucide-react'

const FONT_OPTIONS = [
  { value: 'Times New Roman',     label: 'Times' },
  { value: 'Bricolage Grotesque', label: 'Bricolage' },
  { value: 'DM Sans',             label: 'DM Sans' },
  { value: 'Playfair Display',    label: 'Playfair' },
  { value: 'Lora',                label: 'Lora' },
  { value: 'Syne',                label: 'Syne' },
  { value: 'DM Mono',             label: 'Mono' },
  { value: 'Georgia',             label: 'Georgia' },
  { value: 'Arial',               label: 'Arial' },
]

const FONT_SIZES = [9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48]

const QUICK_COLORS = [
  { v: '#0A0F1E', l: 'Noir profond' },
  { v: '#444444', l: 'Gris foncé' },
  { v: '#1B4FD8', l: 'Bleu' },
  { v: '#059669', l: 'Vert' },
  { v: '#DC2626', l: 'Rouge' },
  { v: '#D97706', l: 'Orange' },
  { v: '#7C3AED', l: 'Violet' },
  { v: '#0E7490', l: 'Cyan' },
  { v: '#EC4899', l: 'Rose' },
  { v: '#6B7280', l: 'Gris' },
]

const TEXT_BLOCKS = ['text', 'h1', 'h2', 'h3', 'h4', 'section', 'quote', 'clause', 'bullet-list', 'numbered-list', 'checklist', 'kpi']

interface Props {
  x: number
  y: number
  blockId: string
  blockType: string
  currentStyles?: {
    align?: string
    color?: string
    fontFamily?: string
    fontSize?: number
    textStyles?: { bold?: boolean; italic?: boolean; underline?: boolean }
  }
  accentColor: string
  canMoveUp: boolean
  canMoveDown: boolean
  onAlign: (align: 'left' | 'center' | 'right' | 'justify') => void
  onTextStyle: (key: 'bold' | 'italic' | 'underline', val: boolean) => void
  onColor: (color: string) => void
  onFontFamily: (font: string) => void
  onFontSize: (size: number) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onClose: () => void
}

export function BlockContextMenu({
  x, y, blockId, blockType, currentStyles, accentColor,
  canMoveUp, canMoveDown,
  onAlign, onTextStyle, onColor, onFontFamily, onFontSize,
  onMoveUp, onMoveDown, onRemove, onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isText = TEXT_BLOCKS.includes(blockType)
  const align = currentStyles?.align || 'justify'
  const ts = currentStyles?.textStyles || {}

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // ── Positionnement PRÈS du clic ────────────────────────────────────────────
  // On laisse du CSS faire le travail de clamp pour rester dans la fenêtre.
  // On place le coin supérieur-gauche au point de clic, puis on ajuste si
  // le menu dépasse à droite ou en bas.
  const OFFSET_X = 6   // px de décalage horizontal depuis le curseur
  const OFFSET_Y = 4   // px de décalage vertical depuis le curseur
  const menuW = 228
  const menuH = isText ? 440 : 170

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  // Place near the click, clamp inside viewport with small margin
  const MARGIN = 6
  const finalX = Math.min(Math.max(x + OFFSET_X, MARGIN), vw - menuW - MARGIN)
  const finalY = Math.min(Math.max(y + OFFSET_Y, MARGIN), vh - menuH - MARGIN)

  const row: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
    color: 'var(--text2)', background: 'transparent', border: 'none',
    width: '100%', textAlign: 'left',
  }

  const sectionLabel = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.12em',
    textTransform: 'uppercase' as const, color: 'var(--text4)', marginBottom: 6,
  }

  return (
    <div
      ref={ref}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'fixed',
        left: finalX,
        top: finalY,
        width: menuW,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.1)',
        zIndex: 99999,
        overflow: 'hidden',
        userSelect: 'none',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      {/* ── TEXT FORMATTING ── */}
      {isText && (
        <>
          {/* Alignment */}
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={sectionLabel}>Alignement</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {(
                [
                  { v: 'left', Icon: AlignLeft, label: 'Gauche' },
                  { v: 'center', Icon: AlignCenter, label: 'Centré' },
                  { v: 'right', Icon: AlignRight, label: 'Droite' },
                  { v: 'justify', Icon: AlignJustify, label: 'Justifié' },
                ] as const
              ).map(({ v, Icon, label }) => {
                const active = align === v
                return (
                  <button
                    key={v} title={label}
                    onClick={() => { onAlign(v); onClose() }}
                    style={{
                      flex: 1, height: 30, borderRadius: 7,
                      border: `1.5px solid ${active ? accentColor : 'var(--border)'}`,
                      background: active ? `${accentColor}18` : 'var(--bg2)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: active ? accentColor : 'var(--text3)',
                    }}
                  >
                    <Icon size={13} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Style: Bold / Italic / Underline */}
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={sectionLabel}>Style de texte</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {(
                [
                  { k: 'bold',      Icon: Bold,      label: 'Gras' },
                  { k: 'italic',    Icon: Italic,    label: 'Italique' },
                  { k: 'underline', Icon: Underline, label: 'Souligné' },
                ] as const
              ).map(({ k, Icon, label }) => {
                const active = !!ts[k]
                return (
                  <button key={k} title={label}
                    onClick={() => { onTextStyle(k, !active); onClose() }}
                    style={{
                      flex: 1, height: 30, borderRadius: 7,
                      border: `1.5px solid ${active ? accentColor : 'var(--border)'}`,
                      background: active ? `${accentColor}18` : 'var(--bg2)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: active ? accentColor : 'var(--text3)',
                    }}
                  >
                    <Icon size={13} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Font family */}
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={sectionLabel}>Police de caractères</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
              {FONT_OPTIONS.map(({ value, label }) => {
                const isActive = currentStyles?.fontFamily === value
                return (
                  <button key={value} title={value}
                    onClick={() => { onFontFamily(value); onClose() }}
                    style={{
                      padding: '5px 3px', borderRadius: 6,
                      border: `1.5px solid ${isActive ? accentColor : 'var(--border)'}`,
                      background: isActive ? `${accentColor}18` : 'var(--bg2)',
                      cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    <span style={{ fontFamily: value, fontSize: 14, display: 'block', color: 'var(--text)', lineHeight: 1.1 }}>Aa</span>
                    <span style={{
                      fontSize: 7, fontWeight: 700, display: 'block', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: isActive ? accentColor : 'var(--text4)',
                    }}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Font size */}
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={sectionLabel}>Taille (px)</div>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {FONT_SIZES.map(size => {
                const isActive = currentStyles?.fontSize === size
                return (
                  <button key={size}
                    onClick={() => { onFontSize(size); onClose() }}
                    style={{
                      padding: '3px 6px', borderRadius: 5,
                      border: `1.5px solid ${isActive ? accentColor : 'var(--border)'}`,
                      background: isActive ? `${accentColor}18` : 'transparent',
                      cursor: 'pointer', fontSize: 10, fontWeight: 700,
                      color: isActive ? accentColor : 'var(--text4)',
                    }}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color */}
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={sectionLabel}>Couleur du texte</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {QUICK_COLORS.map(({ v, l }) => (
                <button key={v} title={l}
                  onClick={() => { onColor(v); onClose() }}
                  style={{
                    width: 22, height: 22, borderRadius: 5, background: v, cursor: 'pointer',
                    border: `2.5px solid ${currentStyles?.color === v ? 'var(--text)' : 'rgba(0,0,0,.08)'}`,
                    padding: 0, flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Non-text blocks: color accent */}
      {!isText && (
        <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--border)' }}>
          <div style={sectionLabel}>Couleur accent</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {QUICK_COLORS.map(({ v, l }) => (
              <button key={v} title={l}
                onClick={() => { onColor(v); onClose() }}
                style={{
                  width: 22, height: 22, borderRadius: 5, background: v, cursor: 'pointer',
                  border: `2.5px solid ${currentStyles?.color === v ? 'var(--text)' : 'rgba(0,0,0,.08)'}`,
                  padding: 0, flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Move */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex' }}>
        <button
          disabled={!canMoveUp}
          onClick={() => { onMoveUp(); onClose() }}
          style={{
            ...row, flex: 1, justifyContent: 'center', gap: 4, padding: '7px',
            opacity: canMoveUp ? 1 : 0.3, cursor: canMoveUp ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (canMoveUp) (e.currentTarget as HTMLElement).style.background = 'var(--bg2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <ArrowUp size={13} /> Monter
        </button>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <button
          disabled={!canMoveDown}
          onClick={() => { onMoveDown(); onClose() }}
          style={{
            ...row, flex: 1, justifyContent: 'center', gap: 4, padding: '7px',
            opacity: canMoveDown ? 1 : 0.3, cursor: canMoveDown ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (canMoveDown) (e.currentTarget as HTMLElement).style.background = 'var(--bg2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          Descendre <ArrowDown size={13} />
        </button>
      </div>

      {/* Delete */}
      <button
        onClick={() => { onRemove(); onClose() }}
        style={{ ...row, color: '#DC2626', padding: '8px 12px', gap: 8 }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <Trash2 size={13} /> Supprimer le bloc
      </button>
    </div>
  )
}