'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Bold, Italic, Underline } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { BlockStyleProperties, FONT_TITLE_OPTIONS, FONT_BODY_OPTIONS } from '@/types'

interface Props {
  blockId: string
  pageId: string
  blockType: string
  compact?: boolean
}

export function BlockStylePanel({ blockId, pageId, blockType, compact }: Props) {
  const { pages, updateBlockStyle } = useDocument()
  const [openSections, setOpenSections] = useState({ text: true, list: false, shape: false })

  const page = pages.find(p => p.id === pageId)
  const block = page?.blocks.find(b => b.id === blockId)
  const styles = block?.styles || {}

  const updateStyle = (newStyles: Partial<BlockStyleProperties>) => {
    updateBlockStyle(pageId, blockId, newStyles as BlockStyleProperties)
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(s => ({ ...s, [section]: !s[section] }))
  }

  const lbl = { fontSize: 9, fontWeight: 800 as const, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: 'var(--text4)', marginBottom: 6, display: 'block' as const }

  const isTextBlock = ['text', 'h1', 'h2', 'h3', 'h4', 'section', 'quote', 'clause'].includes(blockType)
  const isListBlock = ['bullet-list', 'numbered-list'].includes(blockType)
  const isShapeBlock = blockType === 'divider'

  if (!isTextBlock && !isListBlock && !isShapeBlock) return null

  const renderShapePreview = (shape: string, size: string, color: string) => {
    const sizeMap = { sm: 3, md: 5, lg: 8 }
    const s = sizeMap[size as keyof typeof sizeMap] || 5
    if (shape === 'circle') return <div style={{ width: s, height: s, borderRadius: '50%', background: color }} />
    if (shape === 'rectangle') return <div style={{ width: s + 2, height: s, background: color }} />
    if (shape === 'line') return <div style={{ width: s * 2, height: 2, background: color }} />
    return null
  }

  return (
    <div>
      {/* Text Alignment */}
      {isTextBlock && (
        <>
          <button
            onClick={() => toggleSection('text')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '10px 14px',
              border: 'none', background: 'transparent', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)' }}>
              Texte
            </span>
            {openSections.text ? <ChevronUp size={12} color="var(--text4)" /> : <ChevronDown size={12} color="var(--text4)" />}
          </button>

          {openSections.text && (
            <div style={{ padding: '0 10px 10px' }}>
              {/* Alignment */}
              <span style={lbl}>Alignement</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginBottom: 12 }}>
                {(['left', 'center', 'right', 'justify'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => updateStyle({ align })}
                    style={{
                      padding: '6px 4px', borderRadius: 6,
                      border: `1.5px solid ${styles.align === align ? 'var(--accent)' : 'var(--border)'}`,
                      background: styles.align === align ? 'var(--accentS)' : 'var(--surface)',
                      cursor: 'pointer', fontSize: 10, fontWeight: 600,
                      color: styles.align === align ? 'var(--accent)' : 'var(--text3)',
                    }}
                  >
                    {align.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Text Styles */}
              <span style={lbl}>Styles</span>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[
                  { key: 'bold', icon: <Bold size={14} />, label: 'Gras' },
                  { key: 'italic', icon: <Italic size={14} />, label: 'Italique' },
                  { key: 'underline', icon: <Underline size={14} />, label: 'Souligné' },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      const textStyles = styles.textStyles || {}
                      updateStyle({
                        textStyles: {
                          ...textStyles,
                          [key]: !(textStyles[key as keyof typeof textStyles]),
                        },
                      })
                    }}
                    title={label}
                    style={{
                      flex: 1, height: 28, borderRadius: 6,
                      border: `1.5px solid ${styles.textStyles?.[key as keyof typeof styles.textStyles] ? 'var(--accent)' : 'var(--border)'}`,
                      background: styles.textStyles?.[key as keyof typeof styles.textStyles] ? 'var(--accentS)' : 'var(--surface)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: styles.textStyles?.[key as keyof typeof styles.textStyles] ? 'var(--accent)' : 'var(--text3)',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Color */}
              <span style={lbl}>Couleur</span>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['#111', '#444', '#EA580C', '#1B4FD8', '#059669', '#DC2626'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateStyle({ color })}
                    style={{
                      width: 24, height: 24, borderRadius: 5, background: color, cursor: 'pointer',
                      border: `2px solid ${styles.color === color ? '#000' : 'transparent'}`,
                      padding: 0, flexShrink: 0,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={styles.color || '#111'}
                  onChange={e => updateStyle({ color: e.target.value })}
                  style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', padding: 1, cursor: 'pointer' }}
                />
              </div>

              {/* Font Size */}
              <span style={lbl}>Taille police</span>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                <input
                  type="number"
                  min={8}
                  max={48}
                  value={styles.fontSize || 12}
                  onChange={e => updateStyle({ fontSize: parseInt(e.target.value) || 12 })}
                  style={{
                    flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg)', color: 'var(--text)', fontSize: 11, outline: 'none',
                  }}
                />
                <span style={{ padding: '6px 8px', fontSize: 11, color: 'var(--text3)' }}>px</span>
              </div>

              {/* Font Family */}
              <span style={lbl}>Police</span>
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 4 }}>
                {[...FONT_TITLE_OPTIONS, ...FONT_BODY_OPTIONS].filter((f, i, a) => a.findIndex(x => x.value === f.value) === i).map(f => (
                  <button
                    key={f.value}
                    onClick={() => updateStyle({ fontFamily: f.value })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 8px', borderRadius: 6,
                      border: `1.5px solid ${styles.fontFamily === f.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: styles.fontFamily === f.value ? 'var(--accentS)' : 'var(--surface)',
                      cursor: 'pointer', textAlign: 'left', fontSize: 10, fontWeight: 600,
                    }}
                  >
                    <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 12 }}>Aa</span>
                    <span style={{ color: 'var(--text3)', flex: 1 }}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* List Styles */}
      {isListBlock && (
        <>
          <button
            onClick={() => toggleSection('list')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '10px 14px',
              border: 'none', background: 'transparent', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)' }}>
              Liste
            </span>
            {openSections.list ? <ChevronUp size={12} color="var(--text4)" /> : <ChevronDown size={12} color="var(--text4)" />}
          </button>

          {openSections.list && (
            <div style={{ padding: '0 10px 10px' }}>
              {blockType === 'bullet-list' && (
                <>
                  <span style={lbl}>Style puces</span>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {(['disc', 'circle', 'square'] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => updateStyle({ listStyle: style })}
                        style={{
                          flex: 1, padding: '6px 4px', borderRadius: 6,
                          border: `1.5px solid ${styles.listStyle === style ? 'var(--accent)' : 'var(--border)'}`,
                          background: styles.listStyle === style ? 'var(--accentS)' : 'var(--surface)',
                          cursor: 'pointer', fontSize: 10, fontWeight: 600,
                          color: styles.listStyle === style ? 'var(--accent)' : 'var(--text3)',
                        }}
                      >
                        {style === 'disc' ? '•' : style === 'circle' ? '◦' : '▪'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {blockType === 'numbered-list' && (
                <>
                  <span style={lbl}>Format numéros</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[
                      { value: 'numeric' as const, label: '1, 2, 3...' },
                      { value: 'roman-upper' as const, label: 'I, II, III...' },
                      { value: 'roman-lower' as const, label: 'i, ii, iii...' },
                      { value: 'alpha-upper' as const, label: 'A, B, C...' },
                      { value: 'alpha-lower' as const, label: 'a, b, c...' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateStyle({ numberFormat: value })}
                        style={{
                          padding: '6px 8px', borderRadius: 6, textAlign: 'left',
                          border: `1.5px solid ${styles.numberFormat === value ? 'var(--accent)' : 'var(--border)'}`,
                          background: styles.numberFormat === value ? 'var(--accentS)' : 'var(--surface)',
                          cursor: 'pointer', fontSize: 10, fontWeight: 600,
                          color: styles.numberFormat === value ? 'var(--accent)' : 'var(--text3)',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Shape Styles */}
      {isShapeBlock && (
        <>
          <button
            onClick={() => toggleSection('shape')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '10px 14px',
              border: 'none', background: 'transparent', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)' }}>
              Forme
            </span>
            {openSections.shape ? <ChevronUp size={12} color="var(--text4)" /> : <ChevronDown size={12} color="var(--text4)" />}
          </button>

          {openSections.shape && (
            <div style={{ padding: '0 10px 10px' }}>
              {/* Shape type */}
              <span style={lbl}>Type de forme</span>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {(['circle', 'rectangle', 'line'] as const).map(shapeType => (
                  <button
                    key={shapeType}
                    onClick={() => updateStyle({ shape: shapeType })}
                    style={{
                      flex: 1, height: 32, borderRadius: 6,
                      border: `1.5px solid ${styles.shape === shapeType ? 'var(--accent)' : 'var(--border)'}`,
                      background: styles.shape === shapeType ? 'var(--accentS)' : 'var(--surface)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {renderShapePreview(shapeType, styles.shapeSize || 'md', styles.shapeColor || '#1B4FD8')}
                  </button>
                ))}
              </div>

              {/* Shape size */}
              <span style={lbl}>Taille</span>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => updateStyle({ shapeSize: size })}
                    style={{
                      flex: 1, padding: '6px 4px', borderRadius: 6,
                      border: `1.5px solid ${styles.shapeSize === size ? 'var(--accent)' : 'var(--border)'}`,
                      background: styles.shapeSize === size ? 'var(--accentS)' : 'var(--surface)',
                      cursor: 'pointer', fontSize: 10, fontWeight: 600,
                      color: styles.shapeSize === size ? 'var(--accent)' : 'var(--text3)',
                    }}
                  >
                    {size === 'sm' ? 'P' : size === 'md' ? 'M' : 'G'}
                  </button>
                ))}
              </div>

              {/* Shape color */}
              <span style={lbl}>Couleur</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#1B4FD8', '#EA580C', '#059669', '#DC2626', '#9333EA', '#666666'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateStyle({ shapeColor: color })}
                    style={{
                      width: 24, height: 24, borderRadius: 5, background: color, cursor: 'pointer',
                      border: `2px solid ${styles.shapeColor === color ? '#000' : 'transparent'}`,
                      padding: 0, flexShrink: 0,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={styles.shapeColor || '#1B4FD8'}
                  onChange={e => updateStyle({ shapeColor: e.target.value })}
                  style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', padding: 1, cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
