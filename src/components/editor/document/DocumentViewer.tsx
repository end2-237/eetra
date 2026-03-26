'use client'

import { useRef, useMemo } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { ContentPage } from './ContentPage'
import { EditableCoverPage } from './EditableCoverPage'
import {
  ZoomIn, ZoomOut, Plus, ChevronLeft, ChevronRight,
  RotateCcw, RotateCw, Download, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  OrientationZonePage,
  extractTOCEntries,
  extractTableList,
  extractIllustrationList,
} from '@/components/editor/document/OrientationZonePage'

interface Props {
  onExport: () => void
}

const PAGE_W = 794
const PAGE_H = 1123

// ── Compute how many OZ pages we need ────────────────────────────────────────

function computeOZPageCount(config: any, pages: any[]): number {
  if (!config?.enabled) return 0
  const ITEMS_PER_PAGE = 28

  let tocCount = 0
  pages.forEach(p => {
    ;(p.blocks || []).forEach((b: any) => {
      const lvl = b.type === 'h1' ? 1 : b.type === 'h2' ? 2 : b.type === 'h3' ? 3 : b.type === 'h4' ? 4 : b.type === 'section' ? 1 : 0
      if (lvl > 0 && config.tocLevels?.includes(lvl)) tocCount++
    })
  })
  let tableCount = 0, illustCount = 0
  pages.forEach(p => {
    ;(p.blocks || []).forEach((b: any) => {
      if (b.type === 'table') tableCount++
      if (b.type === 'image' && (b.imageData?.caption || b.content)) illustCount++
    })
  })

  let pageCount = 0
  if (config.showTOC) {
    pageCount += Math.max(1, Math.ceil(tocCount / ITEMS_PER_PAGE))
    const firstTOCItems = Math.min(tocCount, ITEMS_PER_PAGE)
    const spaceOnFirstPage = ITEMS_PER_PAGE - firstTOCItems
    if (config.showTableList && tableCount > 0 && tableCount > spaceOnFirstPage - 4) pageCount++
    if (config.showIllustrationList && illustCount > 0) {
      const alreadyAdded = config.showTableList && tableCount > 0 && tableCount > spaceOnFirstPage - 4
      if (alreadyAdded || tableCount > 0) pageCount++
      // else they fit
    }
  } else {
    if (config.showTableList && tableCount > 0) pageCount++
    if (config.showIllustrationList && illustCount > 0) pageCount++
  }

  return Math.max(1, Math.min(4, pageCount))
}

// ── OZ Badge ─────────────────────────────────────────────────────────────────

