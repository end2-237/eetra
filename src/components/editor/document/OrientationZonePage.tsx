'use client'

import { useMemo } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePageLayout } from '@/contexts/PageLayoutContext'
import { PageHeader } from '@/components/editor/document/PageHeader'
import { PageFooter } from '@/components/editor/document/PageFooter'
import { WatermarkOverlay } from '@/components/editor/document/WatermarkOverlay'
import type { OrientationZoneConfig, TOCEntry } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function romanize(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let res = '', num = n
  for (let i = 0; i < vals.length; i++) while (num >= vals[i]) { res += syms[i]; num -= vals[i] }
  return res
}

function formatTOCNumber(n: number, style: 'numeric'|'roman'|'alpha'): string {
  if (style === 'roman') return romanize(n) + '.'
  if (style === 'alpha') return String.fromCharCode(64 + n) + '.'
  return n + '.'
}

// ── Border overlay (same as ContentPage) ─────────────────────────────────────

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

// ── Extract TOC entries from pages ────────────────────────────────────────────

export function extractTOCEntries(
  pages: any[],
  levels: number[],
  numberStyle: 'numeric'|'roman'|'alpha',
  absolutePageOffset: number
): TOCEntry[] {
  const entries: TOCEntry[] = []
  const counters = { h1: 0, h2: 0, h3: 0, h4: 0, section: 0 }

  pages.forEach((page, pageIdx) => {
    const absolutePage = absolutePageOffset + pageIdx
    ;(page.blocks || []).forEach((block: any) => {
      const type = block.type
      if (!['h1','h2','h3','h4','section'].includes(type)) return

      let level = 0
      let label = ''
      let number = ''

      if (type === 'section' && levels.includes(1)) {
        counters.section++; counters.h2 = 0; counters.h3 = 0; counters.h4 = 0
        level = 1
        number = formatTOCNumber(counters.section, numberStyle)
        label = block.content?.replace(/^SECTION\s*\d+\s*\/\/\s*/i, '').trim() || 'Section'
      } else if (type === 'h1' && levels.includes(1)) {
        counters.h1++; counters.h2 = 0; counters.h3 = 0; counters.h4 = 0
        level = 1
        number = formatTOCNumber(counters.h1, numberStyle)
        label = block.content || 'Titre 1'
      } else if (type === 'h2' && levels.includes(2)) {
        counters.h2++; counters.h3 = 0; counters.h4 = 0
        level = 2
        const p1 = counters.h1 || counters.section
        number = numberStyle === 'numeric'
          ? `${p1}.${counters.h2}`
          : formatTOCNumber(counters.h2, numberStyle)
        label = block.content || 'Titre 2'
      } else if (type === 'h3' && levels.includes(3)) {
        counters.h3++; counters.h4 = 0
        level = 3
        const p1 = counters.h1 || counters.section
        number = numberStyle === 'numeric'
          ? `${p1}.${counters.h2}.${counters.h3}`
          : formatTOCNumber(counters.h3, numberStyle)
        label = block.content || 'Titre 3'
      } else if (type === 'h4' && levels.includes(4)) {
        counters.h4++
        level = 4
        const p1 = counters.h1 || counters.section
        number = numberStyle === 'numeric'
          ? `${p1}.${counters.h2}.${counters.h3}.${counters.h4}`
          : formatTOCNumber(counters.h4, numberStyle)
        label = block.content || 'Titre 4'
      } else {
        return
      }

      entries.push({ level, number, label, page: absolutePage })
    })
  })

  return entries
}

export function extractTableList(pages: any[], absolutePageOffset: number) {
  const list: { index: number; caption: string; page: number }[] = []
  let idx = 0
  pages.forEach((page, pi) => {
    ;(page.blocks || []).forEach((block: any) => {
      if (block.type === 'table') {
        idx++
        list.push({ index: idx, caption: block.caption || `Tableau ${idx}`, page: absolutePageOffset + pi })
      }
    })
  })
  return list
}

