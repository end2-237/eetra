'use client'

import { usePageLayout } from '@/contexts/PageLayoutContext'

const WATERMARK_PRESETS: Record<string, { text: string; color: string }> = {
  confidential: { text: 'CONFIDENTIEL',          color: '#1B4FD8' },
  draft:        { text: 'BROUILLON',              color: '#D97706' },
  sample:       { text: 'SPECIMEN',               color: '#059669' },
  custom:       { text: '',                       color: '#6B7280' },
}

export function WatermarkOverlay() {
  const { layout } = usePageLayout()
  const wm = layout.watermark

  if (!wm.show) return null

  const preset = WATERMARK_PRESETS[wm.preset] || WATERMARK_PRESETS.confidential
  const text   = wm.preset === 'custom' ? wm.text : preset.text
  const color  = wm.preset === 'custom' ? wm.color : preset.color

  if (!text) return null

  return (
    <div
      className="watermark-overlay pdf-watermark"
      style={{
        position:      'absolute',
        inset:         0,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        pointerEvents: 'none',
        zIndex:        5,
        overflow:      'hidden',
      }}
    >
      <span
        style={{
          fontFamily:     'Bricolage Grotesque, sans-serif',
          fontSize:       wm.fontSize,
          fontWeight:     900,
          letterSpacing:  '-.02em',
          color,
          opacity:        wm.opacity / 100,
          transform:      `rotate(${wm.angle}deg)`,
          userSelect:     'none',
          whiteSpace:     'nowrap',
          textTransform:  'uppercase',
        }}
      >
        {text}
      </span>
    </div>
  )
}