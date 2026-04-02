'use client'

import { useState } from 'react'
import { ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { DocBlock } from '@/types'

interface BlockControlsPanelProps {
  block: DocBlock
  pageId: string
  onRemove?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function BlockControlsPanel({ block, pageId, onRemove, onMoveUp, onMoveDown }: BlockControlsPanelProps) {
  const { updateBlockStyle } = useDocument()
  const [showControls, setShowControls] = useState(false)

  const isTextBlock = ['text', 'h1', 'h2', 'h3', 'h4', 'section', 'quote'].includes(block.type)
  if (!isTextBlock) return null

  const styles = block.styles || {}
  const currentAlign = styles.align || 'left'

  const alignOptions = [
    { value: 'left' as const, icon: AlignLeft, label: 'Gauche' },
    { value: 'center' as const, icon: AlignCenter, label: 'Centre' },
    { value: 'right' as const, icon: AlignRight, label: 'Droite' },
    { value: 'justify' as const, icon: AlignJustify, label: 'Justifié' },
  ]

  const styleOptions = [
    { value: 'bold' as const, icon: Bold, label: 'Gras' },
    { value: 'italic' as const, icon: Italic, label: 'Italique' },
    { value: 'underline' as const, icon: Underline, label: 'Souligné' },
  ]

  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    updateBlockStyle(pageId, block.id, { align })
  }

  const handleStyle = (styleKey: 'bold' | 'italic' | 'underline', enabled: boolean) => {
    const textStyles = styles.textStyles || {}
    updateBlockStyle(pageId, block.id, {
      textStyles: { ...textStyles, [styleKey]: enabled }
    })
  }

  return (
    <div style={{
      position: 'absolute', right: -50, top: 0,
      display: 'flex', flexDirection: 'column', gap: 2,
    }} className="pdf-hidden">
      {/* Quick align buttons */}
      {showControls && (
        <div style={{ display: 'flex', gap: 1, background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 4 }}>
          {alignOptions.map(opt => {
            const Icon = opt.icon
            const isActive = currentAlign === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleAlign(opt.value)}
                title={opt.label}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 3,
                  border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: isActive ? 'var(--accentS)' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <Icon size={12} color={isActive ? 'var(--accent)' : '#999'} />
              </button>
            )
          })}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setShowControls(!showControls)}
        title="Formatage"
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid var(--border)',
          background: showControls ? 'var(--accentS)' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: showControls ? 'var(--accent)' : '#666',
        }}
      >
        <ChevronDown size={14} style={{ transform: showControls ? 'rotate(180deg)' : undefined }} />
      </button>

      {/* Move & Delete buttons */}
      <button
        onClick={onMoveUp}
        title="Monter"
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid var(--border)',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ArrowUp size={14} color="#999" />
      </button>

      <button
        onClick={onMoveDown}
        title="Descendre"
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid var(--border)',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ArrowDown size={14} color="#999" />
      </button>

      <button
        onClick={onRemove}
        title="Supprimer"
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid #FCA5A5',
          background: '#FEF2F2',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Trash2 size={14} color="#DC2626" />
      </button>
    </div>
  )
}