export function extractIllustrationList(pages: any[], absolutePageOffset: number) {
  const list: { index: number; caption: string; page: number }[] = []
  let idx = 0
  pages.forEach((page, pi) => {
    ;(page.blocks || []).forEach((block: any) => {
      if (block.type === 'image') {
        const caption = block.imageData?.caption || block.content || ''
        if (caption) {
          idx++
          list.push({ index: idx, caption, page: absolutePageOffset + pi })
        }
      }
    })
  })
  return list
}

// ── TOC Line ─────────────────────────────────────────────────────────────────

function TOCLine({ entry, accent, showPageNum }: { entry: TOCEntry; accent: string; showPageNum: boolean }) {
  const indent = (entry.level - 1) * 18
  const sizes: Record<number,string> = { 1:'13px', 2:'12px', 3:'11px', 4:'11px' }
  const weights: Record<number,string> = { 1:'800', 2:'700', 3:'600', 4:'500' }
  const isTop = entry.level === 1

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 4,
      paddingLeft: indent,
      marginBottom: entry.level === 1 ? 6 : 3,
      marginTop: isTop ? 8 : 0,
    }}>
      <span style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: entry.level <= 2 ? '10px' : '9px',
        fontWeight: 700,
        color: isTop ? accent : '#888',
        minWidth: 32,
        flexShrink: 0,
        paddingBottom: '1px',
      }}>
        {entry.number}
      </span>
      <span style={{
        fontSize: sizes[entry.level] || '11px',
        fontWeight: weights[entry.level] || '500',
        color: isTop ? '#0D1117' : '#444',
        flex: 1,
        lineHeight: 1.3,
        letterSpacing: isTop ? '.01em' : 'normal',
        textTransform: isTop ? 'uppercase' : 'none',
      }}>
        {entry.label}
      </span>
      <span style={{
        flex: '0 1 auto',
        minWidth: 24,
        maxWidth: 80,
        borderBottom: `1px dotted ${isTop ? '#999' : '#ccc'}`,
        marginBottom: '3px',
        marginLeft: 4,
        marginRight: 4,
      }} />
      {showPageNum && (
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '10px',
          fontWeight: 600,
          color: isTop ? accent : '#888',
          flexShrink: 0,
          paddingBottom: '1px',
        }}>
          {entry.page}
        </span>
      )}
    </div>
  )
}

function ListRow({ index, caption, page, accent, showPageNum }: {
  index: number; caption: string; page: number; accent: string; showPageNum: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: accent, fontWeight: 700, minWidth: 24, flexShrink: 0, paddingBottom: '1px' }}>
        {index}
      </span>
      <span style={{ fontSize: '11px', color: '#444', flex: 1, lineHeight: 1.3 }}>{caption}</span>
      <span style={{ flex: '0 1 auto', minWidth: 24, maxWidth: 80, borderBottom: '1px dotted #ccc', marginBottom: '3px', marginLeft: 4, marginRight: 4 }} />
      {showPageNum && (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#888', flexShrink: 0, paddingBottom: '1px' }}>
          {page}
        </span>
      )}
    </div>
  )
}

// ── A4 Page Wrapper — FIX: now includes CoverBorderOverlay ───────────────────

const A4_H = 1123
const PAD_V = 28

interface OZPageProps {
  config: OrientationZoneConfig
  pageNumber: number
  totalPages: number
  children: React.ReactNode
}

