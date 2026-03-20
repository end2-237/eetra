'use client'

import { useState } from 'react'
import {
  Layout, Eye, EyeOff, ChevronDown, ChevronUp,
  RotateCcw, Type, List, AlignLeft, AlignCenter, AlignRight,
  FileText, Shield, Hash, Layers
} from 'lucide-react'
import { usePageLayout } from '@/contexts/PageLayoutContext'
import { useProfile } from '@/contexts/ProfileContext'
import { PALETTE } from '@/lib/templates'
import type { HeaderConfig, FooterConfig } from '@/types'

// ── Small helpers ─────────────────────────────────────────────────────────────

function SectionHeader({
  icon, label, open, onToggle,
}: {
  icon: React.ReactNode
  label: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text4)' }}>
          {label}
        </span>
      </div>
      {open ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
    </button>
  )
}

function Toggle({
  value, onChange, label, sub,
}: {
  value: boolean; onChange: (v: boolean) => void; label: string; sub?: string
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 0', gap: 8,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>{sub}</div>}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative',
          background: value ? 'var(--accent)' : 'var(--border2)',
          transition: 'background .2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          left: value ? 18 : 2,
          transition: 'left .2s',
        }} />
      </div>
    </div>
  )
}

function AlignPicker({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; icon: React.ReactNode; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', gap: 3, background: 'var(--bg3)', borderRadius: 8, padding: 3 }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          title={o.label}
          style={{
            flex: 1, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: value === o.value ? 'var(--accent)' : 'transparent',
            color:      value === o.value ? '#fff' : 'var(--text4)',
            transition: 'all .15s',
          }}
        >
          {o.icon}
        </button>
      ))}
    </div>
  )
}

