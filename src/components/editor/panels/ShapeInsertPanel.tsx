'use client'

import { useState } from 'react'
import { Circle, Square, Minus, Triangle, Heart, Star, ChevronDown } from 'lucide-react'

interface ShapeInsertPanelProps {
  onAddShape: (type: string, color: string, size: 'sm' | 'md' | 'lg') => void
}

export function ShapeInsertPanel({ onAddShape }: ShapeInsertPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#1B4FD8')
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('md')

  const shapes = [
    { id: 'circle', label: 'Cercle', icon: Circle },
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'line', label: 'Ligne', icon: Minus },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'heart', label: 'Coeur', icon: Heart },
    { id: 'star', label: 'Étoile', icon: Star },
  ]

  const colors = [
    '#1B4FD8', '#EA580C', '#059669', '#DC2626', '#9333EA', '#666666', '#F59E0B'
  ]

  const sizes = [
    { value: 'sm', label: 'P' },
    { value: 'md', label: 'M' },
    { value: 'lg', label: 'G' },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
          borderRadius: 6, border: '1px solid var(--border)',
          background: isOpen ? 'var(--surface)' : 'var(--bg)',
          cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--text2)',
        }}
      >
        <Circle size={14} />
        <span>Ajouter Forme</span>
        <ChevronDown size={12} style={{ marginLeft: 'auto' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 6,
          background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100,
          padding: 12, minWidth: 280,
        }}>
          {/* Shapes Grid */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Forme
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {shapes.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => {
                    onAddShape(shape.id, selectedColor, selectedSize)
                    setIsOpen(false)
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: 10, borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--surface)', cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'var(--accentS)'
                    el.style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'var(--surface)'
                    el.style.borderColor = 'var(--border)'
                  }}
                >
                  <shape.icon size={16} color="var(--accent)" />
                  <span style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center' }}>{shape.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Couleur
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: 24, height: 24, borderRadius: 4, background: color,
                    border: selectedColor === color ? '2px solid #000' : '1px solid #ccc',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
              <input
                type="color"
                value={selectedColor}
                onChange={e => setSelectedColor(e.target.value)}
                style={{
                  width: 24, height: 24, borderRadius: 4, border: '1px solid #ccc',
                  cursor: 'pointer', padding: 0,
                }}
              />
            </div>
          </div>

          {/* Size Selector */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Taille
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {sizes.map(size => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value as any)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 4,
                    border: `1.5px solid ${selectedSize === size.value ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedSize === size.value ? 'var(--accentS)' : 'var(--surface)',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    color: selectedSize === size.value ? 'var(--accent)' : 'var(--text3)',
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
