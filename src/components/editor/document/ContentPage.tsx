'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { DocPage } from '@/types'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePageLayout } from '@/contexts/PageLayoutContext'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { PageHeader } from './PageHeader'
import { PageFooter } from './PageFooter'
import { WatermarkOverlay } from './WatermarkOverlay'
import { BlockContextMenu } from './BlockContextMenu'
import { PageShapeLayer } from './PageShapeLayer'
import { Trash2, X } from 'lucide-react'

interface Props {
  page: DocPage
  pageIndex: number
  totalPages: number
}

const A4_H  = 1123
const PAD_V = 28

function CoverBorderOverlay({ config }: { config: any }) {
  const { borderStyle, borderColor = '#1B4FD8', borderWidth = 8 } = config
  if (!borderStyle || borderStyle === 'none') return null
  const base: React.CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 200, boxSizing: 'border-box' }
  if (borderStyle === 'simple') return <div style={{ ...base, border: `${borderWidth}px solid ${borderColor}` }} />
  if (borderStyle === 'double') return <div style={{ ...base, border: `${borderWidth}px double ${borderColor}` }} />
  if (borderStyle === 'thick')  return <div style={{ ...base, border: `${borderWidth * 2}px solid ${borderColor}` }} />
  if (borderStyle === 'dashed') return <div style={{ ...base, border: `${borderWidth}px dashed ${borderColor}` }} />
  if (borderStyle === 'dotted') return <div style={{ ...base, border: `${borderWidth}px dotted ${borderColor}` }} />
  if (borderStyle === 'shadow') return <div style={{ ...base, boxShadow: `inset 0 0 0 ${borderWidth}px ${borderColor}, inset 0 0 ${borderWidth * 3}px ${borderColor}40` }} />
  if (borderStyle === 'inset') return (
    <div style={{ ...base }}>
      <div style={{ position: 'absolute', inset: borderWidth, border: `${Math.max(1, borderWidth / 2)}px solid ${borderColor}`, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', inset: 0, border: `${borderWidth}px solid ${borderColor}`, boxSizing: 'border-box' }} />
    </div>
  )
  if (borderStyle === 'ornate') return (
    <div style={{ ...base }}>
      <div style={{ position: 'absolute', inset: 0, border: `${borderWidth}px solid ${borderColor}`, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', inset: borderWidth + 4, border: `${Math.max(1, borderWidth / 3)}px solid ${borderColor}`, boxSizing: 'border-box', opacity: 0.5 }} />
    </div>
  )
  if (borderStyle === 'ribbon') return (
    <div style={{ ...base }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: borderWidth, background: borderColor }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: borderWidth, background: borderColor }} />
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: borderWidth, background: borderColor }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: borderWidth, background: borderColor }} />
    </div>
  )
  if (borderStyle === 'neon') return (
    <div style={{ ...base, border: `${Math.max(1, borderWidth * 0.4)}px solid ${borderColor}`, boxShadow: [`inset 0 0 ${borderWidth}px ${borderColor}`, `inset 0 0 ${borderWidth * 3}px ${borderColor}88`, `0 0 ${borderWidth}px ${borderColor}`, `0 0 ${borderWidth * 3}px ${borderColor}88`].join(',') }} />
  )
  return null
}

