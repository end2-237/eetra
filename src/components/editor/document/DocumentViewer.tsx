'use client'

import { useRef } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { CoverPage } from './CoverPage'
import { ContentPage } from './ContentPage'
import {
  ZoomIn, ZoomOut, Plus, ChevronLeft, ChevronRight,
  RotateCcw, RotateCw, Download, Save
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  onExport: () => void
}

export function DocumentViewer({ onExport }: Props) {
  const {
    pages, currentPageIndex, setCurrentPageIndex,
    addPage, zoom, setZoom, undo, redo, canUndo, canRedo,
    modified, markSaved, title,
  } = useDocument()
  const { profile } = useProfile()
  const viewerRef = useRef<HTMLDivElement>(null)

  const PAGE_W = 794  // A4 px at 96dpi
  const PAGE_H = 1123

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 1.5))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.4))

  const currentPage = pages[currentPageIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        height: 48, flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px', gap: 12,
      }}>
        {/* Left — doc title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text2)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240,
          }}>
            {title || 'Document sans titre'}
          </span>
          {modified && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
              background: 'rgba(217,119,6,.1)', color: '#D97706', letterSpacing: '.06em',
            }}>
              Non sauvegardé
            </span>
          )}
        </div>

        {/* Center — undo/redo + zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={undo} disabled={!canUndo} title="Annuler"
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: canUndo ? 'pointer' : 'not-allowed', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: canUndo ? 'var(--text3)' : 'var(--border2)' }}>
            <RotateCcw size={13} />
          </button>
          <button onClick={redo} disabled={!canRedo} title="Rétablir"
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: canRedo ? 'pointer' : 'not-allowed', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: canRedo ? 'var(--text3)' : 'var(--border2)' }}>
            <RotateCw size={13} />
          </button>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 6px' }} />

          <button onClick={handleZoomOut} title="Zoom arrière"
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
            <ZoomOut size={12} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', minWidth: 40, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} title="Zoom avant"
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
            <ZoomIn size={12} />
          </button>
        </div>

        {/* Right — export */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download size={13} /> Exporter PDF
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={viewerRef} style={{
        flex: 1, overflowY: 'auto', overflowX: 'auto',
        background: 'var(--bg3)',
        padding: '32px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
      }}>
        {/* Cover page */}
        <div
          id="eetra-page-cover"
          style={{
            width: PAGE_W * zoom,
            height: PAGE_H * zoom,
            flexShrink: 0,
            boxShadow: '0 4px 32px rgba(0,0,0,.12)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            background: '#fff',
          }}
        >
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: PAGE_W, height: PAGE_H }}>
            <CoverPage />
          </div>
        </div>

        {/* Content pages */}
        {pages.map((page, idx) => (
          <div
            key={page.id}
            id={`eetra-page-${idx}`}
            onClick={() => setCurrentPageIndex(idx)}
            style={{
              width: PAGE_W * zoom,
              minHeight: PAGE_H * zoom,
              flexShrink: 0,
              boxShadow: currentPageIndex === idx
                ? `0 0 0 2px ${profile.color || '#1B4FD8'}, 0 4px 32px rgba(0,0,0,.12)`
                : '0 4px 32px rgba(0,0,0,.10)',
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#fff',
              transition: 'box-shadow .15s',
            }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: PAGE_W, minHeight: PAGE_H }}>
              <ContentPage page={page} pageIndex={idx} totalPages={pages.length} />
            </div>
          </div>
        ))}

        {/* Add page button */}
        <button
          onClick={addPage}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 12,
            border: '2px dashed var(--border2)',
            background: 'transparent', cursor: 'pointer', color: 'var(--text4)',
            fontSize: 12, fontWeight: 700, transition: 'all .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Plus size={14} /> Ajouter une page
        </button>
      </div>

      {/* Page nav footer */}
      {pages.length > 1 && (
        <div style={{
          height: 40, flexShrink: 0,
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <button
            onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPageIndex === 0 ? 'var(--border2)' : 'var(--text3)' }}
          >
            <ChevronLeft size={13} />
          </button>

          <div style={{ display: 'flex', gap: 4 }}>
            {pages.map((_, i) => (
              <button key={i} onClick={() => setCurrentPageIndex(i)}
                style={{ width: i === currentPageIndex ? 20 : 7, height: 7, borderRadius: 10, border: 'none', cursor: 'pointer', background: i === currentPageIndex ? 'var(--accent)' : 'var(--border2)', transition: 'all .15s', padding: 0 }} />
            ))}
          </div>

          <button
            onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === pages.length - 1}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPageIndex === pages.length - 1 ? 'var(--border2)' : 'var(--text3)' }}
          >
            <ChevronRight size={13} />
          </button>

          <span style={{ fontSize: 11, color: 'var(--text4)', marginLeft: 4 }}>
            Page {currentPageIndex + 1} / {pages.length}
          </span>
        </div>
      )}
    </div>
  )
}