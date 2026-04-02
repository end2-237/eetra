'use client'

import { useState, useRef, useEffect } from 'react'
import { DocBlock, BlockStyleProperties, FONT_BODY_OPTIONS, FONT_TITLE_OPTIONS } from '@/types'
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Copy, Type, Palette, Settings,
  ChevronRight, ChevronDown
} from 'lucide-react'

interface TextContextMenuProps {
  block: DocBlock
  x: number
  y: number
  onClose: () => void
  onUpdateStyle: (styles: BlockStyleProperties) => void
  onUpdateContent: (content: string) => void
}

export function TextContextMenu({
  block,
  x,
  y,
  onClose,
  onUpdateStyle,
  onUpdateContent,
}: TextContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const styles = block.styles || {}

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const menuItems = [
    {
      label: 'Alignement',
      icon: AlignLeft,
      submenu: 'alignment',
      subItems: [
        { label: 'Gauche', value: 'left', icon: AlignLeft },
        { label: 'Centre', value: 'center', icon: AlignCenter },
        { label: 'Droite', value: 'right', icon: AlignRight },
        { label: 'Justifié', value: 'justify', icon: AlignJustify },
      ],
    },
    {
      label: 'Style de texte',
      icon: Settings,
      submenu: 'textStyle',
      subItems: [
        { label: 'Gras', value: 'bold', icon: Bold },
        { label: 'Italique', value: 'italic', icon: Italic },
        { label: 'Souligné', value: 'underline', icon: Underline },
      ],
    },
    {
      label: 'Taille de police',
      icon: Type,
      submenu: 'fontSize',
      subItems: [
        { label: '10px', value: 10 },
        { label: '12px', value: 12 },
        { label: '14px', value: 14 },
        { label: '16px', value: 16 },
        { label: '18px', value: 18 },
        { label: '20px', value: 20 },
        { label: '24px', value: 24 },
        { label: '28px', value: 28 },
      ],
    },
    {
      label: 'Couleur du texte',
      icon: Palette,
      submenu: 'color',
      subItems: [
        { label: 'Noir', value: '#000000', color: '#000000' },
        { label: 'Gris foncé', value: '#333333', color: '#333333' },
        { label: 'Bleu', value: '#1B4FD8', color: '#1B4FD8' },
        { label: 'Orange', value: '#EA580C', color: '#EA580C' },
        { label: 'Vert', value: '#059669', color: '#059669' },
        { label: 'Rouge', value: '#DC2626', color: '#DC2626' },
        { label: 'Violet', value: '#9333EA', color: '#9333EA' },
      ],
    },
    {
      label: 'Police',
      icon: Type,
      submenu: 'font',
      subItems: FONT_BODY_OPTIONS.slice(0, 8).map(f => ({
        label: f.label,
        value: f.value,
        font: f.value,
      })),
    },
  ]

  const handleAlignmentChange = (align: string) => {
    onUpdateStyle({ align: align as any })
    setOpenSubmenu(null)
  }

  const handleStyleToggle = (styleKey: 'bold' | 'italic' | 'underline') => {
    const current = styles.textStyles || {}
    const updated = { ...current, [styleKey]: !current[styleKey] }
    onUpdateStyle({ textStyles: updated })
  }

  const handleFontSizeChange = (size: number) => {
    onUpdateStyle({ fontSize: size })
    setOpenSubmenu(null)
  }

  const handleColorChange = (color: string) => {
    onUpdateStyle({ color })
    setOpenSubmenu(null)
  }

  const handleFontChange = (font: string) => {
    onUpdateStyle({ fontFamily: font })
    setOpenSubmenu(null)
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        background: '#fff',
        border: '1px solid #d0d0d0',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000,
        minWidth: 220,
      }}
    >
      {menuItems.map((item) => (
        <div key={item.submenu}>
          <button
            onMouseEnter={() => setOpenSubmenu(item.submenu)}
            onClick={() => setOpenSubmenu(openSubmenu === item.submenu ? null : item.submenu)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              border: 'none',
              background: openSubmenu === item.submenu ? '#f0f0f0' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <item.icon size={16} color="#666" />
              <span style={{ color: '#333' }}>{item.label}</span>
            </div>
            <ChevronRight size={14} color="#999" />
          </button>

          {openSubmenu === item.submenu && (
            <div
              onMouseLeave={() => setOpenSubmenu(null)}
              style={{
                position: 'absolute',
                left: '100%',
                top: 0,
                marginLeft: 4,
                background: '#fff',
                border: '1px solid #d0d0d0',
                borderRadius: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {item.submenu === 'alignment' && (
                <div style={{ padding: 8 }}>
                  {item.subItems?.map((subItem: any) => (
                    <button
                      key={subItem.value}
                      onClick={() => handleAlignmentChange(subItem.value)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        border: `1px solid ${styles.align === subItem.value ? '#1B4FD8' : '#e0e0e0'}`,
                        background: styles.align === subItem.value ? '#e8f1ff' : '#fff',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginBottom: 6,
                      }}
                    >
                      <subItem.icon size={14} color={styles.align === subItem.value ? '#1B4FD8' : '#666'} />
                      <span style={{ fontSize: 12, color: '#333' }}>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {item.submenu === 'textStyle' && (
                <div style={{ padding: 8 }}>
                  {item.subItems?.map((subItem: any) => (
                    <button
                      key={subItem.value}
                      onClick={() => handleStyleToggle(subItem.value)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        border: `1px solid ${styles.textStyles?.[subItem.value] ? '#1B4FD8' : '#e0e0e0'}`,
                        background: styles.textStyles?.[subItem.value] ? '#e8f1ff' : '#fff',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginBottom: 6,
                      }}
                    >
                      <subItem.icon size={14} color={styles.textStyles?.[subItem.value] ? '#1B4FD8' : '#666'} />
                      <span style={{ fontSize: 12, color: '#333' }}>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {item.submenu === 'fontSize' && (
                <div style={{ padding: 8 }}>
                  {item.subItems?.map((subItem: any) => (
                    <button
                      key={subItem.value}
                      onClick={() => handleFontSizeChange(subItem.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${styles.fontSize === subItem.value ? '#1B4FD8' : '#e0e0e0'}`,
                        background: styles.fontSize === subItem.value ? '#e8f1ff' : '#fff',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginBottom: 6,
                        fontSize: 12,
                        color: '#333',
                        textAlign: 'left',
                      }}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}

              {item.submenu === 'color' && (
                <div style={{ padding: 8 }}>
                  {item.subItems?.map((subItem: any) => (
                    <button
                      key={subItem.value}
                      onClick={() => handleColorChange(subItem.value)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        border: `2px solid ${styles.color === subItem.value ? '#1B4FD8' : '#e0e0e0'}`,
                        background: '#fff',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: subItem.color,
                        }}
                      />
                      <span style={{ fontSize: 12, color: '#333' }}>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {item.submenu === 'font' && (
                <div style={{ padding: 8 }}>
                  {item.subItems?.map((subItem: any) => (
                    <button
                      key={subItem.value}
                      onClick={() => handleFontChange(subItem.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${styles.fontFamily === subItem.value ? '#1B4FD8' : '#e0e0e0'}`,
                        background: styles.fontFamily === subItem.value ? '#e8f1ff' : '#fff',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginBottom: 6,
                        fontSize: 12,
                        color: '#333',
                        textAlign: 'left',
                        fontFamily: `'${subItem.value}', sans-serif`,
                      }}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
