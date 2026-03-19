'use client'

import { useRef, useCallback, useState } from 'react'
import { DocPage, DocBlock } from '@/types'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { BlockRenderer } from '../blocks/BlockRenderer'
import {
  Plus, ChevronDown, ChevronUp, Trash2, GripVertical, X, ArrowDown, ArrowUp
} from 'lucide-react'

interface Props {
  page: DocPage
  pageIndex: number
  totalPages: number
}

export function ContentPage({ page, pageIndex, totalPages }: Props) {
  const {
    addBlock, removeBlock, updateBlock, updateBlockTable, updateBlockChart, updateBlockImage,
    setPageBlocks, removePage, currentPageIndex,
  } = useDocument()
  const { profile } = useProfile()

  const entityName = profile.name || 'Votre Entreprise'
  const accentColor = profile.color || '#1B4FD8'

  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleDragStart = (blockId: string) => setDraggingId(blockId)
  const handleDragOver = (blockId: string) => setDragOverId(blockId)
  const handleDrop = (targetBlockId: string) => {
    if (!draggingId || draggingId === targetBlockId) return
    const blocks = [...page.blocks]
    const fromIdx = blocks.findIndex(b => b.id === draggingId)
    const toIdx = blocks.findIndex(b => b.id === targetBlockId)
    const [moved] = blocks.splice(fromIdx, 1)
    blocks.splice(toIdx, 0, moved)
    setPageBlocks(page.id, blocks)
    setDraggingId(null); setDragOverId(null)
  }
  const handleDragEnd = () => { setDraggingId(null); setDragOverId(null) }

  const moveBlockUp = (blockId: string) => {
    const blocks = [...page.blocks]
    const idx = blocks.findIndex(b => b.id === blockId)
    if (idx <= 0) return
    ;[blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]]
    setPageBlocks(page.id, blocks)
  }
  const moveBlockDown = (blockId: string) => {
    const blocks = [...page.blocks]
    const idx = blocks.findIndex(b => b.id === blockId)
    if (idx >= blocks.length - 1) return
    ;[blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]]
    setPageBlocks(page.id, blocks)
  }

  return (
    <div
      style={{
        width: '100%',
        background: '#fff',
        padding: '32px 40px',
        position: 'relative',
        minHeight: 200,
      }}
    >
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase',
          color: '#ccc'
        }}>
          <span style={{ color: accentColor }}>//</span>
          Page {pageIndex + 1}
          {totalPages > 1 && <span style={{ color: '#ddd' }}>/ {totalPages}</span>}
        </div>

        {totalPages > 1 && pageIndex > 0 && (
          <button
            onClick={() => { if (window.confirm(`Supprimer la page ${pageIndex + 1} ?`)) removePage(page.id) }}
            className="pdf-hidden"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6, border: '1px solid #FCA5A5',
              background: '#FEF2F2', color: '#DC2626', cursor: 'pointer',
              fontSize: 9, fontWeight: 700,
            }}
          >
            <Trash2 size={9} /> Supprimer page
          </button>
        )}
      </div>

      {/* Blocks */}
      {page.blocks.length === 0 ? (
        <div className="pdf-hidden" style={{
          textAlign: 'center', padding: '40px 0',
          border: '1.5px dashed #e8e8e8', borderRadius: 12,
          color: '#ccc',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Page vide</div>
          <div style={{ fontSize: 10 }}>Ajoutez des blocs depuis le panneau de gauche</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {page.blocks.map((block, idx) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => handleDragStart(block.id)}
              onDragOver={e => { e.preventDefault(); handleDragOver(block.id) }}
              onDrop={() => handleDrop(block.id)}
              onDragEnd={handleDragEnd}
              className="block-wrapper"
              style={{
                position: 'relative',
                borderRadius: 8,
                padding: '2px 0',
                outline: dragOverId === block.id && draggingId !== block.id
                  ? `2px solid ${accentColor}` : 'none',
                opacity: draggingId === block.id ? 0.5 : 1,
                transition: 'opacity .15s, outline .1s',
              }}
            >
              {/* Block controls */}
              <div
                className="pdf-hidden block-controls"
                style={{
                  position: 'absolute', right: -36, top: 0,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  opacity: 0, transition: 'opacity .15s',
                }}
              >
                <button
                  onClick={() => moveBlockUp(block.id)}
                  disabled={idx === 0}
                  title="Monter"
                  style={{
                    width: 24, height: 24, borderRadius: 5, border: '1px solid #e8e8e8',
                    background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: idx === 0 ? '#e0e0e0' : '#888', padding: 0,
                  }}
                >
                  <ArrowUp size={10} />
                </button>
                <button
                  onClick={() => moveBlockDown(block.id)}
                  disabled={idx === page.blocks.length - 1}
                  title="Descendre"
                  style={{
                    width: 24, height: 24, borderRadius: 5, border: '1px solid #e8e8e8',
                    background: '#fff', cursor: idx === page.blocks.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: idx === page.blocks.length - 1 ? '#e0e0e0' : '#888', padding: 0,
                  }}
                >
                  <ArrowDown size={10} />
                </button>
                <button
                  onClick={() => removeBlock(page.id, block.id)}
                  title="Supprimer"
                  style={{
                    width: 24, height: 24, borderRadius: 5, border: '1px solid #FCA5A5',
                    background: '#FEF2F2', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#DC2626', padding: 0,
                  }}
                >
                  <X size={10} />
                </button>
              </div>

              <BlockRenderer
                block={block}
                color={accentColor}
                entityName={entityName}
                pageId={page.id}
                onUpdateContent={(blockId, content) => updateBlock(page.id, blockId, content)}
                onUpdateTable={(blockId, tableData) => updateBlockTable(page.id, blockId, tableData)}
                onUpdateChart={(blockId, chartData) => updateBlockChart(page.id, blockId, chartData)}
                onUpdateImage={(blockId, imageData) => updateBlockImage(page.id, blockId, imageData)}
                dragHandleProps={{
                  style: { cursor: 'grab' },
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Block controls hover CSS */}
      <style>{`
        .block-wrapper:hover .block-controls { opacity: 1 !important; }
        .block-wrapper:hover .block-drag-handle { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
