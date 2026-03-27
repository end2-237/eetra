'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePlan } from '@/contexts/PlanContext'
import { useQR } from '@/hooks/useQR'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'
import type { CoverBlock } from '@/components/editor/cover/CoverPageEditor'

// ─────────────────────────────────────────────────────────────────────────────
// A4 dimensions — toujours rendu à cette taille dans le DOM
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_W = 794
const PAGE_H = 1123

interface Props {
  coverStyle?: CoverStyle
  zoom?: number
}

const DEFAULT_COVER: CoverStyle = {
  layout: 'classic', accentColor: '', showLogo: true, showQr: true,
  showGrid: false, backgroundStyle: 'solid', titleSize: 'lg', coverBlocks: [],
}

const TITLE_SIZES: Record<string, number> = { sm: 34, md: 44, lg: 56, xl: 70 }

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKS LAYER (custom design mode)
// ─────────────────────────────────────────────────────────────────────────────
function CoverBlocksLayer({ blocks }: { blocks: CoverBlock[] }) {
  if (!blocks?.length) return null
  return (
    <>
      {[...blocks].sort((a, b) => (a.z || 0) - (b.z || 0)).map(block => {
        const x = block.x * PAGE_W, y = block.y * PAGE_H
        const w = block.w * PAGE_W, h = block.h * PAGE_H
        let inner: React.ReactNode
        if (block.type === 'text') {
          inner = (
            <div style={{
              width: '100%', height: '100%', overflow: 'hidden',
              fontSize: block.fontSize || 16,
              fontWeight: block.fontWeight === 'black' ? 900 : block.fontWeight === 'bold' ? 700 : 400,
              fontStyle: block.fontStyle || 'normal', color: block.color || '#0D1117',
              textAlign: block.align || 'left',
              letterSpacing: block.letterSpacing ? `${block.letterSpacing}em` : 'normal',
              lineHeight: block.lineHeight || 1.35,
              fontFamily: (block as any).fontFamily || 'inherit',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{block.text || ''}</div>
          )
        } else if (block.type === 'image' || block.type === 'logo') {
          inner = block.src
            ? <img src={block.src} alt="" style={{ width: '100%', height: '100%', objectFit: block.objectFit || 'contain', display: 'block', borderRadius: block.radius }} />
            : null
        } else {
          inner = <div style={{ width: '100%', height: '100%', background: block.fill || '#1B4FD8', opacity: block.fillOpacity ?? 1, borderRadius: block.radius || 0 }} />
        }
        if (!inner) return null
        return (
          <div key={block.id} style={{
            position: 'absolute', left: x, top: y, width: w, height: h,
            opacity: block.opacity ?? 1,
            transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
            zIndex: (block.z || 1) + 10, overflow: 'hidden', boxSizing: 'border-box', pointerEvents: 'none',
          }}>
            {inner}
          </div>
        )
      })}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN ATOMS
// ─────────────────────────────────────────────────────────────────────────────

function ConfiBadge({ text, accent, light }: { text: string; accent: string; light?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px 6px 10px', borderRadius: 4,
      border: `1.5px solid ${light ? 'rgba(255,255,255,.4)' : accent}`,
      background: light ? 'rgba(255,255,255,.1)' : `${accent}14`,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: light ? 'rgba(255,255,255,.8)' : accent }} />
      <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.26em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.95)' : accent }}>
        {text}
      </span>
    </div>
  )
}

function Subtitle({ text, accent, light }: { text: string; accent: string; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 28, height: 2.5, borderRadius: 2, background: light ? 'rgba(255,255,255,.55)' : accent, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.32em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.72)' : accent }}>
        {text}
      </span>
    </div>
  )
}

function Title({ text, size, font, light }: { text: string; size: number; font: string; light?: boolean }) {
  return (
    <h1 style={{ fontFamily: `'${font}',serif`, fontSize: size, fontWeight: 900, letterSpacing: '-.035em', lineHeight: 1.06, color: light ? '#fff' : '#0A0F1E', margin: 0, wordBreak: 'break-word' }}>
      {text || 'TITRE DU DOCUMENT'}
    </h1>
  )
}

