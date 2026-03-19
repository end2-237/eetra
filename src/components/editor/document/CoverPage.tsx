'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePlan } from '@/contexts/PlanContext'
import { useQR } from '@/hooks/useQR'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'

interface Props {
  coverStyle?: CoverStyle
}

const DEFAULT_COVER: CoverStyle = {
  layout: 'classic',
  accentColor: '',
  showLogo: true,
  showQr: true,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'lg',
}

const TITLE_SIZES = { sm: 28, md: 36, lg: 44, xl: 56 }

export function CoverPage({ coverStyle }: Props) {
  const { title, subtitle, ref: docRef, destination, confidentiality, docStyle } = useDocument()
  const { profile } = useProfile()
  const { plan, planId } = usePlan()
  const qrDataUrl = useQR({ docId: 'EETRA-DOC', title, entityName: profile.name })

  const cv = { ...DEFAULT_COVER, ...coverStyle }
  const accent = cv.accentColor || profile.color || docStyle.accentColor || '#1B4FD8'
  const titleFontSize = TITLE_SIZES[cv.titleSize]
  const fontTitle = docStyle.fontTitle || 'Bricolage Grotesque'
  const fontBody = docStyle.fontBody || 'Bricolage Grotesque'
  const showWatermark = profile.watermark || planId === 'starter'

  const infoRows = [
    docRef && { label: 'Réf.', value: docRef },
    destination && { label: 'Destinataire', value: destination },
    confidentiality && { label: 'Niveau', value: confidentiality },
    { label: 'Date', value: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
  ].filter(Boolean) as { label: string; value: string }[]

  // === CLASSIC layout ===
  if (cv.layout === 'classic') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: accent }} />
      {/* Grid overlay */}
      {cv.showGrid && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 40px)' }} />
      )}
      <div style={{ flex: 1, padding: '56px 48px 56px 56px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'auto' }}>
          {cv.showLogo && profile.logoDataUrl ? (
            <img src={profile.logoDataUrl} alt="logo" style={{ height: 48, maxWidth: 140, objectFit: 'contain' }} />
          ) : cv.showLogo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{(profile.name || 'E').charAt(0)}</span>
              </div>
              <span style={{ fontFamily: `'${fontTitle}',sans-serif`, fontWeight: 900, fontSize: 16, color: '#111' }}>
                {profile.name || 'EETRA'}
              </span>
            </div>
          ) : null}
          {confidentiality && (
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.2em', padding: '4px 10px', border: `1px solid ${accent}`, color: accent, borderRadius: 4 }}>
              {confidentiality}
            </div>
          )}
        </div>

        {/* Main title */}
        <div style={{ marginTop: 'auto', paddingTop: 64 }}>
          {subtitle && (
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: accent, marginBottom: 16 }}>
              {subtitle}
            </div>
          )}
          <h1 style={{ fontFamily: `'${fontTitle}',sans-serif`, fontSize: titleFontSize, fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.1, color: '#0D1117', margin: '0 0 24px' }}>
            {title || 'TITRE DU DOCUMENT'}
          </h1>
          <div style={{ width: 40, height: 3, background: accent, borderRadius: 2, marginBottom: 32 }} />
        </div>

        {/* Info grid */}
        {infoRows.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px 24px', padding: '20px 24px', background: '#F8F9FB', borderRadius: 10, marginTop: 16 }}>
            {infoRows.map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#bbb', marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: `'${fontBody}',sans-serif`, fontSize: 11, fontWeight: 600, color: '#333' }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 48px 16px 56px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: `'${fontBody}',sans-serif`, fontSize: 10, fontWeight: 700, color: '#555' }}>{profile.name}</div>
          {profile.tagline && <div style={{ fontSize: 8, color: '#aaa', letterSpacing: '.08em', marginTop: 1 }}>{profile.tagline}</div>}
          {showWatermark && <div style={{ fontSize: 7, color: '#ccc', marginTop: 2, letterSpacing: '.1em' }}>Généré par EETRA</div>}
        </div>
        {cv.showQr && qrDataUrl && (
          <img src={qrDataUrl} alt="QR" style={{ width: 40, height: 40 }} />
        )}
      </div>
    </div>
  )

  // === BOLD layout ===
  if (cv.layout === 'bold') return (
    <div style={{ width: '100%', height: '100%', background: accent, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {cv.showGrid && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />
      )}
      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
      <div style={{ position: 'absolute', right: 40, bottom: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

      <div style={{ flex: 1, padding: '56px 48px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Logo */}
        {cv.showLogo && profile.logoDataUrl ? (
          <img src={profile.logoDataUrl} alt="logo" style={{ height: 44, maxWidth: 130, objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: 'auto' }} />
        ) : cv.showLogo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'auto' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{(profile.name || 'E').charAt(0)}</span>
            </div>
            <span style={{ fontFamily: `'${fontTitle}',sans-serif`, fontWeight: 900, fontSize: 16, color: '#fff' }}>{profile.name || 'EETRA'}</span>
          </div>
        ) : <div style={{ marginBottom: 'auto' }} />}

        <div style={{ paddingTop: 32 }}>
          {subtitle && (
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 16 }}>
              {subtitle}
            </div>
          )}
          <h1 style={{ fontFamily: `'${fontTitle}',sans-serif`, fontSize: titleFontSize, fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.08, color: '#fff', margin: '0 0 28px' }}>
            {title || 'TITRE DU DOCUMENT'}
          </h1>
          <div style={{ width: 32, height: 3, background: 'rgba(255,255,255,.4)', borderRadius: 2, marginBottom: 32 }} />

          {infoRows.length > 0 && (
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {infoRows.map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 48px', borderTop: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {showWatermark && <div style={{ fontSize: 7, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em' }}>Généré par EETRA</div>}
        </div>
        {cv.showQr && qrDataUrl && (
          <div style={{ background: '#fff', padding: 4, borderRadius: 6 }}>
            <img src={qrDataUrl} alt="QR" style={{ width: 36, height: 36 }} />
          </div>
        )}
      </div>
    </div>
  )

  // === MINIMAL layout ===
  if (cv.layout === 'minimal') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Bottom accent line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: accent }} />
      {cv.showGrid && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px)' }} />
      )}
      <div style={{ flex: 1, padding: '72px 64px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 'auto' }}>
          {cv.showLogo && profile.logoDataUrl ? (
            <img src={profile.logoDataUrl} alt="logo" style={{ height: 32, maxWidth: 120, objectFit: 'contain', opacity: .7 }} />
          ) : cv.showLogo && profile.name ? (
            <span style={{ fontFamily: `'${fontBody}',sans-serif`, fontWeight: 700, fontSize: 12, color: '#999', letterSpacing: '.1em', textTransform: 'uppercase' }}>{profile.name}</span>
          ) : null}
        </div>

        <div>
          {subtitle && (
            <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#aaa', marginBottom: 20 }}>{subtitle}</div>
          )}
          <h1 style={{ fontFamily: `'${fontTitle}',sans-serif`, fontSize: titleFontSize, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.05, color: '#0D1117', margin: 0 }}>
            {title || 'TITRE DU DOCUMENT'}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 48 }}>
            <div style={{ width: 1, height: 48, background: '#e8e8e8' }} />
            <div style={{ display: 'flex', gap: 28 }}>
              {infoRows.slice(0, 3).map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#ccc', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {showWatermark && <div style={{ fontSize: 7, color: '#ddd', letterSpacing: '.1em' }}>Généré par EETRA</div>}
          </div>
          {cv.showQr && qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width: 36, height: 36, opacity: .5 }} />}
        </div>
      </div>
    </div>
  )

  // === SPLIT layout ===
  if (cv.layout === 'split') return (
    <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      {/* Left colored half */}
      <div style={{ width: '45%', background: accent, padding: '48px 32px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {cv.showGrid && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />
        )}
        {cv.showLogo && profile.logoDataUrl ? (
          <img src={profile.logoDataUrl} alt="logo" style={{ height: 36, maxWidth: 110, objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: 'auto' }} />
        ) : cv.showLogo && profile.name ? (
          <span style={{ fontFamily: `'${fontTitle}',sans-serif`, fontWeight: 900, fontSize: 13, color: 'rgba(255,255,255,.9)', letterSpacing: '.06em', marginBottom: 'auto' }}>
            {profile.name}
          </span>
        ) : <div style={{ marginBottom: 'auto' }} />}

        <div style={{ position: 'relative' }}>
          {subtitle && <div style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 12 }}>{subtitle}</div>}
          <h1 style={{ fontFamily: `'${fontTitle}',sans-serif`, fontSize: Math.round(titleFontSize * 0.85), fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.1, color: '#fff', margin: 0 }}>
            {title || 'TITRE'}
          </h1>
        </div>
      </div>

      {/* Right white half */}
      <div style={{ flex: 1, background: '#fff', padding: '48px 36px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 'auto' }}>
          {confidentiality && (
            <div style={{ display: 'inline-block', fontSize: 8, fontWeight: 800, letterSpacing: '.2em', padding: '3px 8px', border: `1px solid ${accent}`, color: accent, borderRadius: 4 }}>
              {confidentiality}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {infoRows.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#ccc', flexShrink: 0, width: 64 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#333', flex: 1 }}>{value}</span>
              </div>
            ))}
          </div>

          {profile.tagline && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <p style={{ fontFamily: `'${fontTitle}',sans-serif`, fontStyle: 'italic', fontSize: 13, color: '#bbb', lineHeight: 1.5, margin: 0 }}>
                "{profile.tagline}"
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {showWatermark && <div style={{ fontSize: 7, color: '#ddd', letterSpacing: '.1em' }}>Généré par EETRA</div>}
          {cv.showQr && qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width: 40, height: 40 }} />}
        </div>
      </div>
    </div>
  )

  // Fallback — render classic
  return null
}