function OZPageWrapper({ config, pageNumber, totalPages, children }: OZPageProps) {
  const { profile } = useProfile()
  const { coverStyle } = useDocument()
  const { layout } = usePageLayout()
  const accentColor = profile.color || '#1B4FD8'
  const headerH = layout.header.show ? layout.header.height : 0
  const footerH = layout.footer.show ? layout.footer.height : 0

  // FIX: get page border config from coverStyle (same source as ContentPage)
  const pageConfig = (coverStyle as any)?.pageConfig || {}

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <WatermarkOverlay />

      {/* FIX: Apply the same border overlay as content pages */}
      <CoverBorderOverlay config={pageConfig} />

      <div style={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', background: accentColor, opacity: .18, zIndex: 1 }} />
      <PageHeader pageNumber={pageNumber} totalPages={totalPages} accentColor={accentColor} />
      <div style={{
        flex: 1, overflow: 'hidden',
        padding: `${PAD_V / 2}px 40px`,
        zIndex: 2, maxHeight: A4_H - headerH - footerH - PAD_V * 2 - 20,
      }}>
        {children}
      </div>
      <PageFooter pageNumber={pageNumber} totalPages={totalPages} accentColor={accentColor} />
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

interface OrientationZonePageProps {
  config: OrientationZoneConfig
  pageIndex: number
  absolutePageNum: number
  totalAbsolutePages: number
  tocEntries: TOCEntry[]
  tableList: { index: number; caption: string; page: number }[]
  illustrationList: { index: number; caption: string; page: number }[]
}

export function OrientationZonePage({
  config, pageIndex, absolutePageNum, totalAbsolutePages,
  tocEntries, tableList, illustrationList,
}: OrientationZonePageProps) {
  const { profile } = useProfile()
  const accent = profile.color || '#1B4FD8'

  const ITEMS_PER_PAGE = 26

  const tocPageCount = config.showTOC
    ? Math.max(1, Math.ceil(tocEntries.length / ITEMS_PER_PAGE))
    : 0

  let sectionType: 'toc' | 'tables' | 'illustrations' | 'empty' = 'empty'
  let tocChunkIndex = 0

  if (pageIndex < tocPageCount) {
    sectionType = 'toc'
    tocChunkIndex = pageIndex
  } else if (config.showTableList && tableList.length > 0 && pageIndex === tocPageCount) {
    sectionType = 'tables'
  } else if (
    config.showIllustrationList && illustrationList.length > 0 &&
    pageIndex === tocPageCount + (config.showTableList && tableList.length > 0 ? 1 : 0)
  ) {
    sectionType = 'illustrations'
  } else if (!config.showTOC && config.showTableList && tableList.length > 0 && pageIndex === 0) {
    sectionType = 'tables'
  } else if (!config.showTOC && config.showIllustrationList && illustrationList.length > 0) {
    const tablesPage = config.showTableList && tableList.length > 0 ? 1 : 0
    if (pageIndex === tablesPage) sectionType = 'illustrations'
  }

  const tocChunk = tocEntries.slice(tocChunkIndex * ITEMS_PER_PAGE, (tocChunkIndex + 1) * ITEMS_PER_PAGE)

  const renderContent = () => {
    if (sectionType === 'toc') {
      return (
        <>
          {tocChunkIndex === 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 6, height: 24, background: accent, borderRadius: 2 }} />
                <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: 22, fontWeight: 900, letterSpacing: '-.03em', color: '#0D1117', margin: 0 }}>
                  {config.tocTitle || 'Table des Matières'}
                </h2>
              </div>
              <div style={{ height: 2, background: accent, marginTop: 6, marginLeft: 16, opacity: .18 }} />
            </div>
          )}
          {tocChunkIndex > 0 && (
            <div style={{ marginBottom: 12, fontSize: 10, color: 'var(--text4)', fontWeight: 600 }}>
              {config.tocTitle || 'Table des Matières'} — suite
            </div>
          )}
          {tocChunk.length === 0 ? (
            <div style={{ padding:'32px 20px', textAlign:'center', border:'1.5px dashed #e0e0e0', borderRadius:8, color:'#bbb' }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Aucun titre détecté</div>
              <div style={{ fontSize:11 }}>Ajoutez des blocs H1, H2, H3, Section dans vos pages.</div>
            </div>
          ) : (
            tocChunk.map((entry: TOCEntry, i: number) => (
              <TOCLine key={i} entry={entry} accent={accent} showPageNum={config.showPageNumbers} />
            ))
          )}
        </>
      )
    }

    if (sectionType === 'tables') {
      return (
        <>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 6, height: 24, background: accent, borderRadius: 2 }} />
              <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: 22, fontWeight: 900, letterSpacing: '-.03em', color: '#0D1117', margin: 0 }}>
                {config.tableListTitle || 'Liste des Tableaux'}
              </h2>
            </div>
            <div style={{ height: 2, background: accent, marginTop: 6, marginLeft: 16, opacity: .18 }} />
          </div>
          {tableList.length === 0 ? (
            <div style={{ padding:'24px', textAlign:'center', border:'1.5px dashed #e0e0e0', borderRadius:8, color:'#bbb', fontSize:11 }}>
              Aucun tableau trouvé dans le document.
            </div>
          ) : (
            tableList.map((t: any, i: number) => (
              <ListRow key={i} index={t.index} caption={t.caption} page={t.page} accent={accent} showPageNum={config.showPageNumbers} />
            ))
          )}
        </>
      )
    }

    if (sectionType === 'illustrations') {
      return (
        <>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 6, height: 24, background: accent, borderRadius: 2 }} />
              <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: 22, fontWeight: 900, letterSpacing: '-.03em', color: '#0D1117', margin: 0 }}>
                {config.illustrationListTitle || 'Liste des Illustrations'}
              </h2>
            </div>
            <div style={{ height: 2, background: accent, marginTop: 6, marginLeft: 16, opacity: .18 }} />
          </div>
          {illustrationList.length === 0 ? (
            <div style={{ padding:'24px', textAlign:'center', border:'1.5px dashed #e0e0e0', borderRadius:8, color:'#bbb', fontSize:11 }}>
              Aucune illustration avec légende trouvée.
            </div>
          ) : (
            illustrationList.map((t: any, i: number) => (
              <ListRow key={i} index={t.index} caption={t.caption} page={t.page} accent={accent} showPageNum={config.showPageNumbers} />
            ))
          )}
        </>
      )
    }

    return (
      <div style={{ padding:'32px', textAlign:'center', color:'#bbb', fontSize:11 }}>
        Activez au moins un élément dans les paramètres de la Zone d'Orientation.
      </div>
    )
  }

  return (
    <OZPageWrapper config={config} pageNumber={absolutePageNum} totalPages={totalAbsolutePages}>
      {renderContent()}
    </OZPageWrapper>
  )
}

export function computeOZPageCount(config: OrientationZoneConfig, pages: any[]): number {
  if (!config.enabled) return 0

  const ITEMS_PER_PAGE = 26

  let tocCount = 0
  pages.forEach(page => {
    ;(page.blocks || []).forEach((block: any) => {
      const lvl = block.type === 'h1' || block.type === 'section' ? 1
                : block.type === 'h2' ? 2 : block.type === 'h3' ? 3
                : block.type === 'h4' ? 4 : 0
      if (lvl > 0 && config.tocLevels.includes(lvl)) tocCount++
    })
  })

  let tableCount = 0, illustCount = 0
  pages.forEach(page => {
    ;(page.blocks || []).forEach((block: any) => {
      if (block.type === 'table') tableCount++
      if (block.type === 'image' && (block.imageData?.caption || block.content)) illustCount++
    })
  })

  let total = 0

  if (config.showTOC) {
    total += Math.max(1, Math.ceil(tocCount / ITEMS_PER_PAGE))
  }

  if (config.showTableList) {
    total += 1
  }

  if (config.showIllustrationList) {
    total += 1
  }

  if (total === 0 && config.enabled) total = 1

  return Math.min(total, 8)
}

// Placeholder needed for scope
const tableList: any[] = []