function Sep({ accent, light, mt = 24, mb = 20 }: { accent: string; light?: boolean; mt?: number; mb?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: mt, marginBottom: mb }}>
      <div style={{ width: 40, height: 3.5, borderRadius: 2, background: light ? 'rgba(255,255,255,.5)' : accent }} />
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: light ? 'rgba(255,255,255,.25)' : `${accent}55` }} />
      <div style={{ width: 20, height: 1.5, borderRadius: 1, background: light ? 'rgba(255,255,255,.18)' : `${accent}30` }} />
    </div>
  )
}

function Field({ label, value, accent, light, mono, xl }: { label: string; value: string; accent: string; light?: boolean; mono?: boolean; xl?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.42)' : '#a8b4c4', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: xl ? 16 : 13, fontWeight: 700, color: light ? '#fff' : '#0A0F1E', letterSpacing: mono ? '.04em' : '-.01em', fontFamily: mono ? 'monospace' : 'inherit', lineHeight: 1.3 }}>
        {value}
      </div>
    </div>
  )
}

function RefField({ value, accent, light }: { value: string; accent: string; light?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.42)' : '#a8b4c4', marginBottom: 5 }}>Référence</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: light ? 'rgba(255,255,255,.9)' : accent, letterSpacing: '.05em', fontFamily: 'monospace' }}>{value}</div>
    </div>
  )
}

function Brand({ profile, fontTitle, accent, light }: any) {
  if (!profile.name && !profile.logoDataUrl) return null
  return profile.logoDataUrl ? (
    <img src={profile.logoDataUrl} alt="logo" style={{ height: 46, maxWidth: 155, objectFit: 'contain', filter: light ? 'brightness(0) invert(1)' : 'none' }} />
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: light ? 'rgba(255,255,255,.2)' : accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: light ? 'none' : `0 3px 16px ${accent}40` }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 19, fontFamily: `'${fontTitle}',sans-serif` }}>{(profile.name || 'E').charAt(0)}</span>
      </div>
      <div>
        <div style={{ fontFamily: `'${fontTitle}',sans-serif`, fontWeight: 900, fontSize: 16, color: light ? '#fff' : '#0A0F1E', letterSpacing: '-.02em' }}>{profile.name}</div>
        {profile.tagline && <div style={{ fontSize: 9.5, color: light ? 'rgba(255,255,255,.5)' : '#9aa8b8', marginTop: 1.5 }}>{profile.tagline}</div>}
      </div>
    </div>
  )
}