export function ContentPage({ page, pageIndex, totalPages }: Props) {
  const {
    removeBlock, updateBlock, updateBlockTable, updateBlockChart, updateBlockImage,
    updateBlockStyle, setPageBlocks, removePage, overflowBlock, coverStyle,
    addShapeToPage, updatePageShape, removePageShape,
    pages,
  } = useDocument()
  const { profile } = useProfile()
  const { layout } = usePageLayout()

  const accentColor  = profile.color || '#1B4FD8'
  const entityName   = profile.name  || 'Votre Entreprise'
  const absolutePage = pageIndex + 2
  const absoluteTotal = totalPages + 1

  const pageConfig = (coverStyle as any)?.pageConfig || {}

  const headerH = layout.header.show ? layout.header.height : 0
  const footerH = layout.footer.show ? layout.footer.height : 0
  const CONTENT_MAX_H = A4_H - headerH - footerH - PAD_V * 2 - 32

  // Detect if we're inside a scaled A4 container (mobile) — use the ratio
  // to compute a responsive horizontal padding
  const [isMobileScale, setIsMobileScale] = useState(false)
  useEffect(() => {
    // A4 is 794px wide; if window < 794, we're scaled
    setIsMobileScale(window.innerWidth < 794)
    const handler = () => setIsMobileScale(window.innerWidth < 794)
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId,  setDragOverId] = useState<string | null>(null)

  // Cross-page drag state
  const [crossPageDragActive, setCrossPageDragActive] = useState(false)

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; blockId: string; blockIdx: number
  } | null>(null)

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return
    const blocks = [...page.blocks]
    const from = blocks.findIndex(b => b.id === draggingId)
    const to   = blocks.findIndex(b => b.id === targetId)
    const [moved] = blocks.splice(from, 1)
    blocks.splice(to, 0, moved)
    setPageBlocks(page.id, blocks)
    setDraggingId(null); setDragOverId(null)
  }

  // ── Cross-page drop: accept a block from another page ─────────────────────
  const handleCrossPageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setCrossPageDragActive(false)
    const blockJson = e.dataTransfer.getData('application/eetra-block')
    const fromPageId = e.dataTransfer.getData('application/eetra-from-page')
    if (!blockJson || fromPageId === page.id) return
    try {
      const block = JSON.parse(blockJson)
      // Remove from source page
      const srcPage = pages.find(p => p.id === fromPageId)
      if (srcPage) {
        setPageBlocks(fromPageId, srcPage.blocks.filter(b => b.id !== block.id))
      }
      // Add to this page
      setPageBlocks(page.id, [...page.blocks, block])
    } catch {}
  }, [page.id, page.blocks, pages, setPageBlocks])

  const moveBlockUp = useCallback((id: string) => {
    const b = [...page.blocks]; const i = b.findIndex(x => x.id === id)
    if (i <= 0) return
    ;[b[i-1], b[i]] = [b[i], b[i-1]]
    setPageBlocks(page.id, b)
  }, [page.blocks, page.id, setPageBlocks])

  const moveBlockDown = useCallback((id: string) => {
    const b = [...page.blocks]; const i = b.findIndex(x => x.id === id)
    if (i >= b.length - 1) return
    ;[b[i], b[i+1]] = [b[i+1], b[i]]
    setPageBlocks(page.id, b)
  }, [page.blocks, page.id, setPageBlocks])

  // Move block to previous page
  const moveBlockToPrevPage = useCallback((blockId: string) => {
    if (pageIndex <= 0) return
    const block = page.blocks.find(b => b.id === blockId)
    if (!block) return
    const prevPage = pages[pageIndex - 1]
    if (!prevPage) return
    setPageBlocks(page.id, page.blocks.filter(b => b.id !== blockId))
    setPageBlocks(prevPage.id, [...prevPage.blocks, block])
  }, [page, pageIndex, pages, setPageBlocks])

  // Move block to next page
  const moveBlockToNextPage = useCallback((blockId: string) => {
    if (pageIndex >= pages.length - 1) return
    const block = page.blocks.find(b => b.id === blockId)
    if (!block) return
    const nextPage = pages[pageIndex + 1]
    if (!nextPage) return
    setPageBlocks(page.id, page.blocks.filter(b => b.id !== blockId))
    setPageBlocks(nextPage.id, [block, ...nextPage.blocks])
  }, [page, pageIndex, pages, setPageBlocks])

  function getSectionPrefix(sectionOrdinal: number): string {
    const n = sectionOrdinal + 1
    const { numberStyle } = layout.hierarchy
    if (numberStyle === 'roman') {
      const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
      const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
      let res = '', num = n
      for (let i = 0; i < vals.length; i++) while (num >= vals[i]) { res += syms[i]; num -= vals[i] }
      return res + '.'
    }
    if (numberStyle === 'alpha') return String.fromCharCode(64 + n) + '.'
    return n + '.'
  }

  const currentSection = page.blocks.find(b => b.type === 'section')?.content || ''

  const contentRef       = useRef<HTMLDivElement>(null)
  const overflowFiredRef = useRef(false)

  const checkOverflow = useCallback(() => {
    const el = contentRef.current
    if (!el || overflowFiredRef.current) return
    if (el.scrollHeight > CONTENT_MAX_H && page.blocks.length >= 2) {
      overflowFiredRef.current = true
      overflowBlock(page.id, page.blocks[page.blocks.length - 1].id)
      setTimeout(() => { overflowFiredRef.current = false }, 500)
    }
  }, [page.id, page.blocks, overflowBlock, CONTENT_MAX_H])

  useEffect(() => { overflowFiredRef.current = false }, [page.blocks.length])
  useEffect(() => {
    const el = contentRef.current; if (!el) return
    const ro = new ResizeObserver(checkOverflow)
    ro.observe(el); checkOverflow()
    return () => ro.disconnect()
  }, [checkOverflow])

  const ctxBlock = contextMenu
    ? page.blocks.find(b => b.id === contextMenu.blockId)
    : null

  // Responsive padding — full 40px inside A4, reduced when scaled on mobile
  const contentPadX = 40 // always 40px in the A4 coordinate system (scaled externally)

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
    }}
      onDragOver={e => { e.preventDefault(); setCrossPageDragActive(true) }}
      onDragLeave={() => setCrossPageDragActive(false)}
      onDrop={handleCrossPageDrop}
    >
      <WatermarkOverlay />
      <CoverBorderOverlay config={pageConfig} />

      {/* Cross-page drop indicator */}
      {crossPageDragActive && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 300, pointerEvents: 'none',
          border: `3px dashed ${accentColor}`, borderRadius: 4, background: `${accentColor}08`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, background: '#fff', padding: '4px 10px', borderRadius: 6 }}>
            Déposer ici
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', background: accentColor, opacity: .18, zIndex: 1 }} />

      <PageHeader pageNumber={absolutePage} totalPages={absoluteTotal} accentColor={accentColor} currentSection={currentSection} />

      <PageShapeLayer
        pageId={page.id}
        shapes={page.shapes || []}
        onAdd={(shape) => addShapeToPage(page.id, shape)}
        onUpdate={(shapeId, patch) => updatePageShape(page.id, shapeId, patch)}
        onRemove={(shapeId) => removePageShape(page.id, shapeId)}
        accentColor={accentColor}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${PAD_V / 2}px ${contentPadX}px 0`, flexShrink: 0, zIndex: 2 }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: '#ccc', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: accentColor }}>//</span>
          Page {pageIndex + 1}
          {totalPages > 1 && <span style={{ color: '#e0e0e0' }}>/ {totalPages}</span>}
        </div>
        {totalPages > 1 && (
          <button
            onClick={() => { if (window.confirm(`Supprimer la page ${pageIndex + 1} ?`)) removePage(page.id) }}
            className="pdf-hidden"
            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 8, fontWeight: 700 }}
          >
            <Trash2 size={8} /> Supprimer
          </button>
        )}
      </div>

      <div
        ref={contentRef}
        style={{
          flex: 1,
          maxHeight: CONTENT_MAX_H,
          overflowY: 'hidden',
          overflowX: 'visible',
          padding: `${PAD_V / 2}px ${contentPadX}px`,
          zIndex: 2,
        }}
      >
        {page.blocks.length === 0 ? (
          <div className="pdf-hidden" style={{ textAlign: 'center', padding: '40px 0', border: '1.5px dashed #e8e8e8', borderRadius: 12, color: '#ccc' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Page vide</div>
            <div style={{ fontSize: 10 }}>Ajoutez des blocs depuis le panneau de gauche</div>
          </div>
        ) : (
          // ── ESPACEMENT RÉDUIT : gap de 8px au lieu de 16px ──────────────────
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {page.blocks.map((block, idx) => {
              const sectionOrdinal = page.blocks.slice(0, idx).filter(b => b.type === 'section').length
              const prefix = layout.hierarchy.autoNumberSections && block.type === 'section'
                ? getSectionPrefix(sectionOrdinal) + ' ' : ''

              return (
                <div
                  key={block.id}
                  draggable
                  onDragStart={e => {
                    setDraggingId(block.id)
                    // Store block data for cross-page moves
                    e.dataTransfer.setData('application/eetra-block', JSON.stringify(block))
                    e.dataTransfer.setData('application/eetra-from-page', page.id)
                  }}
                  onDragOver={e => { e.preventDefault(); setDragOverId(block.id) }}
                  onDrop={e => {
                    // Only same-page drops here
                    const fromPage = e.dataTransfer.getData('application/eetra-from-page')
                    if (fromPage === page.id) {
                      handleDrop(block.id)
                    }
                  }}
                  onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                  onContextMenu={e => {
                    e.preventDefault(); e.stopPropagation()
                    // ── MENU CONTEXTUEL : positionner PRÈS du clic ──
                    setContextMenu({ x: e.clientX, y: e.clientY, blockId: block.id, blockIdx: idx })
                  }}
                  className="block-wrapper"
                  style={{
                    position: 'relative',
                    borderRadius: 8,
                    padding: '2px 0',
                    outline: dragOverId === block.id && draggingId !== block.id ? `2px solid ${accentColor}` : 'none',
                    opacity: draggingId === block.id ? 0.45 : 1,
                    transition: 'opacity .15s, outline .1s',
                    overflow: 'visible',
                  }}
                >
                  {/* Hover controls */}
                  <div className="pdf-hidden block-controls" style={{
                    position: 'absolute',
                    right: -56,
                    top: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    opacity: 0,
                    transition: 'opacity .15s',
                    padding: 4,
                    background: 'rgba(255,255,255,.97)',
                    border: '1px solid #e8e8e8',
                    borderRadius: 6,
                    zIndex: 50,
                    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                    pointerEvents: 'all',
                  }}>
                    {['text', 'h1', 'h2', 'h3', 'h4', 'section', 'quote'].includes(block.type) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, marginBottom: 3 }}>
                        {[
                          { value: 'left', label: '⇤' },
                          { value: 'center', label: '↔' },
                          { value: 'right', label: '⇥' },
                          { value: 'justify', label: '≡' },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => updateBlockStyle(page.id, block.id, { align: value as any })}
                            title={value}
                            style={{
                              width: 20, height: 20, borderRadius: 3, border: `1px solid #e0e0e0`,
                              background: block.styles?.align === value ? '#e8f1ff' : '#fff',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, color: block.styles?.align === value ? '#1B4FD8' : '#999',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Move between pages */}
                    {pages.length > 1 && (
                      <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <button
                          onClick={() => moveBlockToPrevPage(block.id)}
                          disabled={pageIndex === 0}
                          title="Déplacer page précédente"
                          style={{ width: 20, height: 20, borderRadius: 3, border: '1px solid #e0e0e0', background: pageIndex === 0 ? '#f5f5f5' : '#fff', cursor: pageIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: pageIndex === 0 ? '#ddd' : '#666', flex: 1 }}>
                          ⇡P
                        </button>
                        <button
                          onClick={() => moveBlockToNextPage(block.id)}
                          disabled={pageIndex >= pages.length - 1}
                          title="Déplacer page suivante"
                          style={{ width: 20, height: 20, borderRadius: 3, border: '1px solid #e0e0e0', background: pageIndex >= pages.length - 1 ? '#f5f5f5' : '#fff', cursor: pageIndex >= pages.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: pageIndex >= pages.length - 1 ? '#ddd' : '#666', flex: 1 }}>
                          ⇣P
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 2 }}>
                      <button onClick={() => moveBlockUp(block.id)} disabled={idx === 0} title="Monter"
                        style={{ width: 20, height: 20, borderRadius: 3, border: '1px solid #e8e8e8', background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === 0 ? '#e0e0e0' : '#888', padding: 0, flex: 1 }}>
                        ↑
                      </button>
                      <button onClick={() => moveBlockDown(block.id)} disabled={idx === page.blocks.length - 1} title="Descendre"
                        style={{ width: 20, height: 20, borderRadius: 3, border: '1px solid #e8e8e8', background: '#fff', cursor: idx === page.blocks.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === page.blocks.length - 1 ? '#e0e0e0' : '#888', padding: 0, flex: 1 }}>
                        ↓
                      </button>
                      <button onClick={() => removeBlock(page.id, block.id)} title="Supprimer"
                        style={{ width: 20, height: 20, borderRadius: 3, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', padding: 0, flex: 1 }}>
                        <X size={10} />
                      </button>
                    </div>
                  </div>

                  <BlockRenderer
                    block={prefix ? { ...block, content: prefix + (block.content || '') } : block}
                    color={accentColor}
                    entityName={entityName}
                    pageId={page.id}
                    blockStyles={block.styles}
                    onUpdateContent={(blockId, content) => {
                      updateBlock(page.id, blockId, prefix ? content.replace(prefix, '').trim() : content)
                    }}
                    onUpdateTable={(blockId, td) => updateBlockTable(page.id, blockId, td)}
                    onUpdateChart={(blockId, cd) => updateBlockChart(page.id, blockId, cd)}
                    onUpdateImage={(blockId, id) => updateBlockImage(page.id, blockId, id)}
                    dragHandleProps={{ style: { cursor: 'grab' } }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <PageFooter pageNumber={absolutePage} totalPages={absoluteTotal} accentColor={accentColor} />

      {/* ── MENU CONTEXTUEL : positionné exactement au clic ── */}
      {contextMenu && ctxBlock && (
        <BlockContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          blockId={contextMenu.blockId}
          blockType={ctxBlock.type}
          currentStyles={ctxBlock.styles}
          accentColor={accentColor}
          canMoveUp={contextMenu.blockIdx > 0}
          canMoveDown={contextMenu.blockIdx < page.blocks.length - 1}
          onAlign={align => updateBlockStyle(page.id, contextMenu.blockId, { align })}
          onTextStyle={(key, val) => updateBlockStyle(page.id, contextMenu.blockId, {
            textStyles: { ...(ctxBlock.styles?.textStyles || {}), [key]: val },
          })}
          onColor={color => updateBlockStyle(page.id, contextMenu.blockId, { color })}
          onFontFamily={font => updateBlockStyle(page.id, contextMenu.blockId, { fontFamily: font })}
          onFontSize={size => updateBlockStyle(page.id, contextMenu.blockId, { fontSize: size })}
          onMoveUp={() => moveBlockUp(contextMenu.blockId)}
          onMoveDown={() => moveBlockDown(contextMenu.blockId)}
          onRemove={() => removeBlock(page.id, contextMenu.blockId)}
          onClose={closeContextMenu}
        />
      )}

      <style>{`
        .block-wrapper:hover .block-controls    { opacity: 1 !important; }
        .block-wrapper:hover .block-drag-handle { opacity: 1 !important; }

        /* ── TABLE RESPONSIVE dans la zone A4 ── */
        .block-wrapper table {
          width: 100%;
          table-layout: fixed;
          word-break: break-word;
        }
        .block-wrapper table th,
        .block-wrapper table td {
          padding: 4px 6px !important;
          font-size: 10px !important;
          white-space: normal !important;
          word-wrap: break-word;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 0;
        }
        .block-wrapper table th {
          font-size: 8px !important;
          letter-spacing: .06em !important;
        }
      `}</style>
    </div>
  )
}