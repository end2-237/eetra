'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MousePointerClick } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'

export function QuickFormatPanel() {
  const { pages } = useDocument()
  const [open, setOpen] = useState(true)

  const allBlocks = pages.flatMap((p) => p.blocks)
  if (allBlocks.length === 0) return null

  return (
    <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '10px 14px',
          border: 'none', background: 'transparent', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MousePointerClick size={12} color="var(--accent)" />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>
            Formatage rapide
          </span>
        </div>
        {open ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
      </button>

      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Right-click tip */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 11px', borderRadius: 9,
            background: 'var(--accentS)', border: '1px solid var(--accentS2)',
          }}>
            <div style={{ fontSize: 16, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>🖱️</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 3 }}>
                Clic droit sur un bloc
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
                Alignement, gras, italique, couleur du texte, déplacement et suppression disponibles directement sur le bloc.
              </div>
            </div>
          </div>

          {/* Hover tip */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 11px', borderRadius: 9,
            background: 'var(--bg2)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 16, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>✋</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                Survoler un bloc
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
                Une mini-barre apparaît à droite avec les options d'alignement, montée/descente et suppression.
              </div>
            </div>
          </div>

          {/* Drag tip */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 11px', borderRadius: 9,
            background: 'var(--bg2)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 16, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>⠿</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                Glisser-déposer
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
                Faites glisser un bloc pour le réorganiser dans la page.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}