function Footer({ showQr, qrDataUrl, showWatermark, light }: { showQr: boolean; qrDataUrl: string | null; showWatermark: boolean; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        {showWatermark && <span style={{ fontSize: 7, letterSpacing: '.12em', color: light ? 'rgba(255,255,255,.2)' : '#d0d8e4' }}>Généré par EETRA</span>}
      </div>
      {showQr && qrDataUrl && (
        <div style={{ padding: 5, borderRadius: 7, background: light ? 'rgba(255,255,255,.14)' : '#fff', border: light ? 'none' : '1px solid #edf2f7' }}>
          <img src={qrDataUrl} alt="QR" style={{ width: 40, height: 40, display: 'block' }} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WRAPPER — clips visually to dW×dH, inner div always PAGE_W×PAGE_H
// ─────────────────────────────────────────────────────────────────────────────
function CoverWrapper({ zoom, children }: { zoom: number; children: React.ReactNode }) {
  const dW = PAGE_W * zoom
  const dH = PAGE_H * zoom
  if (zoom === 1) return <>{children}</>
  return (
    <div style={{ width: dW, height: dH, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: PAGE_W, height: PAGE_H,
        position: 'absolute', top: 0, left: 0,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE LAYOUT — compact single-page style for factures/devis
// ─────────────────────────────────────────────────────────────────────────────
function InvoiceLayout({ cv, profile, fontTitle, fontBody, accent, titleSize, showWatermark, qrDataUrl, title, subtitle, docRef, destination, confidentiality, date }: any) {
  return (
    <div id="eetra-cover-static" style={{ width: PAGE_W, height: PAGE_H, position: 'relative', overflow: 'hidden', boxSizing: 'border-box', fontFamily: `'${fontBody}',sans-serif`, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top colored bar */}
      <div style={{ background: accent, padding: '28px 52px 24px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {/* Company info */}
          <div>
            <Brand profile={profile} fontTitle={fontTitle} accent={accent} light />
            {profile.address && (
              <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
                {profile.address}{profile.city ? ` — ${profile.city}` : ''}
                {profile.email && <><br />{profile.email}</>}
                {profile.web && <><br />{profile.web}</>}
              </div>
            )}
          </div>
          {/* Document type */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: titleSize * 0.55, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>
              {title || 'FACTURE'}
            </div>
            {docRef && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: '.05em', fontFamily: 'monospace' }}>
                N° {docRef}
              </div>
            )}
            {confidentiality && confidentiality !== 'CONFIDENTIEL' && (
              <div style={{ marginTop: 6 }}>
                <ConfiBadge text={confidentiality} accent={accent} light />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div style={{ background: '#F8F9FB', borderBottom: '1px solid #E8ECF0', padding: '18px 52px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 5 }}>Date</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0F1E' }}>{date}</div>
        </div>
        {docRef && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 5 }}>Référence</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: accent, fontFamily: 'monospace' }}>{docRef}</div>
          </div>
        )}
        {destination && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 5 }}>Facturé à</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0F1E', lineHeight: 1.4 }}>{destination}</div>
          </div>
        )}
      </div>

      {/* Content area — large empty zone for the invoice table blocks */}
      <div style={{ flex: 1, padding: '32px 52px 24px', display: 'flex', flexDirection: 'column' }}>
        {subtitle && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6 }}>{subtitle}</div>
          </div>
        )}
        {/* Placeholder lines to indicate where the table goes */}
        <div style={{ flex: 1, border: `1.5px dashed ${accent}30`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', opacity: .25 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: '.1em', textTransform: 'uppercase' }}>Tableau de facturation</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>Ajoutez un bloc Tableau depuis l'éditeur</div>
          </div>
        </div>
      </div>

      {/* Bottom totals area */}
      <div style={{ padding: '16px 52px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
          {[['Sous-total HT', ''], ['TVA (19.25%)', ''], ['Total TTC', '']].map(([label], i) => (
            <div key={label} style={{
              minWidth: 160, padding: '10px 14px',
              background: i === 2 ? accent : '#F8F9FB',
              borderRadius: i === 2 ? 8 : 6,
              border: i === 2 ? 'none' : '1px solid #E8ECF0',
            }}>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: i === 2 ? 'rgba(255,255,255,.7)' : '#a8b4c4', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: i === 2 ? '#fff' : '#0A0F1E', fontFamily: 'monospace' }}>— FCFA</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 52px 16px', borderTop: '1px solid #F0F0F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {showWatermark && <span style={{ fontSize: 7, color: '#d0d8e4' }}>Généré par EETRA</span>}
        </div>
        {cv.showQr && qrDataUrl && (
          <div style={{ padding: 5, borderRadius: 7, background: '#fff', border: '1px solid #edf2f7' }}>
            <img src={qrDataUrl} alt="QR" style={{ width: 36, height: 36, display: 'block' }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC LAYOUT — for rapports de stage, mémoires, thèses, exposés
// ─────────────────────────────────────────────────────────────────────────────
function AcademicLayout({ cv, profile, fontTitle, fontBody, accent, titleSize, showWatermark, qrDataUrl, title, subtitle, docRef, destination, confidentiality, date }: any) {
  return (
    <div id="eetra-cover-static" style={{ width: PAGE_W, height: PAGE_H, position: 'relative', overflow: 'hidden', boxSizing: 'border-box', fontFamily: `'${fontBody}',sans-serif`, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top institutional bar */}
      <div style={{ background: accent, padding: '20px 56px', flexShrink: 0, textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)', marginBottom: 4 }}>
          {profile.name || 'UNIVERSITÉ / INSTITUTION'}
        </div>
        {profile.sector && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', letterSpacing: '.1em' }}>{profile.sector}</div>
        )}
        {profile.tagline && (
          <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,.45)', marginTop: 3, fontStyle: 'italic' }}>{profile.tagline}</div>
        )}
      </div>

      {/* Logo zone */}
      {profile.logoDataUrl && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 0', flexShrink: 0 }}>
          <img src={profile.logoDataUrl} alt="logo" style={{ height: 64, maxWidth: 200, objectFit: 'contain' }} />
        </div>
      )}

      {/* Document type label */}
      <div style={{ textAlign: 'center', padding: '28px 56px 0', flexShrink: 0 }}>
        {subtitle && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 4, border: `1.5px solid ${accent}`, background: `${accent}0E`, marginBottom: 18 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.3em', textTransform: 'uppercase', color: accent }}>{subtitle}</span>
          </div>
        )}
      </div>

      {/* Main title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 3, background: accent, borderRadius: 2, margin: '0 auto 20px' }} />
        <h1 style={{ fontFamily: `'${fontTitle}',serif`, fontSize: titleSize, fontWeight: 900, letterSpacing: '-.025em', lineHeight: 1.1, color: '#0A0F1E', margin: 0, wordBreak: 'break-word', textTransform: 'uppercase' }}>
          {title || 'TITRE DU DOCUMENT'}
        </h1>
        <div style={{ width: 48, height: 3, background: accent, borderRadius: 2, margin: '20px auto 0' }} />
      </div>

      {/* Author / metadata */}
      <div style={{ padding: '24px 72px 0', flexShrink: 0, textAlign: 'center' }}>
        {destination && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 5 }}>Présenté par</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0F1E' }}>{destination}</div>
          </div>
        )}
        {docRef && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 5 }}>Filière / Spécialité</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: accent }}>{docRef}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 56px 28px', flexShrink: 0, borderTop: '1px solid #F0F0F0', marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: accent, marginBottom: 4 }}>{date}</div>
            {showWatermark && <span style={{ fontSize: 7, color: '#d0d8e4' }}>Généré par EETRA</span>}
          </div>
          {cv.showQr && qrDataUrl && (
            <div style={{ padding: 5, borderRadius: 7, background: '#fff', border: '1px solid #edf2f7' }}>
              <img src={qrDataUrl} alt="QR" style={{ width: 38, height: 38, display: 'block' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PV / MINUTES LAYOUT — procès-verbaux, comptes rendus
// ─────────────────────────────────────────────────────────────────────────────
function PVLayout({ cv, profile, fontTitle, fontBody, accent, titleSize, showWatermark, qrDataUrl, title, subtitle, docRef, destination, confidentiality, date }: any) {
  return (
    <div id="eetra-cover-static" style={{ width: PAGE_W, height: PAGE_H, position: 'relative', overflow: 'hidden', boxSizing: 'border-box', fontFamily: `'${fontBody}',sans-serif`, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top thin accent bar */}
      <div style={{ height: 6, background: accent, flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: '32px 56px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
        <Brand profile={profile} fontTitle={fontTitle} accent={accent} />
        {confidentiality && <ConfiBadge text={confidentiality} accent={accent} />}
      </div>

      {/* Central title zone */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', textAlign: 'center' }}>
        {/* Document type pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 4, background: accent, marginBottom: 28 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.28em', textTransform: 'uppercase', color: '#fff' }}>
            {subtitle || 'PROCÈS-VERBAL'}
          </span>
        </div>

        <h1 style={{ fontFamily: `'${fontTitle}',serif`, fontSize: titleSize, fontWeight: 900, letterSpacing: '-.025em', lineHeight: 1.1, color: '#0A0F1E', margin: 0, wordBreak: 'break-word' }}>
          {title || 'TITRE DE LA RÉUNION'}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 28 }}>
          <div style={{ height: 1, width: 40, background: `${accent}40` }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent }} />
          <div style={{ height: 1, width: 40, background: `${accent}40` }} />
        </div>

        {docRef && (
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, fontFamily: 'monospace', letterSpacing: '.08em', marginBottom: 16 }}>
            N° {docRef}
          </div>
        )}
      </div>

      {/* Info table */}
      <div style={{ padding: '0 56px 32px', flexShrink: 0 }}>
        <div style={{ border: '1px solid #E8ECF0', borderRadius: 10, overflow: 'hidden' }}>
          {[
            ['Date et heure', date],
            ['Lieu', destination || profile.city || '—'],
            ...(profile.address ? [['Adresse', profile.address]] : []),
          ].map(([label, value], i) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', background: i % 2 ? '#F8F9FB' : '#fff' }}>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #E8ECF0' }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#a8b4c4' }}>{label}</span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0A0F1E' }}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 56px 20px', borderTop: '1px solid #F0F0F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {showWatermark && <span style={{ fontSize: 7, color: '#d0d8e4' }}>Généré par EETRA</span>}
        {!showWatermark && <span />}
        {cv.showQr && qrDataUrl && (
          <div style={{ padding: 5, borderRadius: 7, background: '#fff', border: '1px solid #edf2f7' }}>
            <img src={qrDataUrl} alt="QR" style={{ width: 38, height: 38, display: 'block' }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COVER PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function CoverPage({ coverStyle, zoom = 1 }: Props) {
  const { title, subtitle, ref: docRef, destination, confidentiality, docStyle, selectedTemplate } = useDocument()
  const { profile } = useProfile()
  const { planId } = usePlan()
  const qrDataUrl = useQR({ docId: 'EETRA-DOC', title, entityName: profile.name })

  const cv = { ...DEFAULT_COVER, ...coverStyle }
  const accent = cv.accentColor || profile.color || docStyle.accentColor || '#1B4FD8'
  const titleSize = TITLE_SIZES[cv.titleSize as string] ?? 56
  const fontTitle = docStyle.fontTitle || 'Bricolage Grotesque'
  const fontBody = docStyle.fontBody || 'Bricolage Grotesque'
  const showWatermark = profile.watermark || planId === 'starter'
  const blocks = cv.coverBlocks || []
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  const sharedProps = { cv, profile, fontTitle, fontBody, accent, titleSize, showWatermark, qrDataUrl, title, subtitle, docRef, destination, confidentiality, date }

  const pageBase: React.CSSProperties = {
    width: PAGE_W,
    height: PAGE_H,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: `'${fontBody}',sans-serif`,
  }

  // ── MODE CUSTOM BLOCKS ────────────────────────────────────────────────────
  if (blocks.length > 0) {
    const pc = (cv as any).pageConfig || {}
    const bg = pc.bgType === 'gradient'
      ? `linear-gradient(${pc.bgGradAngle ?? 135}deg,${pc.bgColor ?? '#fff'},${pc.bgColor2 ?? '#f0f4ff'})`
      : (pc.bgColor ?? '#ffffff')
    return (
      <CoverWrapper zoom={zoom}>
        <div id="eetra-cover-static" style={{ ...pageBase, background: bg }}>
          <CoverBlocksLayer blocks={blocks} />
        </div>
      </CoverWrapper>
    )
  }

  // ── SPECIAL LAYOUTS based on selectedTemplate or explicit layout key ───────
  // Invoice templates: 'facture', 'facture-proforma', 'devis'
  const isInvoice = selectedTemplate && ['facture', 'facture-proforma', 'devis'].includes(selectedTemplate)
  if (isInvoice || cv.layout === 'invoice') {
    return (
      <CoverWrapper zoom={zoom}>
        <InvoiceLayout {...sharedProps} />
      </CoverWrapper>
    )
  }

  // Academic templates
  const isAcademic = selectedTemplate && [
    'rapport-stage-licence', 'rapport-stage-master', 'rapport-td',
    'memoire-master', 'these-doctorat', 'expose-licence', 'expose-master',
  ].includes(selectedTemplate)
  if (isAcademic || cv.layout === 'academic') {
    return (
      <CoverWrapper zoom={zoom}>
        <AcademicLayout {...sharedProps} />
      </CoverWrapper>
    )
  }

  // PV / Minutes templates
  const isPV = selectedTemplate && [
    'pv-conseil', 'pv-ag', 'pv-reunion', 'compte-rendu', 'compte-rendu-visite', 'memo',
  ].includes(selectedTemplate)
  if (isPV || cv.layout === 'pv') {
    return (
      <CoverWrapper zoom={zoom}>
        <PVLayout {...sharedProps} />
      </CoverWrapper>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CLASSIC
  // ─────────────────────────────────────────────────────────────────────────
  if (cv.layout === 'classic') return (
    <CoverWrapper zoom={zoom}>
      <div id="eetra-cover-static" style={{ ...pageBase, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 6, height: '100%', background: accent }} />
        <div style={{ position: 'absolute', left: 6, top: 0, width: 1.5, height: '100%', background: `${accent}22` }} />
        <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: `${accent}07`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${accent}05`, pointerEvents: 'none' }} />

        <div style={{ padding: '44px 56px 0 68px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          {cv.showLogo && <Brand profile={profile} fontTitle={fontTitle} accent={accent} />}
          {confidentiality && <ConfiBadge text={confidentiality} accent={accent} />}
        </div>

        <div style={{ flex: 1, padding: '0 56px 0 68px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: 580 }}>
            {subtitle && <Subtitle text={subtitle} accent={accent} />}
            <Title text={title} size={titleSize} font={fontTitle} />
            <Sep accent={accent} />
            {(docRef || destination) && (
              <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
                {docRef && <RefField value={docRef} accent={accent} />}
                {destination && <Field label="Destinataire" value={destination} accent={accent} xl />}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 56px 36px 68px', flexShrink: 0 }}>
          <div style={{ height: 1, background: `linear-gradient(90deg,${accent}44 0%,transparent 70%)`, marginBottom: 20 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Field label="Date d'émission" value={date} accent={accent} />
            <Footer showQr={cv.showQr} qrDataUrl={qrDataUrl} showWatermark={showWatermark} />
          </div>
        </div>
      </div>
    </CoverWrapper>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // BOLD
  // ─────────────────────────────────────────────────────────────────────────
  if (cv.layout === 'bold') return (
    <CoverWrapper zoom={zoom}>
      <div id="eetra-cover-static" style={{ ...pageBase, background: accent, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', right: -90, top: -90, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 50, bottom: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: -60, bottom: 240, width: 170, height: 170, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, bottom: 120, right: 0, height: 1, background: 'rgba(255,255,255,.1)', pointerEvents: 'none' }} />

        <div style={{ padding: '46px 56px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0, position: 'relative' }}>
          {cv.showLogo && <Brand profile={profile} fontTitle={fontTitle} accent={accent} light />}
          {confidentiality && <ConfiBadge text={confidentiality} accent={accent} light />}
        </div>

        <div style={{ flex: 1, padding: '0 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ maxWidth: 590 }}>
            {subtitle && <Subtitle text={subtitle} accent={accent} light />}
            <Title text={title} size={titleSize} font={fontTitle} light />
            <Sep accent={accent} light />
            {(docRef || destination) && (
              <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
                {docRef && (
                  <div>
                    <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.42)', marginBottom: 5 }}>Référence</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.95)', letterSpacing: '.05em', fontFamily: 'monospace' }}>{docRef}</div>
                  </div>
                )}
                {destination && (
                  <div>
                    <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.42)', marginBottom: 5 }}>Destinataire</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{destination}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 56px 36px', flexShrink: 0, position: 'relative' }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,.14)', marginBottom: 20 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.38)', marginBottom: 5 }}>Date</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{date}</div>
            </div>
            <Footer showQr={cv.showQr} qrDataUrl={qrDataUrl} showWatermark={showWatermark} light />
          </div>
        </div>
      </div>
    </CoverWrapper>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // MINIMAL
  // ─────────────────────────────────────────────────────────────────────────
  if (cv.layout === 'minimal') return (
    <CoverWrapper zoom={zoom}>
      <div id="eetra-cover-static" style={{ ...pageBase, background: '#fafbfc', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, background: accent }} />
        <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, height: 1.5, background: `${accent}40` }} />
        <div style={{ position: 'absolute', bottom: 6.5, left: 0, right: 0, height: 1, background: `${accent}18` }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `${accent}18` }} />
        <div style={{ position: 'absolute', top: 60, right: 68, width: 8, height: 8, borderRadius: '50%', background: accent, opacity: .3 }} />
        <div style={{ position: 'absolute', top: 60, right: 84, width: 5, height: 5, borderRadius: '50%', background: accent, opacity: .15 }} />

        <div style={{ flex: 1, padding: '68px 72px 56px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          {cv.showLogo && (
            <div style={{ marginBottom: 'auto' }}>
              {profile.logoDataUrl
                ? <img src={profile.logoDataUrl} alt="logo" style={{ height: 30, maxWidth: 120, objectFit: 'contain', opacity: .6 }} />
                : profile.name && <span style={{ fontFamily: `'${fontBody}',sans-serif`, fontWeight: 700, fontSize: 11, color: '#bcc5d0', letterSpacing: '.18em', textTransform: 'uppercase' }}>{profile.name}</span>
              }
            </div>
          )}
          <div style={{ paddingBottom: 32 }}>
            {confidentiality && <div style={{ marginBottom: 24 }}><ConfiBadge text={confidentiality} accent={accent} /></div>}
            {subtitle && <Subtitle text={subtitle} accent={accent} />}
            <Title text={title} size={titleSize} font={fontTitle} />
            {(docRef || destination) && (
              <div style={{ marginTop: 32, paddingTop: 28, borderTop: `1px solid ${accent}22`, display: 'grid', gridTemplateColumns: docRef && destination ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0 40px' }}>
                {docRef && (
                  <div>
                    <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 7 }}>Référence</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: accent, letterSpacing: '.04em', fontFamily: 'monospace' }}>{docRef}</div>
                  </div>
                )}
                {destination && (
                  <div>
                    <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 7 }}>Destinataire</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0A0F1E', lineHeight: 1.25 }}>{destination}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 7 }}>Date</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
                </div>
              </div>
            )}
            {!docRef && !destination && (
              <div style={{ marginTop: 32, paddingTop: 28, borderTop: `1px solid ${accent}22` }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 7 }}>Date</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
              </div>
            )}
          </div>
          <Footer showQr={cv.showQr} qrDataUrl={qrDataUrl} showWatermark={showWatermark} />
        </div>
      </div>
    </CoverWrapper>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // SPLIT
  // ─────────────────────────────────────────────────────────────────────────
  if (cv.layout === 'split') {
    const leftW = Math.round(PAGE_W * 0.42)
    return (
      <CoverWrapper zoom={zoom}>
        <div id="eetra-cover-static" style={{ ...pageBase, display: 'flex' }}>
          <div style={{ width: leftW, background: accent, padding: '48px 38px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', right: -55, top: -55, width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: -30, bottom: 100, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
            {cv.showLogo && (
              <div style={{ marginBottom: 'auto' }}>
                <Brand profile={profile} fontTitle={fontTitle} accent={accent} light />
              </div>
            )}
            <div style={{ marginTop: cv.showLogo ? 40 : 0, position: 'relative' }}>
              {subtitle && <Subtitle text={subtitle} accent={accent} light />}
              <h1 style={{ fontFamily: `'${fontTitle}',serif`, fontSize: Math.round(titleSize * 0.76), fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.08, color: '#fff', margin: 0, wordBreak: 'break-word' }}>
                {title || 'TITRE'}
              </h1>
            </div>
            <div style={{ marginTop: 30 }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,.18)', marginBottom: 16 }} />
              <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.5)', letterSpacing: '.07em' }}>{date}</div>
              {showWatermark && <div style={{ fontSize: 7, color: 'rgba(255,255,255,.2)', letterSpacing: '.1em', marginTop: 5 }}>Généré par EETRA</div>}
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 48, bottom: 48, width: 1, background: `${accent}18` }} />
            <div style={{ flex: 1, padding: '48px 44px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 'auto', minHeight: 40 }}>
                {confidentiality && <ConfiBadge text={confidentiality} accent={accent} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {docRef && (
                  <div style={{ paddingLeft: 16, borderLeft: `3.5px solid ${accent}`, paddingBottom: 28, marginBottom: 28 }}>
                    <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 7 }}>Référence</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: accent, letterSpacing: '.04em', fontFamily: 'monospace', lineHeight: 1.2 }}>{docRef}</div>
                  </div>
                )}
                {destination && (
                  <div style={{ paddingBottom: 28, borderBottom: '1px solid #eef2f7', marginBottom: 28 }}>
                    <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 7 }}>Destinataire</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0A0F1E', lineHeight: 1.2, wordBreak: 'break-word' }}>{destination}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: '#a8b4c4', marginBottom: 7 }}>Date d'émission</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: 24 }}>
                {cv.showQr && qrDataUrl && (
                  <div style={{ padding: 6, borderRadius: 8, border: '1px solid #edf2f7' }}>
                    <img src={qrDataUrl} alt="QR" style={{ width: 42, height: 42, display: 'block' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CoverWrapper>
    )
  }

  return null
}