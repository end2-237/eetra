'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePageLayout } from '@/contexts/PageLayoutContext'

interface Props {
  pageNumber: number   // absolute page number (cover = 1, first content = 2…)
  totalPages: number   // cover + all content pages
  accentColor: string
  /** running section title from hierarchy, optional */
  currentSection?: string
}

export function PageHeader({ pageNumber, totalPages, accentColor, currentSection }: Props) {
  const { title, confidentiality } = useDocument()
  const { profile } = useProfile()
  const { layout } = usePageLayout()
  const h = layout.header

  if (!h.show) return null

  const logo = profile.logoDataUrl
  const fontTitle = 'Bricolage Grotesque, sans-serif'

  // ── Left cell ──────────────────────────────────────────────────────────────
  const Left = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
      {h.showLogo && logo && (
        <img
          src={logo}
          alt=""
          style={{ height: h.height - 20, maxWidth: 80, objectFit: 'contain', flexShrink: 0 }}
        />
      )}
      {h.showCompanyName && profile.name && (
        <span style={{
          fontFamily: fontTitle, fontWeight: 800, fontSize: 9,
          color: '#555', letterSpacing: '.06em', textTransform: 'uppercase',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {profile.name}
        </span>
      )}
    </div>
  )

  // ── Centre cell ────────────────────────────────────────────────────────────
  const Centre = () => {
    const text = layout.hierarchy.showOutlineInHeader && currentSection
      ? currentSection
      : h.showDocTitle && title
        ? title
        : null

    return text ? (
      <div style={{
        flex: 2, textAlign: 'center',
        fontSize: 8, fontWeight: 600, color: '#aaa',
        letterSpacing: '.08em', overflow: 'hidden',
        whiteSpace: 'nowrap', textOverflow: 'ellipsis', padding: '0 16px',
      }}>
        {text}
      </div>
    ) : <div style={{ flex: 2 }} />
  }

  // ── Right cell ─────────────────────────────────────────────────────────────
  const Right = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', flex: 1 }}>
      {h.showConfidentiality && confidentiality && (
        <span style={{
          fontSize: 7, fontWeight: 800, letterSpacing: '.18em',
          padding: '2px 6px', border: `1px solid ${accentColor}40`,
          color: accentColor, borderRadius: 3, textTransform: 'uppercase', flexShrink: 0,
        }}>
          {confidentiality}
        </span>
      )}
    </div>
  )

  return (
    <div
      className="pdf-header"
      style={{
        height: h.height,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        gap: 8,
        position: 'relative',
      }}
    >
      {/* Layout: split (left + centre + right) or centred */}
      {h.align === 'split' || h.align === 'left' ? (
        <>
          <Left />
          <Centre />
          <Right />
        </>
      ) : (
        // centre — everything centred
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          {h.showLogo && logo && (
            <img src={logo} alt="" style={{ height: h.height - 20, maxWidth: 60, objectFit: 'contain' }} />
          )}
          {h.showCompanyName && profile.name && (
            <span style={{ fontFamily: fontTitle, fontWeight: 800, fontSize: 9, color: '#555', textTransform: 'uppercase' }}>
              {profile.name}
            </span>
          )}
          {h.showDocTitle && title && (
            <span style={{ fontSize: 8, color: '#aaa', letterSpacing: '.08em' }}>— {title}</span>
          )}
        </div>
      )}

      {/* Separator line */}
      {h.showSeparator && (
        <div style={{
          position: 'absolute', bottom: 0, left: 40, right: 40,
          height: 1, background: `${accentColor}30`,
        }} />
      )}
    </div>
  )
}