'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { DocPage } from '@/types'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { X, Trash2 } from 'lucide-react'

interface Props {
  page: DocPage
  pageNumber: number
  onOverflow?: (pageId: string, blockId: string) => void
}

const CONTENT_MAX_HEIGHT = 900

export function ContentPage({ page, pageNumber, onOverflow }: Props) {
  const { title, confidentiality, docId, removeBlock, removePage, updateBlockTable, updateBlock, setPageBlocks, docStyle } = useDocument()
  const { profile } = useProfile()
  const co = profile.color
  const name = profile.name || 'EETRA'
  const contentRef = useRef<HTMLDivElement>(null)
  const overflowFiredRef = useRef(false)

  // ─── Drag & Drop state ────────────────────────────────────────────────────
  const [dragState, setDragState] = useState<{
    draggingId: string | null
    overBlockId: string | null
    overPosition: 'before' | 'after'
  }>({ draggingId: null, overBlockId: null, overPosition: 'after' })

  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', blockId)
    setDragState(prev => ({ ...prev, draggingId: blockId }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position = e.clientY < midY ? 'before' : 'after'
    setDragState(prev => ({
      ...prev,
      overBlockId: blockId,
      overPosition: position,
    }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault()
    const draggingId = e.dataTransfer.getData('text/plain') || dragState.draggingId
    if (!draggingId || draggingId === targetBlockId) {
      setDragState({ draggingId: null, overBlockId: null, overPosition: 'after' })
      return
    }
    const newBlocks = [...page.blocks]
    const fromIdx = newBlocks.findIndex(b => b.id === draggingId)
    let toIdx = newBlocks.findIndex(b => b.id === targetBlockId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = newBlocks.splice(fromIdx, 1)
    // Recalculate toIdx after splice
    toIdx = newBlocks.findIndex(b => b.id === targetBlockId)
    const insertAt = dragState.overPosition === 'after' ? toIdx + 1 : toIdx
    newBlocks.splice(insertAt, 0, moved)
    setPageBlocks(page.id, newBlocks)
    setDragState({ draggingId: null, overBlockId: null, overPosition: 'after' })
  }, [dragState, page.blocks, page.id, setPageBlocks])

  const handleDragEnd = useCallback(() => {
    setDragState({ draggingId: null, overBlockId: null, overPosition: 'after' })
  }, [])

  // ─── Overflow detection ───────────────────────────────────────────────────
  const checkOverflow = useCallback(() => {
    const el = contentRef.current
    if (!el || overflowFiredRef.current) return
    if (el.scrollHeight > CONTENT_MAX_HEIGHT) {
      if (page.blocks.length >= 2) {
        overflowFiredRef.current = true
        const lastBlock = page.blocks[page.blocks.length - 1]
        onOverflow?.(page.id, lastBlock.id)
        setTimeout(() => { overflowFiredRef.current = false }, 600)
      }
    }
  }, [onOverflow, page.id, page.blocks])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)
    checkOverflow()
    return () => observer.disconnect()
  }, [checkOverflow, page.blocks])

  useEffect(() => { overflowFiredRef.current = false }, [page.blocks.length])

  const handleDeletePage = () => {
    if (window.confirm(`Supprimer la page ${pageNumber} ? Cette action est irréversible.`)) {
      removePage(page.id)
    }
  }

  const fontTitle = docStyle?.fontTitle || 'Bricolage Grotesque'
  const fontBody = docStyle?.fontBody || 'Bricolage Grotesque'

  return (
    <div
      id={`page-${page.id}`}
      style={{
        width: 794, minHeight: 1123, background: '#fff', color: '#111',
        position: 'relative', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,.12), 0 16px 48px rgba(0,0,0,.1)',
        marginBottom: 28, fontFamily: `'${fontBody}', sans-serif`,
      }}
    >
      {/* Side accent */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: co, opacity: .25 }} />

      {/* Header */}
      <div style={{ padding: '26px 56px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {profile.logoDataUrl && (
            <img src={profile.logoDataUrl} style={{ height: 18, maxWidth: 56, objectFit: 'contain' }} alt="" />
          )}
          <span style={{ fontFamily: `'${fontTitle}', sans-serif`, fontWeight: 800, fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: '#aaa' }}>{name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#ccc', letterSpacing: '.04em' }}>
            {(title || '—').slice(0, 32)}
          </span>
          <span style={{ fontWeight: 700, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: '#ccc', padding: '2px 7px', border: '1px solid #e8e8e8', borderRadius: 3 }}>
            {confidentiality}
          </span>
        </div>
      </div>

      {/* Content zone */}
      <div
        ref={contentRef}
        style={{
          padding: '28px 56px',
          minHeight: CONTENT_MAX_HEIGHT,
          maxHeight: CONTENT_MAX_HEIGHT,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {page.blocks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
            <p style={{ color: '#ddd', fontStyle: 'italic', fontSize: 12 }}>
              Ajoutez des blocs depuis le panneau gauche, ou choisissez un Smart Template.
            </p>
            <p style={{ color: '#e0e0e0', fontSize: 10 }}>Glissez-déposez les blocs pour les réordonner</p>
          </div>
        ) : (
          page.blocks.map(block => {
            const isDragging = dragState.draggingId === block.id
            const isOver = dragState.overBlockId === block.id && dragState.draggingId !== block.id
            return (
              <div
                key={block.id}
                className="group relative block-item"
                draggable
                onDragStart={e => handleDragStart(e, block.id)}
                onDragOver={e => handleDragOver(e, block.id)}
                onDrop={e => handleDrop(e, block.id)}
                onDragEnd={handleDragEnd}
                style={{
                  marginBottom: 20,
                  opacity: isDragging ? 0.4 : 1,
                  transition: 'opacity .15s, transform .15s',
                  borderTop: isOver && dragState.overPosition === 'before' ? `2px solid ${co}` : '2px solid transparent',
                  borderBottom: isOver && dragState.overPosition === 'after' ? `2px solid ${co}` : '2px solid transparent',
                  paddingLeft: 4,
                }}
              >
                <BlockRenderer
                  block={block}
                  color={co}
                  entityName={name}
                  pageId={page.id}
                  onUpdateTable={(blockId, tableData) => updateBlockTable(page.id, blockId, tableData)}
                  onUpdateContent={(blockId, content) => updateBlock(page.id, blockId, content)}
                />

                {/* Delete block button */}
                <button
                  onClick={() => removeBlock(page.id, block.id)}
                  className="pdf-hidden absolute opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    right: -36, top: '50%', transform: 'translateY(-50%)',
                    width: 24, height: 24, borderRadius: 5, background: '#fff',
                    border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#999',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.background = '#FECACA'; (e.currentTarget).style.borderColor = '#FCA5A5'; (e.currentTarget).style.color = '#DC2626'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = '#fff'; (e.currentTarget).style.borderColor = '#e0e0e0'; (e.currentTarget).style.color = '#999'; }}
                >
                  <X size={10} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 56px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, color: '#ccc', letterSpacing: '.06em' }}>
          {profile.watermark ? 'EETRA Document Platform · ' : ''}{docId}
        </span>
        <span style={{ fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 26, fontStyle: 'italic', color: '#e8e8e8' }}>
          {String(pageNumber).padStart(2, '0')}
        </span>
      </div>

      {/* Delete page button */}
      <button
        onClick={handleDeletePage}
        title={`Supprimer la page ${pageNumber}`}
        className="page-delete-btn pdf-hidden"
        style={{
          position: 'absolute', top: 8, right: -40,
          width: 28, height: 28, borderRadius: 6,
          background: '#fff', border: '1px solid #e0e0e0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#aaa', transition: 'all .15s',
        }}
        onMouseEnter={e => { (e.currentTarget).style.background = '#FECACA'; (e.currentTarget).style.borderColor = '#FCA5A5'; (e.currentTarget).style.color = '#DC2626'; }}
        onMouseLeave={e => { (e.currentTarget).style.background = '#fff'; (e.currentTarget).style.borderColor = '#e0e0e0'; (e.currentTarget).style.color = '#aaa'; }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}