function OZBadge({ onEdit }: { onEdit: () => void }) {
  return (
    <div
      style={{
        position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 99,
        background: 'rgba(124,58,237,.12)', border: '1.5px solid rgba(124,58,237,.3)',
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all .15s',
        zIndex: 10,
      }}
      onClick={onEdit}
      title="Cliquez pour configurer la zone d'orientation"
    >
      <BookOpen size={11} color="#7C3AED" />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED' }}>
        Zone d'Orientation
      </span>
      <span style={{ fontSize: 9, color: '#9a6ed8', background: 'rgba(124,58,237,.1)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
        Modifier
      </span>
    </div>
  )
}

export function DocumentViewer({ onExport }: Props) {
  const {
    pages, currentPageIndex, setCurrentPageIndex,
    addPage, zoom, setZoom,
    undo, redo, canUndo, canRedo,
    modified, title, coverStyle, orientationZone,
    setActiveTab,
  } = useDocument()
  const { profile } = useProfile()
  const viewerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn  = () => setZoom(Math.min(zoom + 0.1, 1.0))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.35))

  // ── Compute OZ data ──────────────────────────────────────────────────────────
  const ozPageCount = useMemo(() => computeOZPageCount(orientationZone, pages), [orientationZone, pages])

  // Cover = page 1, OZ (if after-cover) = pages 2…(1+ozPageCount), content = after
  const ozAfterCover = orientationZone?.enabled && orientationZone.position === 'after-cover'
  const ozAtEnd      = orientationZone?.enabled && orientationZone.position === 'end'
  const ozAfterPage  = orientationZone?.enabled && orientationZone.position === 'after-page'

  // Absolute page number calculation
  // cover = 1
  // If OZ after-cover: OZ pages = 2..(1+ozPageCount), content starts at 2+ozPageCount
  // If OZ after-page N: content[0..N] = 2..(N+2), OZ = (N+3)..(N+2+ozPageCount), content[N+1..] = (N+3+ozPageCount)..
  // If OZ at end: content = 2..(1+pages.length), OZ = (2+pages.length)..
  const contentPageOffset = useMemo(() => {
    if (ozAfterCover) return 1 + ozPageCount + 1  // cover(1) + OZ pages + first content
    return 2 // default: cover(1) + first content(2)
  }, [ozAfterCover, ozPageCount])

  // OZ page absolute start
  const ozAbsoluteStart = useMemo(() => {
    if (ozAfterCover) return 2
    if (ozAtEnd) return 1 + pages.length + 1
    if (ozAfterPage && orientationZone.afterPageIndex !== null) {
      return 1 + (orientationZone.afterPageIndex + 1) + 1
    }
    return 2
  }, [ozAfterCover, ozAtEnd, ozAfterPage, pages.length, orientationZone])

  // Total pages for header/footer
  const totalAbsolutePages = useMemo(() => {
    return 1 + pages.length + (orientationZone?.enabled ? ozPageCount : 0)
  }, [pages.length, orientationZone, ozPageCount])

  // OZ extracted data
  const { tocEntries, tableList, illustrationList } = useMemo(() => {
    if (!orientationZone?.enabled) return { tocEntries: [], tableList: [], illustrationList: [] }
    const offset = ozAfterCover ? contentPageOffset : 2
    return {
      tocEntries: extractTOCEntries(pages, orientationZone.tocLevels || [1,2,3], orientationZone.numberStyle || 'numeric', offset),
      tableList: extractTableList(pages, offset),
      illustrationList: extractIllustrationList(pages, offset),
    }
  }, [pages, orientationZone, ozAfterCover, contentPageOffset])

  // ── Render OZ page block ─────────────────────────────────────────────────────
  const renderOZPages = (startAbsolute: number) => {
    if (!orientationZone?.enabled) return null
    return Array.from({ length: ozPageCount }, (_, i) => (
      <div key={`oz-${i}`} style={{ position: 'relative' }}>
        {i === 0 && <OZBadge onEdit={() => setActiveTab('orientation')} />}
        <div
          style={{
            width: PAGE_W * zoom, height: PAGE_H * zoom, flexShrink: 0,
            overflow: 'hidden', borderRadius: 4,
            background: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,.10)',
            border: '2px solid rgba(124,58,237,.25)',
            position: 'relative',
          }}
        >
          {/* Purple label stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3 * zoom,
            background: 'linear-gradient(90deg,#7C3AED,#a855f7)',
            zIndex: 10, pointerEvents: 'none',
          }} />
          <div style={{
            width: PAGE_W, height: PAGE_H,
            transform: `scale(${zoom})`, transformOrigin: 'top left',
            marginBottom: -(PAGE_H - PAGE_H * zoom),
          }}>
            <OrientationZonePage
              config={orientationZone}
              pageIndex={i}
              absolutePageNum={startAbsolute + i}
              totalAbsolutePages={totalAbsolutePages}
              tocEntries={tocEntries}
              tableList={tableList}
              illustrationList={illustrationList}
            />
          </div>
        </div>
      </div>
    ))
  }

  // ── Build the ordered page list ───────────────────────────────────────────────
  // We build an array of elements in order: cover, then OZ/content interleaved

  const buildPageList = () => {
    const elements: React.ReactNode[] = []

    // Cover
    elements.push(
      <div key="cover" id="eetra-page-cover"
        style={{ flexShrink: 0, borderRadius: 4, boxShadow: '0 4px 32px rgba(0,0,0,.12)', marginTop: 44 }}>
        <EditableCoverPage zoom={zoom} />
      </div>
    )

    // OZ after cover
    if (ozAfterCover) {
      renderOZPages(ozAbsoluteStart)?.forEach((el, i) => elements.push(
        <div key={`oz-cover-${i}`} id={`eetra-oz-page-${i}`}>{el}</div>
      ))
    }

    // Content pages — interleave OZ if after-page
    pages.forEach((page, idx) => {
      // absolute page for this content page
      const absPage = ozAfterCover
        ? contentPageOffset + idx
        : ozAfterPage && orientationZone.afterPageIndex !== null && idx > orientationZone.afterPageIndex
          ? 2 + idx + ozPageCount
          : 2 + idx

      elements.push(
        <div key={page.id} id={`eetra-page-${idx}`}
          onClick={() => setCurrentPageIndex(idx)}
          style={{
            width: PAGE_W * zoom, height: PAGE_H * zoom,
            flexShrink: 0, overflow: 'hidden', borderRadius: 4,
            background: '#fff',
            boxShadow: currentPageIndex === idx
              ? `0 0 0 2px ${profile.color || '#1B4FD8'}, 0 4px 32px rgba(0,0,0,.12)`
              : '0 4px 32px rgba(0,0,0,.10)',
            cursor: 'pointer', transition: 'box-shadow .15s',
          }}>
          <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${zoom})`, transformOrigin: 'top left', marginBottom: -(PAGE_H - PAGE_H * zoom) }}>
            <ContentPage page={page} pageIndex={idx} totalPages={pages.length} />
          </div>
        </div>
      )

      // OZ after specific page
      if (ozAfterPage && orientationZone.afterPageIndex === idx) {
        renderOZPages(ozAbsoluteStart)?.forEach((el, i) => elements.push(
          <div key={`oz-mid-${i}`} id={`eetra-oz-page-${i}`}>{el}</div>
        ))
      }
    })

    // OZ at end
    if (ozAtEnd) {
      renderOZPages(ozAbsoluteStart)?.forEach((el, i) => elements.push(
        <div key={`oz-end-${i}`} id={`eetra-oz-page-${i}`}>{el}</div>
      ))
    }

    return elements
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{
        height: 48, flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', gap: 12,
        minWidth: 0,
      }}>
        {/* Left — title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', minWidth: 0 }}>
            {title || 'Document sans titre'}
          </span>
          {modified && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(217,119,6,.1)', color: '#D97706', letterSpacing: '.06em', display: 'none' }} className="show-sm">
              Non sauvegardé
            </span>
          )}
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'var(--accentS)', color: 'var(--accent)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'none' }} className="show-md">
            {coverStyle?.layout || 'classic'}
          </span>
          {orientationZone?.enabled && (
            <span
              onClick={() => setActiveTab('orientation')}
              style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,58,237,.1)', color: '#7C3AED', letterSpacing: '.06em', cursor: 'pointer', display: 'none' }} className="show-md"
              title="Zone d'orientation active"
            >
              📑 TdM
            </span>
          )}
        </div>

        {/* Centre — controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={undo} disabled={!canUndo}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: canUndo ? 'pointer' : 'not-allowed', background: 'transparent', display: 'none', alignItems: 'center', justifyContent: 'center', color: canUndo ? 'var(--text3)' : 'var(--border2)' }} className="show-md">
            <RotateCcw size={13} />
          </button>
          <button onClick={redo} disabled={!canRedo}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: canRedo ? 'pointer' : 'not-allowed', background: 'transparent', display: 'none', alignItems: 'center', justifyContent: 'center', color: canRedo ? 'var(--text3)' : 'var(--border2)' }} className="show-md">
            <RotateCw size={13} />
          </button>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 6px', display: 'none' }} className="show-md" />

          <button onClick={handleZoomOut}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg2)', display: 'none', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }} className="show-md">
            <ZoomOut size={12} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', minWidth: 40, textAlign: 'center', display: 'none' }} className="show-md">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg2)', display: 'none', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }} className="show-md">
            <ZoomIn size={12} />
          </button>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 6px', display: 'none' }} className="show-md" />

          <span style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--bg3)', display: 'none' }} className="show-md">
            {pages.length + 1 + (orientationZone?.enabled ? ozPageCount : 0)} page{pages.length + 1 > 1 ? 's' : ''}
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={onExport} style={{ display: 'none' }} className="show-sm">
            <Download size={13} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onExport} style={{ display: 'none' }} className="show-md">
            <Download size={13} /> Exporter PDF
          </Button>
        </div>
      </div>
      
      <style>{`
        .show-sm { display: none !important; }
        .show-md { display: none !important; }
        @media (max-width: 767px) { .show-sm { display: flex !important; } }
        @media (min-width: 1024px) { .show-md { display: flex !important; } }
      `}</style>

      {/* ── Canvas ── */}
      <div
        ref={viewerRef}
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'auto',
          background: 'var(--bg3)', padding: '52px 24px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        }}
      >
        {buildPageList()}

        {/* Add page button */}
        <button onClick={addPage}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
            borderRadius: 12, border: '2px dashed var(--border2)',
            background: 'transparent', cursor: 'pointer', color: 'var(--text4)',
            fontSize: 12, fontWeight: 700, transition: 'all .15s',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; el.style.background = 'var(--accentS)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border2)'; el.style.color = 'var(--text4)'; el.style.background = 'transparent' }}
        >
          <Plus size={14} /> Ajouter une page
        </button>
      </div>

      {/* ── Bottom page navigation ── */}
      {pages.length > 1 && (
        <div style={{
          height: 40, flexShrink: 0,
          borderTop: '1px solid var(--border)', background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <button onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))} disabled={currentPageIndex === 0}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPageIndex === 0 ? 'var(--border2)' : 'var(--text3)' }}>
            <ChevronLeft size={13} />
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {pages.map((_, i) => (
              <button key={i} onClick={() => setCurrentPageIndex(i)}
                style={{ width: i === currentPageIndex ? 20 : 7, height: 7, borderRadius: 10, border: 'none', cursor: 'pointer', padding: 0, background: i === currentPageIndex ? 'var(--accent)' : 'var(--border2)', transition: 'all .15s' }} />
            ))}
          </div>
          <button onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))} disabled={currentPageIndex === pages.length - 1}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPageIndex === pages.length - 1 ? 'var(--border2)' : 'var(--text3)' }}>
            <ChevronRight size={13} />
          </button>
          <span style={{ fontSize: 11, color: 'var(--text4)', marginLeft: 4 }}>
            Page {currentPageIndex + 2} / {pages.length + 1}
          </span>
        </div>
      )}
    </div>
  )
}
