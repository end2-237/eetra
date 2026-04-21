'use client'

import { useState } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'

export function QuickFormatPanel() {
  const { pages } = useDocument()
  const [open, setOpen] = useState(false)

  const allBlocks = pages.flatMap((p) => p.blocks)
  if (allBlocks.length === 0) return null

  return (
    <div 
      data-tour="quick-format" 
      style={{ 
        borderBottom: '1px solid var(--border)', 
        flexShrink: 0,
        backgroundColor: 'var(--bg1)' 
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '6px 12px', 
          border: 'none', 
          background: 'transparent', 
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg2)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={12} color="var(--accent)" style={{ opacity: 0.8 }} />
          <span style={{ 
            fontSize: '10px', 
            fontWeight: 600, 
            letterSpacing: '0.02em', 
            color: 'var(--text2)', // Texte un peu plus sombre pour le professionnalisme
            fontFamily: 'inherit'
          }}>
            Aide à l'édition
          </span>
        </div>
        {open
          ? <ChevronUp size={12} color="var(--text4)" />
          : <ChevronDown size={12} color="var(--text4)" />}
      </button>

      {open && (
        <div style={{ 
          padding: '2px 8px 8px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1 
        }}>
          {[
            { icon: '⌘', label: 'Clic droit pour le formatage' },
            { icon: '⇥', label: 'Survol pour contrôle rapide' },
            { icon: '⠿', label: 'Glisser pour réorganiser' },
          ].map(({ icon, label }, i) => (
            <div key={i} style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: 10,
              padding: '4px 8px', 
              borderRadius: 4,
              // On enlève la bordure et le fond gris pour un look "menu"
              background: 'transparent', 
            }}>
              <span style={{
                fontSize: 12, 
                width: 14, 
                textAlign: 'center', 
                flexShrink: 0,
                color: 'var(--text4)', // Plus discret
                fontWeight: 500,
              }}>{icon}</span>
              <span style={{ 
                fontSize: '10.5px', 
                color: 'var(--text4)', 
                lineHeight: 1,
                userSelect: 'none'
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}