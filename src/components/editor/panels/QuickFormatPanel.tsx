'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'

export function QuickFormatPanel() {
  const { pages } = useDocument()
  const [open, setOpen] = useState(true)

  // Get the first few blocks to allow quick formatting
  const allBlocks = pages.flatMap((p, pi) => p.blocks.map((b, bi) => ({ ...b, pageId: p.id, pageIndex: pi, blockIndex: bi })))
  const textBlocks = allBlocks.filter(b => ['text', 'h1', 'h2', 'h3', 'h4', 'section', 'quote'].includes(b.type))

  if (textBlocks.length === 0) return null

  const alignOptions = [
    { value: 'left', label: 'Gauche', icon: AlignLeft },
    { value: 'center', label: 'Centre', icon: AlignCenter },
    { value: 'right', label: 'Droite', icon: AlignRight },
    { value: 'justify', label: 'Justifié', icon: AlignJustify },
  ]

  const styleOptions = [
    { value: 'bold', label: 'Gras', icon: Bold },
    { value: 'italic', label: 'Italique', icon: Italic },
    { value: 'underline', label: 'Souligné', icon: Underline },
  ]

  return (
    <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>
          Formatage rapide
        </span>
        {open ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
      </button>

      {open && (
        <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', padding: '0 4px' }}>
            💡 Sélectionnez un texte dans l'éditeur et utilisez ces options pour le formater rapidement.
          </div>

          {/* Text alignment guide */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
              Alignement du texte
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
              {alignOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <div
                    key={opt.value}
                    title={opt.label}
                    style={{
                      padding: '8px 6px', borderRadius: 6, border: '1px solid var(--border)',
                      background: 'var(--surface)', cursor: 'help',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: 'var(--text3)',
                    }}
                  >
                    <Icon size={14} />
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 6, lineHeight: 1.4 }}>
              Cliquez sur un bloc de texte, puis utilisez les icônes d'alignement dans la barre d'outils flottante ou modifiez-le via le panneau de propriétés.
            </div>
          </div>

          {/* Text styles guide */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
              Styles de texte
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {styleOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <div
                    key={opt.value}
                    title={opt.label}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: 6, border: '1px solid var(--border)',
                      background: 'var(--surface)', cursor: 'help',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                      fontSize: 9, color: 'var(--text3)',
                    }}
                  >
                    <Icon size={14} style={{ marginBottom: 3 }} />
                    {opt.label.substring(0, 1)}
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 6, lineHeight: 1.4 }}>
              Sélectionnez le texte et cliquez sur les icônes pour appliquer les styles. Gras, Italique, Souligné.
            </div>
          </div>

          {/* Color & Size guide */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
              Couleur & Taille de Police
            </div>
            <div style={{
              padding: '8px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', lineHeight: 1.5 }}>
                <div>📝 <strong>Couleur :</strong> Sélectionnez un texte et cliquez sur le sélecteur de couleur</div>
                <div style={{ marginTop: 4 }}>📏 <strong>Taille :</strong> Modifiez la taille de police avec le champ de contrôle</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
