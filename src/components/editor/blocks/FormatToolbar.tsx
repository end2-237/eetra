'use client'

import { useState, useEffect } from 'react'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, X } from 'lucide-react'

interface FormatToolbarProps {
  blockId: string
  onAlign?: (align: 'left' | 'center' | 'right' | 'justify') => void
  onStyle?: (style: 'bold' | 'italic' | 'underline', enabled: boolean) => void
  onColor?: (color: string) => void
  onFontSize?: (size: number) => void
  currentAlign?: 'left' | 'center' | 'right' | 'justify'
  currentStyles?: { bold?: boolean; italic?: boolean; underline?: boolean }
  position?: { x: number; y: number }
}

export function FormatToolbar({
  blockId,
  onAlign,
  onStyle,
  onColor,
  onFontSize,
  currentAlign = 'left',
  currentStyles = {},
  position,
}: FormatToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')

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

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    background: 'white',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '8px',
    display: 'flex',
    gap: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 10000,
  }

  if (position) {
    (baseStyle as any).left = `${position.x}px`
    (baseStyle as any).top = `${position.y}px`
  }

  return (
    <div style={baseStyle}>
      {/* Align buttons */}
      <div style={{ display: 'flex', gap: 2, borderRight: '1px solid var(--border)', paddingRight: 8 }}>
        {alignOptions.map(opt => {
          const Icon = opt.icon
          return (
            <button
              key={opt.value}
              onClick={() => onAlign?.(opt.value)}
              title={opt.label}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: currentAlign === opt.value ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: currentAlign === opt.value ? 'var(--accentS)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={14} color={currentAlign === opt.value ? 'var(--accent)' : '#666'} />
            </button>
          )
        })}
      </div>

      {/* Style buttons */}
      <div style={{ display: 'flex', gap: 2, borderRight: '1px solid var(--border)', paddingRight: 8 }}>
        {styleOptions.map(opt => {
          const Icon = opt.icon
          const isActive = currentStyles[opt.value]
          return (
            <button
              key={opt.value}
              onClick={() => onStyle?.(opt.value, !isActive)}
              title={opt.label}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: isActive ? 'var(--accentS)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent)' : '#666'} />
            </button>
          )
        })}
      </div>

      {/* Color picker */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Couleur"
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            border: '1px solid var(--border)',
            background: selectedColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        {showColorPicker && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: 8, zIndex: 10001 }}>
            <input
              type="color"
              value={selectedColor}
              onChange={e => {
                setSelectedColor(e.target.value)
                onColor?.(e.target.value)
              }}
              style={{ width: 100, height: 30, border: 'none', borderRadius: 4, cursor: 'pointer' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