function HeightPicker({
  value, onChange, options,
}: {
  value: number; onChange: (v: number) => void; options: number[]
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {options.map(h => (
        <button
          key={h}
          onClick={() => onChange(h)}
          style={{
            flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid',
            cursor: 'pointer', fontSize: 10, fontWeight: 700,
            borderColor: value === h ? 'var(--accent)' : 'var(--border)',
            background:  value === h ? 'var(--accentS)' : 'transparent',
            color:       value === h ? 'var(--accent)' : 'var(--text4)',
          }}
        >
          {h}px
        </button>
      ))}
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function LayoutPanel() {
  const { layout, updateHeader, updateFooter, updateWatermark, updateHierarchy, resetLayout } = usePageLayout()
  const { profile } = useProfile()

  const [openSection, setOpenSection] = useState<'header' | 'footer' | 'watermark' | 'hierarchy'>('header')
  const toggle = (s: typeof openSection) => setOpenSection(prev => prev === s ? s : s)

  const h = layout.header
  const f = layout.footer
  const wm = layout.watermark
  const hr = layout.hierarchy

  const lbl = { fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--text4)', marginBottom: 6, display: 'block', marginTop: 12 }
  const pad = { padding: '0 14px 14px' }

  const WATERMARK_PRESETS = [
    { id: 'confidential', label: 'CONFIDENTIEL', color: '#1B4FD8' },
    { id: 'draft',        label: 'BROUILLON',    color: '#D97706' },
    { id: 'sample',       label: 'SPECIMEN',     color: '#059669' },
    { id: 'custom',       label: 'Personnalisé', color: '#6B7280' },
  ]

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg2)', overflowY: 'auto',
    }}>
      {/* Panel title */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Layout size={13} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Mise en page</span>
          </div>
          <button
            onClick={() => { if (window.confirm('Réinitialiser la mise en page ?')) resetLayout() }}
            title="Réinitialiser"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, color: 'var(--text4)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <RotateCcw size={10} /> Reset
          </button>
        </div>
      </div>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <SectionHeader
        icon={<FileText size={12} />}
        label="En-tête (Header)"
        open={openSection === 'header'}
        onToggle={() => setOpenSection(openSection === 'header' ? 'footer' : 'header')}
      />
      {openSection === 'header' && (
        <div style={pad}>
          <Toggle
            label="Afficher l'en-tête"
            sub="Sur toutes les pages de contenu"
            value={h.show}
            onChange={v => updateHeader({ show: v })}
          />

          {h.show && (
            <>
              <div style={{ marginTop: 4, opacity: h.show ? 1 : .4, pointerEvents: h.show ? 'auto' : 'none' }}>
                <Toggle label="Logo entreprise"           value={h.showLogo}             onChange={v => updateHeader({ showLogo: v })} />
                <Toggle label="Nom entreprise"            value={h.showCompanyName}       onChange={v => updateHeader({ showCompanyName: v })} />
                <Toggle label="Titre du document"         value={h.showDocTitle}          onChange={v => updateHeader({ showDocTitle: v })} />
                <Toggle label="Niveau de confidentialité" value={h.showConfidentiality}   onChange={v => updateHeader({ showConfidentiality: v })} />
                <Toggle label="Ligne séparatrice"         value={h.showSeparator}         onChange={v => updateHeader({ showSeparator: v })} />

                <label style={lbl}>Disposition</label>
                <AlignPicker
                  value={h.align}
                  onChange={v => updateHeader({ align: v as HeaderConfig['align'] })}
                  options={[
                    { value: 'left',   icon: <AlignLeft   size={13} />, label: 'Gauche' },
                    { value: 'center', icon: <AlignCenter size={13} />, label: 'Centré' },
                    { value: 'split',  icon: <AlignRight  size={13} />, label: 'Réparti' },
                  ]}
                />

                <label style={{ ...lbl, marginTop: 10 }}>Hauteur</label>
                <HeightPicker
                  value={h.height}
                  onChange={v => updateHeader({ height: v as HeaderConfig['height'] })}
                  options={[44, 52, 64]}
                />
              </div>
            </>
          )}

          {/* Live preview */}
          <div style={{ marginTop: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', padding: '4px 8px', background: 'var(--bg3)' }}>
              Aperçu
            </div>
            <div style={{
              height: h.show ? h.height : 28, display: 'flex', alignItems: 'center',
              padding: '0 12px', gap: 8, transition: 'height .2s',
              borderBottom: h.showSeparator && h.show ? '1px solid #e8e8e8' : 'none',
            }}>
              {h.show ? (
                <>
                  {h.showLogo && profile.logoDataUrl
                    ? <img src={profile.logoDataUrl} alt="" style={{ height: 18, maxWidth: 50, objectFit: 'contain' }} />
                    : h.showLogo && <div style={{ fontSize: 8, fontWeight: 900, color: '#555', textTransform: 'uppercase' }}>{(profile.name || 'E').charAt(0)}</div>
                  }
                  {h.showCompanyName && profile.name && (
                    <span style={{ fontSize: 8, fontWeight: 800, color: '#555', textTransform: 'uppercase', flex: 1 }}>
                      {profile.name.slice(0, 20)}
                    </span>
                  )}
                  {h.showDocTitle && (
                    <span style={{ fontSize: 7, color: '#aaa', flex: 2, textAlign: 'center', letterSpacing: '.06em' }}>
                      Titre du document
                    </span>
                  )}
                  {h.showConfidentiality && (
                    <span style={{ fontSize: 6, fontWeight: 800, letterSpacing: '.15em', padding: '1px 5px', border: '1px solid #1B4FD840', color: '#1B4FD8', borderRadius: 2 }}>
                      CONFIDENTIEL
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 9, color: '#ccc', flex: 1, textAlign: 'center' }}>En-tête désactivé</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <SectionHeader
        icon={<Layout size={12} />}
        label="Pied de page (Footer)"
        open={openSection === 'footer'}
        onToggle={() => setOpenSection(openSection === 'footer' ? 'header' : 'footer')}
      />
      {openSection === 'footer' && (
        <div style={pad}>
          <Toggle
            label="Afficher le pied de page"
            value={f.show}
            onChange={v => updateFooter({ show: v })}
          />

          {f.show && (
            <>
              <Toggle label="Numéro de page"    value={f.showPageNumber}  onChange={v => updateFooter({ showPageNumber: v })} />
              <Toggle label="Référence document" value={f.showDocRef}      onChange={v => updateFooter({ showDocRef: v })} />
              <Toggle label="Nom entreprise"     value={f.showCompanyName} onChange={v => updateFooter({ showCompanyName: v })} />
              <Toggle label="Date"               value={f.showDate}        onChange={v => updateFooter({ showDate: v })} />
              <Toggle label="Ligne séparatrice"  value={f.showSeparator}   onChange={v => updateFooter({ showSeparator: v })} />

              <label style={lbl}>Format numéro de page</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {([
                  { id: 'simple', label: '3' },
                  { id: 'total',  label: '3 / 12' },
                  { id: 'dash',   label: '— 3 —' },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => updateFooter({ pageNumberFormat: opt.id })}
                    style={{
                      flex: 1, padding: '5px 4px', borderRadius: 6, border: '1px solid',
                      cursor: 'pointer', fontSize: 9, fontWeight: 700,
                      fontFamily: 'DM Mono, monospace',
                      borderColor: f.pageNumberFormat === opt.id ? 'var(--accent)' : 'var(--border)',
                      background:  f.pageNumberFormat === opt.id ? 'var(--accentS)' : 'transparent',
                      color:       f.pageNumberFormat === opt.id ? 'var(--accent)' : 'var(--text4)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label style={lbl}>Position numéro</label>
              <AlignPicker
                value={f.pageNumberAlign}
                onChange={v => updateFooter({ pageNumberAlign: v as FooterConfig['pageNumberAlign'] })}
                options={[
                  { value: 'left',   icon: <AlignLeft   size={13} />, label: 'Gauche' },
                  { value: 'center', icon: <AlignCenter size={13} />, label: 'Centré' },
                  { value: 'right',  icon: <AlignRight  size={13} />, label: 'Droite' },
                ]}
              />

              <label style={{ ...lbl, marginTop: 10 }}>Hauteur</label>
              <HeightPicker
                value={f.height}
                onChange={v => updateFooter({ height: v as FooterConfig['height'] })}
                options={[36, 44, 52]}
              />
            </>
          )}

          {/* Live preview */}
          <div style={{ marginTop: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', padding: '4px 8px', background: 'var(--bg3)' }}>
              Aperçu
            </div>
            <div style={{
              height: f.show ? f.height : 28, display: 'flex', alignItems: 'center',
              padding: '0 12px', gap: 8,
              borderTop: f.showSeparator && f.show ? '1px solid #f0f0f0' : 'none',
            }}>
              {f.show ? (
                <>
                  {f.showCompanyName && (
                    <span style={{ fontSize: 7, color: '#ccc', flex: 1 }}>{profile.name?.slice(0, 16)}</span>
                  )}
                  {!f.showCompanyName && <div style={{ flex: 1 }} />}
                  {f.showPageNumber && f.pageNumberAlign === 'center' && (
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#aaa', flex: 1, textAlign: 'center' }}>
                      {f.pageNumberFormat === 'simple' ? '3' : f.pageNumberFormat === 'total' ? '3 / 12' : '— 3 —'}
                    </span>
                  )}
                  {f.pageNumberAlign !== 'center' && <div style={{ flex: 1 }} />}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    {f.showDocRef && <span style={{ fontSize: 7, color: '#ccc' }}>REF-001</span>}
                    {f.showPageNumber && f.pageNumberAlign === 'right' && (
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#aaa' }}>
                        {f.pageNumberFormat === 'simple' ? '3' : f.pageNumberFormat === 'total' ? '3 / 12' : '— 3 —'}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 9, color: '#ccc', flex: 1, textAlign: 'center' }}>Pied de page désactivé</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ WATERMARK ═══════════════════════════════════════════════════════ */}
      <SectionHeader
        icon={<Shield size={12} />}
        label="Filigrane"
        open={openSection === 'watermark'}
        onToggle={() => setOpenSection(openSection === 'watermark' ? 'header' : 'watermark')}
      />
      {openSection === 'watermark' && (
        <div style={pad}>
          <Toggle
            label="Afficher le filigrane"
            sub="Texte diagonal sur chaque page"
            value={wm.show}
            onChange={v => updateWatermark({ show: v })}
          />

          {wm.show && (
            <>
              {/* Presets */}
              <label style={lbl}>Modèle</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                {([
                  { id: 'confidential', label: 'CONFIDENTIEL', color: '#1B4FD8' },
                  { id: 'draft',        label: 'BROUILLON',    color: '#D97706' },
                  { id: 'sample',       label: 'SPECIMEN',     color: '#059669' },
                  { id: 'custom',       label: 'Personnalisé', color: '#6B7280' },
                ] as const).map(p => (
                  <button
                    key={p.id}
                    onClick={() => updateWatermark({
                      preset: p.id,
                      color: p.color,
                      text: p.id !== 'custom' ? p.label : wm.text,
                    })}
                    style={{
                      padding: '7px 8px', borderRadius: 8, cursor: 'pointer', border: '1.5px solid',
                      fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textAlign: 'center',
                      borderColor: wm.preset === p.id ? p.color : 'var(--border)',
                      background:  wm.preset === p.id ? `${p.color}14` : 'var(--surface)',
                      color:       wm.preset === p.id ? p.color : 'var(--text4)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom text */}
              {wm.preset === 'custom' && (
                <>
                  <label style={lbl}>Texte personnalisé</label>
                  <input
                    value={wm.text}
                    onChange={e => updateWatermark({ text: e.target.value.toUpperCase() })}
                    placeholder="VOTRE TEXTE"
                    maxLength={30}
                    style={{
                      width: '100%', borderRadius: 8, padding: '7px 10px',
                      border: '1px solid var(--border)', background: 'var(--bg2)',
                      color: 'var(--text)', fontSize: 12, fontWeight: 700,
                      outline: 'none', letterSpacing: '.1em', fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </>
              )}

              {/* Color (custom only) */}
              {wm.preset === 'custom' && (
                <>
                  <label style={lbl}>Couleur</label>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    {PALETTE.slice(0, 8).map(c => (
                      <button
                        key={c}
                        onClick={() => updateWatermark({ color: c })}
                        style={{
                          width: 22, height: 22, borderRadius: 5, background: c,
                          border: `2px solid ${wm.color === c ? 'var(--text)' : 'transparent'}`,
                          cursor: 'pointer', padding: 0, flexShrink: 0,
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={wm.color}
                      onChange={e => updateWatermark({ color: e.target.value })}
                      style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)', padding: 1, cursor: 'pointer' }}
                    />
                  </div>
                </>
              )}

              {/* Opacity */}
              <label style={lbl}>Opacité — {wm.opacity}%</label>
              <input
                type="range" min={3} max={40} step={1}
                value={wm.opacity}
                onChange={e => updateWatermark({ opacity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />

              {/* Font size */}
              <label style={{ ...lbl, marginTop: 8 }}>Taille — {wm.fontSize}pt</label>
              <input
                type="range" min={40} max={120} step={4}
                value={wm.fontSize}
                onChange={e => updateWatermark({ fontSize: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />

              {/* Angle */}
              <label style={{ ...lbl, marginTop: 8 }}>Angle — {wm.angle}°</label>
              <input
                type="range" min={-75} max={0} step={5}
                value={wm.angle}
                onChange={e => updateWatermark({ angle: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />

              {/* Watermark preview */}
              <div style={{
                marginTop: 12, borderRadius: 8, border: '1px solid var(--border)',
                background: '#fff', height: 80, position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Fake lines */}
                {[0,1,2].map(i => (
                  <div key={i} style={{ position: 'absolute', left: 12, right: 12, height: 2, background: '#f0f0f0', top: 16 + i * 20 }} />
                ))}
                <span style={{
                  position: 'absolute',
                  fontSize: Math.max(16, wm.fontSize * 0.3),
                  fontWeight: 900,
                  letterSpacing: '-.02em',
                  color: wm.preset === 'custom' ? wm.color : ({ confidential: '#1B4FD8', draft: '#D97706', sample: '#059669', custom: '#6B7280' }[wm.preset]),
                  opacity: wm.opacity / 100,
                  transform: `rotate(${wm.angle}deg)`,
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}>
                  {wm.preset === 'custom' ? (wm.text || 'TEXTE') : ({ confidential: 'CONFIDENTIEL', draft: 'BROUILLON', sample: 'SPECIMEN', custom: 'CUSTOM' }[wm.preset])}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ HIERARCHY ═══════════════════════════════════════════════════════ */}
      <SectionHeader
        icon={<List size={12} />}
        label="Hiérarchie de sections"
        open={openSection === 'hierarchy'}
        onToggle={() => setOpenSection(openSection === 'hierarchy' ? 'header' : 'hierarchy')}
      />
      {openSection === 'hierarchy' && (
        <div style={pad}>
          <Toggle
            label="Numérotation automatique"
            sub="Préfixe 1., 1.1., 1.1.1. sur les sections"
            value={hr.autoNumberSections}
            onChange={v => updateHierarchy({ autoNumberSections: v })}
          />
          <Toggle
            label="Section active dans l'en-tête"
            sub="Le titre de la section courante s'affiche dans le header"
            value={hr.showOutlineInHeader}
            onChange={v => updateHierarchy({ showOutlineInHeader: v })}
          />
          <Toggle
            label="Indenter les sous-sections"
            sub="Décalage visuel pour les blocs section imbriqués"
            value={hr.indentSubSections}
            onChange={v => updateHierarchy({ indentSubSections: v })}
          />

          {hr.autoNumberSections && (
            <>
              <label style={lbl}>Style de numérotation</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {([
                  { id: 'numeric', label: '1. 2. 3.' },
                  { id: 'roman',   label: 'I. II. III.' },
                  { id: 'alpha',   label: 'A. B. C.' },
                ] as const).map(s => (
                  <button
                    key={s.id}
                    onClick={() => updateHierarchy({ numberStyle: s.id })}
                    style={{
                      flex: 1, padding: '5px 4px', borderRadius: 6, border: '1px solid',
                      cursor: 'pointer', fontSize: 9, fontWeight: 700,
                      borderColor: hr.numberStyle === s.id ? 'var(--accent)' : 'var(--border)',
                      background:  hr.numberStyle === s.id ? 'var(--accentS)' : 'transparent',
                      color:       hr.numberStyle === s.id ? 'var(--accent)' : 'var(--text4)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Hierarchy preview */}
          <div style={{
            marginTop: 14, borderRadius: 8, border: '1px solid var(--border)',
            background: '#fff', padding: '12px 16px',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Aperçu structure
            </div>
            {[
              { depth: 0, label: 'Section principale', num: '1.' },
              { depth: 1, label: 'Sous-section',       num: '1.1.' },
              { depth: 2, label: 'Sous-sous-section',  num: '1.1.1.' },
              { depth: 0, label: 'Section suivante',   num: '2.' },
            ].map((item, i) => {
              const numberMap = { numeric: ['1.', '1.1.', '1.1.1.', '2.'], roman: ['I.', 'I.I.', 'I.I.I.', 'II.'], alpha: ['A.', 'A.A.', 'A.A.A.', 'B.'] }
              const num = numberMap[hr.numberStyle][i]
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  paddingLeft: hr.indentSubSections ? item.depth * 14 : 0,
                  marginBottom: 6,
                }}>
                  <div style={{
                    width: 3, height: 10, borderRadius: 1, flexShrink: 0,
                    background: item.depth === 0 ? 'var(--accent)' : `${['#1B4FD8','#7C3AED','#059669'][item.depth]}80`,
                  }} />
                  {hr.autoNumberSections && (
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--accent)', minWidth: 30 }}>
                      {num}
                    </span>
                  )}
                  <span style={{
                    fontSize: item.depth === 0 ? 11 : 10,
                    fontWeight: item.depth === 0 ? 800 : 600,
                    color: item.depth === 0 ? '#111' : '#666',
                    letterSpacing: item.depth === 0 ? '.12em' : '.06em',
                    textTransform: item.depth === 0 ? 'uppercase' : 'none',
                  }}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom padding */}
      <div style={{ height: 24, flexShrink: 0 }} />
    </div>
  )
}