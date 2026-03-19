'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { STYLE_PRESETS, FONT_TITLE_OPTIONS, FONT_BODY_OPTIONS } from '@/types'
import { PALETTE } from '@/lib/templates'

interface Props {
  compact?: boolean
}

const PRESET_INFO: Record<string, { label: string; icon: string }> = {
  classic:   { label: 'Classic',   icon: '🏛️' },
  modern:    { label: 'Modern',    icon: '⬡'  },
  editorial: { label: 'Éditorial', icon: '📰' },
  minimal:   { label: 'Minimal',   icon: '◻'  },
}

export function StylePanel({ compact }: Props) {
  const { docStyle, setDocStyle } = useDocument()
  const { profile, updateProfile } = useProfile()
  const [open, setOpen] = useState(!compact)

  const lbl = {
    fontSize: 9, fontWeight: 800 as const,
    letterSpacing: '.15em', textTransform: 'uppercase' as const,
    color: 'var(--text4)', marginBottom: 6, display: 'block',
  }

  return (
    <div>
      {/* Toggle header when compact */}
      {compact && (
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '10px 14px',
            border: 'none', background: 'transparent', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)' }}>
            Style du document
          </span>
          {open ? <ChevronUp size={12} color="var(--text4)" /> : <ChevronDown size={12} color="var(--text4)" />}
        </button>
      )}

      {open && (
        <div style={{ padding: compact ? '0 10px 10px' : '10px' }}>

          {/* Presets */}
          <span style={lbl}>Preset</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 12 }}>
            {Object.entries(PRESET_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setDocStyle(STYLE_PRESETS[key])}
                style={{
                  padding: '7px 8px', borderRadius: 9,
                  border: `1.5px solid ${docStyle.preset === key ? 'var(--accent)' : 'var(--border)'}`,
                  background: docStyle.preset === key ? 'var(--accentS)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 12 }}>{info.icon}</span>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginTop: 2 }}>{info.label}</div>
              </button>
            ))}
          </div>

          {/* Accent color */}
          <span style={lbl}>Couleur accent</span>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {PALETTE.slice(0, 10).map(c => (
              <button
                key={c}
                onClick={() => {
                  setDocStyle({ ...docStyle, accentColor: c })
                  updateProfile({ color: c })
                }}
                style={{
                  width: 22, height: 22, borderRadius: 5, background: c, cursor: 'pointer',
                  border: `2px solid ${docStyle.accentColor === c ? 'var(--text)' : 'transparent'}`,
                  padding: 0, flexShrink: 0,
                }}
              />
            ))}
            <input
              type="color"
              value={docStyle.accentColor}
              onChange={e => {
                setDocStyle({ ...docStyle, accentColor: e.target.value })
                updateProfile({ color: e.target.value })
              }}
              style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)', padding: 1, cursor: 'pointer', background: 'var(--bg2)' }}
            />
          </div>

          {/* Font title */}
          <span style={lbl}>Police titres</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}>
            {FONT_TITLE_OPTIONS.map(f => (
              <button
                key={f.value}
                onClick={() => setDocStyle({ ...docStyle, fontTitle: f.value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 8px', borderRadius: 8,
                  border: `1.5px solid ${docStyle.fontTitle === f.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: docStyle.fontTitle === f.value ? 'var(--accentS)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 16, fontWeight: 700, lineHeight: 1 }}>Aa</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)' }}>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Font body */}
          <span style={lbl}>Police corps</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {FONT_BODY_OPTIONS.map(f => (
              <button
                key={f.value}
                onClick={() => setDocStyle({ ...docStyle, fontBody: f.value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 8px', borderRadius: 8,
                  border: `1.5px solid ${docStyle.fontBody === f.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: docStyle.fontBody === f.value ? 'var(--accentS)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 11 }}>{f.preview}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)' }}>{f.label}</span>
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}