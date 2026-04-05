'use client'

import { useEffect, useRef } from 'react'
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Trash2, ArrowUp, ArrowDown,
} from 'lucide-react'

interface Props {
  x: number
  y: number
  blockId: string
  blockType: string
  currentStyles?: {
    align?: string
    color?: string
    textStyles?: { bold?: boolean; italic?: boolean; underline?: boolean }
  }
  accentColor: string
  canMoveUp: boolean
  canMoveDown: boolean
  onAlign: (align: 'left' | 'center' | 'right' | 'justify') => void
  onTextStyle: (key: 'bold' | 'italic' | 'underline', val: boolean) => void
  onColor: (color: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onClose: () => void
}

const QUICK_COLORS = [
  { v: '#111111', l: 'Noir' },
  { v: '#1B4FD8', l: 'Bleu' },
  { v: '#059669', l: 'Vert' },
  { v: '#DC2626', l: 'Rouge' },
  { v: '#D97706', l: 'Orange' },
  { v: '#7C3AED', l: 'Violet' },
  { v: '#6B7280', l: 'Gris' },
]

const TEXT_BLOCKS = ['text', 'h1', 'h2', 'h3', 'h4', 'section', 'quote', 'clause']

export function BlockContextMenu({
  x, y, blockId, blockType, currentStyles, accentColor,
  canMoveUp, canMoveDown,
  onAlign, onTextStyle, onColor, onMoveUp, onMoveDown, onRemove, onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isText = TEXT_BLOCKS.includes(blockType)
  const align = currentStyles?.align || 'left'
  const ts = currentStyles?.textStyles || {}

  // Close on outside click or Escape
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

  // Keep within viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const menuW = 210
  const menuH = isText ? 260 : 130
  const adjX = Math.min(x, vw - menuW - 8)
  const adjY = Math.min(y, vh - menuH - 8)

  const row: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
    color: 'var(--text2)', background: 'transparent', border: 'none',
    width: '100%', textAlign: 'left',
  }

  return (
    <div
      ref={ref}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'fixed',
        left: adjX,
        top: adjY,
        width: menuW,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.1)',
        zIndex: 99999,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── TEXT FORMATTING ── */}
      {isText && (
        <>
          {/* Alignment row */}
          <div style={{ padding: '8px 10px 4px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
              Alignement
            </div>
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
                    key={v}
                    title={label}
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

          {/* Style row: Bold / Italic / Underline */}
          <div style={{ padding: '8px 10px 4px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
              Style de texte
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {(
                [
                  { k: 'bold',      label: 'G',  Icon: Bold,      extraStyle: { fontWeight: 800 } },
                  { k: 'italic',    label: 'I',  Icon: Italic,    extraStyle: { fontStyle: 'italic' } },
                  { k: 'underline', label: 'S',  Icon: Underline, extraStyle: { textDecoration: 'underline' } },
                ] as const
              ).map(({ k, label, Icon, extraStyle }) => {
                const active = !!ts[k]
                return (
                  <button
                    key={k}
                    title={k}
                    onClick={() => { onTextStyle(k, !active); onClose() }}
                    style={{
                      flex: 1, height: 30, borderRadius: 7,
                      border: `1.5px solid ${active ? accentColor : 'var(--border)'}`,
                      background: active ? `${accentColor}18` : 'var(--bg2)',
                      cursor: 'pointer', fontSize: 13,
                      color: active ? accentColor : 'var(--text3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      ...extraStyle,
                    }}
                  >
                    <Icon size={13} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color row */}
          <div style={{ padding: '8px 10px 4px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
              Couleur du texte
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {QUICK_COLORS.map(({ v, l }) => (
                <button
                  key={v}
                  title={l}
                  onClick={() => { onColor(v); onClose() }}
                  style={{
                    width: 22, height: 22, borderRadius: 5, background: v, cursor: 'pointer',
                    border: `2.5px solid ${currentStyles?.color === v ? 'var(--text)' : 'transparent'}`,
                    padding: 0, flexShrink: 0,
                    boxShadow: v === '#ffffff' ? 'inset 0 0 0 1px #ddd' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── MOVE ── */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex' }}>
        <button
          disabled={!canMoveUp}
          onClick={() => { onMoveUp(); onClose() }}
          style={{
            ...row, flex: 1, justifyContent: 'center', gap: 4, padding: '7px',
            opacity: canMoveUp ? 1 : 0.35, cursor: canMoveUp ? 'pointer' : 'not-allowed',
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
            opacity: canMoveDown ? 1 : 0.35, cursor: canMoveDown ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (canMoveDown) (e.currentTarget as HTMLElement).style.background = 'var(--bg2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          Descendre <ArrowDown size={13} />
        </button>
      </div>

      {/* ── DELETE ── */}
      <button
        onClick={() => { onRemove(); onClose() }}
        style={{
          ...row, color: '#DC2626', padding: '8px 12px', gap: 8,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <Trash2 size={13} /> Supprimer le bloc
      </button>
    </div>
  )
}