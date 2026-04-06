'use client'

import type { CoverStyle } from '@/contexts/CustomTemplateContext'

interface CoverMiniProps {
  /**
   * Le style de la couverture.
   * Peut contenir le layout, la couleur d'accentuation, et OPTIONNELLEMENT `previewImageUrl`.
   */
  coverStyle?: CoverStyle | any
  /** Le titre du document */
  name: string
  /** Optionnel: sous-titre affiché sous le titre */
  subtitle?: string
  /** Optionnel: référence du document */
  docRef?: string
  /** Optionnel: destinataire */
  destination?: string
  /** Optionnel: label de confidentialité */
  confidentiality?: string
  /** Variante de taille — contrôle le niveau de détail du rendu (xs, sm, md, lg) */
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

/**
 * CoverMini — Rendu fidèle pixel par pixel d'une page de couverture A4 en HTML/CSS.
 *
 * Ce composant gère lui-même son ratio d'aspect A4. Il s'affichera comme une carte
 * miniature autonome. Il affiche soit une image de prévisualisation (si fournie),
 * soit le layout HTML/CSS correspondant.
 *
 * Usage :
 * <CoverMini coverStyle={tpl.coverStyle} name={tpl.name} size="sm" />
 */
export function CoverMini({
  coverStyle,
  name,
  subtitle,
  docRef,
  destination,
  confidentiality,
  size = 'sm',
}: CoverMiniProps) {
  const layout = coverStyle?.layout || 'classic'
  const accent = coverStyle?.accentColor || '#1B4FD8'
  const titleSizeKey = coverStyle?.titleSize || 'lg'
  const previewImageUrl = coverStyle?.previewImageUrl

  const docTitle = name || 'Document'
  const initial = docTitle.charAt(0).toUpperCase()
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  // --- Style du Conteneur de la Carte Miniature ---
  const containerStyle: React.CSSProperties = {
    // Supprime la largeur fixe (80px) pour qu'il s'adapte à son parent
    // width: 80, 
    width: '100%',
    // Impose le ratio A4 (√2)
    aspectRatio: '0.707',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '5px', // Optionnel, pour arrondir les coins de la carte
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Optionnel, petite ombre
  }

  // --- Rendu conditionnel : Image vs Layout HTML ---
  if (previewImageUrl) {
    return (
      <div style={containerStyle}>
        <img
          src={previewImageUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  // --- Logique de rendu HTML/CSS originale ---

  // Taille de police du titre mise à l'échelle par variante
  const titlePx: Record<string, number> = {
    xs: { sm: 4.5, md: 5.5, lg: 6.5, xl: 8 }[titleSizeKey] ?? 6.5,
    sm: { sm: 6, md: 7.5, lg: 9, xl: 11 }[titleSizeKey] ?? 9,
    md: { sm: 9, md: 11, lg: 13, xl: 16 }[titleSizeKey] ?? 13,
    lg: { sm: 12, md: 15, lg: 18, xl: 22 }[titleSizeKey] ?? 18,
  }[size] ?? 9

  const showDetails = size !== 'xs'
  const showExtra = size === 'md' || size === 'lg'

  // Style de base pour le contenu du layout
  const contentBase: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Times New Roman', serif",
    userSelect: 'none',
  }

  let finalLayout = null

  // ── BOLD ──────────────────────────────────────────────────────────────────
  if (layout === 'bold') {
    finalLayout = (
      <div style={{ ...contentBase, background: accent, display: 'flex', flexDirection: 'column' }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', right: '-18%', top: '-18%', width: '60%', height: '60%', borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '8%', bottom: '18%', width: '35%', height: '35%', borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-8%', bottom: '22%', width: '22%', height: '22%', borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ padding: '8% 9% 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5%' }}>
            <div style={{ width: '14%', aspectRatio: '1', borderRadius: '25%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: titlePx * 0.55, fontWeight: 900, color: '#fff' }}>{initial}</span>
            </div>
            {showDetails && (
              <span style={{ fontSize: titlePx * 0.35, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55%' }}>
                ENTREPRISE
              </span>
            )}
          </div>
          {showDetails && confidentiality && (
            <div style={{ padding: '1.5% 3%', borderRadius: 2, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.1)' }}>
              <span style={{ fontSize: titlePx * 0.28, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)' }}>CONF.</span>
            </div>
          )}
        </div>

        {/* Title zone */}
        <div style={{ flex: 1, padding: '0 9%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {showDetails && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4%', marginBottom: '4%' }}>
              <div style={{ width: '14%', height: 1, background: 'rgba(255,255,255,.45)', borderRadius: 1 }} />
              <span style={{ fontSize: titlePx * 0.3, fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>
                {subtitle || 'DOCUMENT'}
              </span>
            </div>
          )}
          <div style={{ fontSize: titlePx, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.05, wordBreak: 'break-word', textTransform: 'uppercase' }}>
            {docTitle}
          </div>
          <div style={{ width: '28%', height: 1.5, background: 'rgba(255,255,255,.4)', margin: '5% 0 3%', borderRadius: 1 }} />
          {showExtra && destination && (
            <div style={{ marginTop: '2%' }}>
              <div style={{ fontSize: titlePx * 0.28, color: 'rgba(255,255,255,.42)', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '1%' }}>Destinataire</div>
              <div style={{ fontSize: titlePx * 0.38, fontWeight: 700, color: '#fff', letterSpacing: '-.01em' }}>{destination}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 9% 8%', flexShrink: 0 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,.14)', marginBottom: '5%' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: titlePx * 0.27, color: 'rgba(255,255,255,.38)', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '1.5%' }}>Date</div>
              <div style={{ fontSize: titlePx * 0.35, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{date}</div>
            </div>
            {/* QR placeholder */}
            <div style={{ width: '13%', aspectRatio: '1', background: 'rgba(255,255,255,.14)', borderRadius: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '2px', gap: '1.5px' }}>
              {[0,1,2,3].map(i => <div key={i} style={{ background: i < 3 ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)', borderRadius: '1px' }} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── MINIMAL ───────────────────────────────────────────────────────────────
  else if (layout === 'minimal') {
    finalLayout = (
      <div style={{ ...contentBase, background: '#fafbfc', display: 'flex', flexDirection: 'column' }}>
        {/* Bottom accent line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1.5%', background: accent }} />
        <div style={{ position: 'absolute', bottom: '1.5%', left: 0, right: 0, height: '0.8%', background: `${accent}40` }} />
        {/* Decorative dots */}
        <div style={{ position: 'absolute', top: '6%', right: '8%', width: '3%', aspectRatio: '1', borderRadius: '50%', background: accent, opacity: .3 }} />
        <div style={{ position: 'absolute', top: '6%', right: '15%', width: '2%', aspectRatio: '1', borderRadius: '50%', background: accent, opacity: .15 }} />

        {/* Company */}
        <div style={{ padding: '8% 9% 0', flexShrink: 0 }}>
          {showDetails && (
            <span style={{ fontSize: titlePx * 0.3, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bcc5d0' }}>ENTREPRISE</span>
          )}
        </div>

        {/* Title zone */}
        <div style={{ flex: 1, padding: '0 9%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {showDetails && confidentiality && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3%', padding: '1.5% 3.5% 1.5% 2.5%', borderRadius: 2, border: `1px solid ${accent}`, background: `${accent}14`, marginBottom: '5%', alignSelf: 'flex-start' }}>
              <div style={{ width: '6%', aspectRatio: '1', borderRadius: '50%', background: accent }} />
              <span style={{ fontSize: titlePx * 0.28, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: accent }}>CONF.</span>
            </div>
          )}
          {showDetails && subtitle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4%', marginBottom: '5%' }}>
              <div style={{ width: '16%', height: 1.5, background: accent, borderRadius: 1 }} />
              <span style={{ fontSize: titlePx * 0.28, fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: accent }}>{subtitle}</span>
            </div>
          )}
          <div style={{ fontSize: titlePx, fontWeight: 900, color: '#0A0F1E', letterSpacing: '-.025em', lineHeight: 1.05, wordBreak: 'break-word' }}>
            {docTitle.toUpperCase()}
          </div>
          <div style={{ marginTop: '8%', paddingTop: '6%', borderTop: `1px solid ${accent}22` }}>
            {showExtra && docRef && (
              <div style={{ marginBottom: '4%' }}>
                <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '1.5%' }}>Réf.</div>
                <div style={{ fontSize: titlePx * 0.36, fontWeight: 700, color: accent, letterSpacing: '.05em', fontFamily: 'monospace' }}>{docRef}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '1.5%' }}>Date</div>
              <div style={{ fontSize: titlePx * 0.34, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 9% 9%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: titlePx * 0.25, color: '#d0d8e4', letterSpacing: '.1em' }}>EETRA</span>
          <div style={{ width: '12%', aspectRatio: '1', background: '#f5f7fa', border: '1px solid #edf2f7', borderRadius: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '2px', gap: '1.5px' }}>
            {[0,1,2,3].map(i => <div key={i} style={{ background: i < 3 ? '#ccc' : '#e8e8e8', borderRadius: '1px' }} />)}
          </div>
        </div>
      </div>
    )
  }

  // ── SPLIT ─────────────────────────────────────────────────────────────────
  else if (layout === 'split') {
    finalLayout = (
      <div style={{ ...contentBase, display: 'flex' }}>
        {/* Left colored panel */}
        <div style={{ width: '42%', background: accent, padding: '8% 7%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', right: '-30%', top: '-20%', width: '75%', height: '50%', borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: '-20%', bottom: '20%', width: '50%', height: '35%', borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />

          {/* Company initial */}
          <div style={{ marginBottom: 'auto', flexShrink: 0 }}>
            <div style={{ width: '35%', aspectRatio: '1', borderRadius: '20%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: titlePx * 0.55, fontWeight: 900, color: '#fff' }}>{initial}</span>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginTop: '30%' }}>
            {showDetails && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6%', marginBottom: '6%' }}>
                <div style={{ width: '20%', height: 1, background: 'rgba(255,255,255,.45)', borderRadius: 1 }} />
                <span style={{ fontSize: titlePx * 0.28, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>DOC</span>
              </div>
            )}
            <div style={{ fontSize: titlePx * 0.85, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.05, wordBreak: 'break-word', textTransform: 'uppercase' }}>
              {docTitle}
            </div>
          </div>

          {/* Date */}
          <div style={{ marginTop: '8%', flexShrink: 0 }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,.18)', marginBottom: '5%' }} />
            <div style={{ fontSize: titlePx * 0.27, color: 'rgba(255,255,255,.5)', letterSpacing: '.06em' }}>{date}</div>
          </div>
        </div>

        {/* Right white panel */}
        <div style={{ flex: 1, background: '#fff', padding: '8% 8%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Thin left accent line */}
          <div style={{ position: 'absolute', left: 0, top: '8%', bottom: '8%', width: 1, background: `${accent}18` }} />

          {/* Confidentiality */}
          {showDetails && (
            <div style={{ flexShrink: 0, marginBottom: 'auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6%', padding: '1.5% 4% 1.5% 3%', borderRadius: 2, border: `1px solid ${accent}`, background: `${accent}14` }}>
                <div style={{ width: '8%', aspectRatio: '1', borderRadius: '50%', background: accent }} />
                <span style={{ fontSize: titlePx * 0.27, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: accent }}>CONF.</span>
              </div>
            </div>
          )}

          {/* Ref & date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8%' }}>
            {showExtra && docRef && (
              <div style={{ paddingLeft: '8%', borderLeft: `2px solid ${accent}` }}>
                <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '2%' }}>Réf.</div>
                <div style={{ fontSize: titlePx * 0.38, fontWeight: 700, color: accent, fontFamily: 'monospace' }}>{docRef}</div>
              </div>
            )}
            {showExtra && destination && (
              <div>
                <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '2%' }}>Destinataire</div>
                <div style={{ fontSize: titlePx * 0.4, fontWeight: 700, color: '#0A0F1E', lineHeight: 1.2 }}>{destination}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '2%' }}>Date</div>
              <div style={{ fontSize: titlePx * 0.34, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
            </div>
          </div>

          {/* QR placeholder bottom right */}
          <div style={{ position: 'absolute', bottom: '6%', right: '6%' }}>
            <div style={{ width: titlePx * 1.4, height: titlePx * 1.4, background: '#f5f7fa', border: '1px solid #edf2f7', borderRadius: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '2px', gap: '1.5px' }}>
              {[0,1,2,3].map(i => <div key={i} style={{ background: i < 3 ? '#ccc' : '#e8e8e8', borderRadius: '1px' }} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── CLASSIC (default) ─────────────────────────────────────────────────────
  else {
    finalLayout = (
      <div style={{ ...contentBase, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Left accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '2.5%', height: '100%', background: accent }} />
        <div style={{ position: 'absolute', left: '2.5%', top: 0, width: '.8%', height: '100%', background: `${accent}22` }} />
        {/* Decoration top-right */}
        <div style={{ position: 'absolute', top: '-12%', right: '-12%', width: '42%', height: '32%', borderRadius: '50%', background: `${accent}07`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '22%', height: '16%', borderRadius: '50%', background: `${accent}05`, pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ padding: '8% 9% 0 7%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          {/* Company brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5%' }}>
            <div style={{ width: '15%', aspectRatio: '1', borderRadius: '22%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${accent}40`, flexShrink: 0 }}>
              <span style={{ fontSize: titlePx * 0.55, fontWeight: 900, color: '#fff' }}>{initial}</span>
            </div>
            {showDetails && (
              <div>
                <div style={{ fontSize: titlePx * 0.34, fontWeight: 900, color: '#0A0F1E', letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>ENTREPRISE</div>
                <div style={{ fontSize: titlePx * 0.26, color: '#9aa8b8', marginTop: '3%' }}>Votre slogan</div>
              </div>
            )}
          </div>
          {showDetails && confidentiality && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4%', padding: '1.5% 3.5% 1.5% 2%', borderRadius: 2, border: `1.5px solid ${accent}`, background: `${accent}14`, flexShrink: 0 }}>
              <div style={{ width: '7%', aspectRatio: '1', borderRadius: '50%', background: accent }} />
              <span style={{ fontSize: titlePx * 0.26, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: accent }}>CONF.</span>
            </div>
          )}
        </div>

        {/* Title zone */}
        <div style={{ flex: 1, padding: '0 9% 0 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: '90%' }}>
            {showDetails && subtitle && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4%', marginBottom: '5%' }}>
                <div style={{ width: '18%', height: 1.5, background: accent, borderRadius: 1, flexShrink: 0 }} />
                <span style={{ fontSize: titlePx * 0.28, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: accent }}>{subtitle}</span>
              </div>
            )}
            <div style={{ fontSize: titlePx, fontWeight: 900, color: '#0A0F1E', letterSpacing: '-.03em', lineHeight: 1.05, wordBreak: 'break-word', textTransform: 'uppercase' }}>
              {docTitle}
            </div>
            {/* Separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3%', marginTop: '6%', marginBottom: '4%' }}>
              <div style={{ width: '22%', height: 2, borderRadius: 1, background: accent }} />
              <div style={{ width: '3%', aspectRatio: '1', borderRadius: '50%', background: `${accent}55` }} />
              <div style={{ width: '10%', height: 1, borderRadius: 1, background: `${accent}30` }} />
            </div>
            {/* Ref / Destination */}
            {showExtra && (docRef || destination) && (
              <div style={{ display: 'flex', gap: '12%', flexWrap: 'wrap' }}>
                {docRef && (
                  <div>
                    <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '3%' }}>Réf.</div>
                    <div style={{ fontSize: titlePx * 0.36, fontWeight: 700, color: accent, letterSpacing: '.05em', fontFamily: 'monospace' }}>{docRef}</div>
                  </div>
                )}
                {destination && (
                  <div>
                    <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '3%' }}>Destinataire</div>
                    <div style={{ fontSize: titlePx * 0.38, fontWeight: 700, color: '#0A0F1E' }}>{destination}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 9% 7% 7%', flexShrink: 0 }}>
          <div style={{ height: 1, background: `linear-gradient(90deg,${accent}44 0%,transparent 70%)`, marginBottom: '5%' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: titlePx * 0.27, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '2%' }}>Date</div>
              <div style={{ fontSize: titlePx * 0.36, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
            </div>
            {/* QR placeholder */}
            <div style={{ width: titlePx * 1.5, height: titlePx * 1.5, background: '#fff', border: '1px solid #edf2f7', borderRadius: 2, padding: '2px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5px' }}>
              {[0,1,2,3].map(i => <div key={i} style={{ background: i < 3 ? '#ccc' : '#e8e8e8', borderRadius: '1px' }} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Rendu final encapsulé ---
  return (
    <div style={containerStyle}>
      {finalLayout}
    </div>
  )
}