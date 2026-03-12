'use client'

import { useState } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { DocumentStyle, STYLE_PRESETS, FONT_TITLE_OPTIONS, FONT_BODY_OPTIONS, FONT_MONO_OPTIONS } from '@/types'
import { PALETTE } from '@/lib/templates'
import { Palette, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const PRESET_LABELS = {
  classic: { name: 'Classic', desc: 'Élégance intemporelle, serif + corporate', icon: '🏛️' },
  modern: { name: 'Modern', desc: 'Sobre et épuré, sans-serif contemporain', icon: '⬡' },
  editorial: { name: 'Éditorial', desc: 'Presse premium, typographie marquée', icon: '📰' },
  minimal: { name: 'Minimal', desc: 'Essence pure, espace et lisibilité', icon: '◻' },
}

export function DocumentStyleModal() {
  const { docStyle, setDocStyle, setShowStyleModal, showStyleModal } = useDocument()
  const { profile, updateProfile } = useProfile()
  const [draft, setDraft] = useState<DocumentStyle>(docStyle)

  if (!showStyleModal) return null

  const apply = () => {
    setDocStyle(draft)
    if (draft.accentColor !== profile.color) {
      updateProfile({ color: draft.accentColor })
    }
    setShowStyleModal(false)
  }

  const applyPreset = (key: string) => {
    const preset = STYLE_PRESETS[key]
    setDraft(preset)
  }

  const googleFontsQuery = [
    ...FONT_TITLE_OPTIONS.map(f => f.value),
    ...FONT_BODY_OPTIONS.map(f => f.value),
    ...FONT_MONO_OPTIONS.map(f => f.value),
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(f => f.replace(/ /g, '+') + ':wght@400;600;700;800;900')
    .join('&family=')

  return (
    <>
      {/* Load fonts */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${googleFontsQuery}&display=swap`}
      />

      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        onClick={e => { if (e.target === e.currentTarget) apply() }}
      >
        <div style={{
          background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 720,
          border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,.25)',
          overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Palette size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.01em' }}>
                  Identité du Document
                </div>
                <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>
                  Choisissez le style typographique et chromatique
                </div>
              </div>
            </div>
            <button
              onClick={apply}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ overflowY: 'auto', padding: '24px 28px', flex: 1 }}>
            {/* Presets */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 12 }}>
                Styles Prédéfinis
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {Object.entries(PRESET_LABELS).map(([key, meta]) => {
                  const isActive = draft.preset === key
                  return (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      style={{
                        padding: '14px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                        border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        background: isActive ? 'var(--accentS)' : 'var(--bg2)',
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{meta.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{meta.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text4)', lineHeight: 1.4 }}>{meta.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

            {/* Font selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>
                  Police Titres
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {FONT_TITLE_OPTIONS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setDraft(d => ({ ...d, fontTitle: f.value }))}
                      style={{
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        border: `1.5px solid ${draft.fontTitle === f.value ? 'var(--accent)' : 'var(--border)'}`,
                        background: draft.fontTitle === f.value ? 'var(--accentS)' : 'var(--bg2)',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>Aa</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>
                  Police Corps de Texte
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {FONT_BODY_OPTIONS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setDraft(d => ({ ...d, fontBody: f.value }))}
                      style={{
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        border: `1.5px solid ${draft.fontBody === f.value ? 'var(--accent)' : 'var(--border)'}`,
                        background: draft.fontBody === f.value ? 'var(--accentS)' : 'var(--bg2)',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 13, color: 'var(--text2)', lineHeight: 1.4, flex: 1 }}>
                        {f.preview}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text4)' }}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color accent */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>
                Couleur Principale
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => setDraft(d => ({ ...d, accentColor: c }))}
                    style={{
                      width: 36, height: 36, borderRadius: 8, background: c, cursor: 'pointer',
                      border: `2.5px solid ${draft.accentColor === c ? 'var(--text)' : 'transparent'}`,
                      transform: draft.accentColor === c ? 'scale(1.15)' : '',
                      transition: 'all .15s',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={e => setDraft(d => ({ ...d, accentColor: e.target.value }))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }}
                />
              </div>
            </div>

            {/* Live preview */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: 100, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
              <div style={{ width: 6, height: '100%', background: draft.accentColor, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: `'${draft.fontTitle}', sans-serif`, fontWeight: 900, fontSize: 22, color: '#111', letterSpacing: '-.02em', lineHeight: 1 }}>
                  APERÇU TITRE
                </div>
                <div style={{ fontFamily: `'${draft.fontBody}', sans-serif`, fontSize: 12, color: '#666', marginTop: 6, lineHeight: 1.5 }}>
                  Corps de texte — Ce document illustre le rendu typographique choisi.
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: draft.accentColor, marginTop: 4, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                  Référence · {draft.preset.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
            <Button variant="ghost" size="sm" onClick={() => setShowStyleModal(false)}>
              Passer
            </Button>
            <Button variant="primary" size="sm" onClick={apply}>
              <Sparkles size={13} />
              Appliquer ce style
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
