'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePageLayout } from '@/contexts/PageLayoutContext'

interface Props {
  pageNumber: number   // absolute page number (cover = 1)
  totalPages: number
  accentColor: string
}

function formatPageNumber(
  format: 'simple' | 'total' | 'dash',
  current: number,
  total: number
): string {
  switch (format) {
    case 'simple': return String(current)
    case 'total':  return `${current} / ${total}`
    case 'dash':   return `— ${current} —`
  }
}

export function PageFooter({ pageNumber, totalPages, accentColor }: Props) {
  const { ref: docRef } = useDocument()
  const { profile } = useProfile()
  const { layout } = usePageLayout()
  const f = layout.footer

  if (!f.show) return null

  const pageLabel = formatPageNumber(f.pageNumberFormat, pageNumber, totalPages)

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  // Build footer cells based on alignment preference
  const leftItems: string[] = []
  const rightItems: string[] = []
  const centreItems: string[] = []

  if (f.showCompanyName && profile.name)  leftItems.push(profile.name)
  if (f.showDocRef && docRef)             leftItems.push(docRef)
  if (f.showDate)                         leftItems.push(today)

  const pageNumEl = f.showPageNumber ? pageLabel : null

  const numberAlignLeft   = f.pageNumberAlign === 'left'
  const numberAlignCentre = f.pageNumberAlign === 'center'
  const numberAlignRight  = f.pageNumberAlign === 'right'

  if (pageNumEl) {
    if (numberAlignLeft)   centreItems.push('') // placeholder
    if (numberAlignCentre) centreItems.push(pageNumEl)
    if (numberAlignRight)  rightItems.push(pageNumEl)
  }

  const PageNum = () => pageNumEl ? (
    <span style={{
      fontFamily: 'DM Mono, monospace',
      fontSize: 9, color: '#aaa', fontWeight: 500, letterSpacing: '.06em',
    }}>
      {pageNumEl}
    </span>
  ) : null

  const LeftCell = () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
      {numberAlignLeft && <PageNum />}
      {leftItems.map((item, i) => (
        <span key={i} style={{ fontSize: 8, color: '#ccc', letterSpacing: '.08em' }}>
          {item}
        </span>
      ))}
    </div>
  )

  const CentreCell = () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {numberAlignCentre && <PageNum />}
    </div>
  )

  const RightCell = () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
      {profile.watermark && (
        <span style={{ fontSize: 7, color: '#ddd', letterSpacing: '.1em' }}>
          Généré par EETRA
        </span>
      )}
      {numberAlignRight && <PageNum />}
    </div>
  )

  return (
    <div
      className="pdf-footer"
      style={{
        height: f.height,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        position: 'relative',
      }}
    >
      {/* Separator line */}
      {f.showSeparator && (
        <div style={{
          position: 'absolute', top: 0, left: 40, right: 40,
          height: 1, background: '#f0f0f0',
        }} />
      )}

      <LeftCell />
      <CentreCell />
      <RightCell />
    </div>
  )
}