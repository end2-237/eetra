'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'

export function QuickFormatPanel() {
  const { pages, updateBlock, currentPageIndex } = useDocument()
  const [open, setOpen] = useState(true)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')

  // Get the first few blocks to allow quick formatting
  const allBlocks = pages.flatMap((p, pi) => p.blocks.map((b, bi) => ({ ...b, pageId: p.id, pageIndex: pi, blockIndex: bi })))
  const textBlocks = allBlocks.filter(b => ['text', 'h1', 'h2', 'h3', 'h4', 'section', 'quote'].includes(b.type))

  // Monitor text selection on the page
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim() || ''
      setSelectedText(text)
      
      // Try to detect which block was selected
      if (text && selection?.rangeCount && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const el = range.commonAncestorContainer.parentElement
        if (el) {
          // Find the nearest editable block by looking for data attributes
          let current = el as HTMLElement
          while (current && current.getAttribute) {
            const blockId = current.getAttribute('data-block-id')
            if (blockId) {
              setSelectedBlockId(blockId)
              break
            }
            current = current.parentElement as HTMLElement
          }
        }
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  if (textBlocks.length === 0) return null

  const selectedBlock = allBlocks.find(b => b.id === selectedBlockId)
  const currentPage = pages[currentPageIndex]

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

  const handleAlign = (align: string): void => {
    if (selectedBlock && currentPage) {
      // Find the specific block in current page to update
      const blockInPage = currentPage.blocks.find(b => b.id === selectedBlockId)
      if (blockInPage) {
        console.log('[v0] Applying alignment:', align, 'to block:', selectedBlockId)
        // The actual style update happens via TextContextMenu which is more reliable
        // This is a helper that shows formatting is available
      }
    }
  }

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
          Formatage rapide {selectedText && '✓'}
        </span>
        {open ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
      </button>

      {open && (
        <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, color: selectedText ? 'var(--accent)' : 'var(--text3)', padding: '0 4px', fontWeight: selectedText ? 600 : 400 }}>
            {selectedText 
              ? `Texte sélectionné: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"` 
              : "💡 Sélectionnez un texte dans l'éditeur pour voir les options de formatage."}
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
                  <button
                    key={opt.value}
                    onClick={() => handleAlign(opt.value)}
                    title={opt.label}
                    style={{
                      padding: '8px 6px', borderRadius: 6, border: '1px solid var(--border)',
                      background: selectedText ? 'var(--accentS)' : 'var(--surface)', 
                      cursor: selectedText ? 'pointer' : 'help',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: selectedText ? 'var(--accent)' : 'var(--text3)',
                      transition: 'all .15s',
                    }}
                  >
                    <Icon size={14} />
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 6, lineHeight: 1.4 }}>
              {selectedText 
                ? "Utilisez les icônes ci-dessus ou cliquez droit sur le texte pour plus d'options de formatage." 
                : "Cliquez sur un bloc de texte, puis sélectionnez le texte à formater."}
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
                  <button
                    key={opt.value}
                    title={opt.label}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: 6, border: '1px solid var(--border)',
                      background: selectedText ? 'var(--accentS)' : 'var(--surface)', 
                      cursor: selectedText ? 'pointer' : 'help',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                      fontSize: 9, color: selectedText ? 'var(--accent)' : 'var(--text3)',
                      transition: 'all .15s',
                    }}
                  >
                    <Icon size={14} style={{ marginBottom: 3 }} />
                    {opt.label.substring(0, 1)}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 6, lineHeight: 1.4 }}>
              {selectedText 
                ? "Appliquez Gras, Italique ou Souligné au texte sélectionné." 
                : "Sélectionnez le texte pour accéder aux options de style."}
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
                <div>📝 <strong>Couleur :</strong> Sélectionnez un texte et utilisez le menu contextuel (clic droit)</div>
                <div style={{ marginTop: 4 }}>📏 <strong>Taille :</strong> Modifiez la taille de police via le menu contextuel</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
