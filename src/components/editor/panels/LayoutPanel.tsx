'use client'

import { useState } from 'react'
import {
  Layout, ChevronDown, ChevronUp,
  RotateCcw, AlignLeft, AlignCenter, AlignRight,
  FileText, Shield, List
} from 'lucide-react'
import { usePageLayout } from '@/contexts/PageLayoutContext'
import { useProfile } from '@/contexts/ProfileContext'
import { PALETTE } from '@/lib/templates'
import type { HeaderConfig, FooterConfig } from '@/types'

function SectionHeader({ icon, label, open, onToggle }: {
  icon: React.ReactNode; label: string; open: boolean; onToggle: () => void
}) {
  return (
    <button onClick={onToggle} style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
      borderBottom: '1px solid var(--border)',
    }}>
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

function Toggle({ value, onChange, label, sub }: {
  value: boolean; onChange: (v: boolean) => void; label: string; sub?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative',
        background: value ? 'var(--accent)' : 'var(--border2)',
        transition: 'background .2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          left: value ? 18 : 2, transition: 'left .2s',
        }} />
      </div>
    </div>
  )
}

function AlignPicker({ value, onChange, options }: {
  value: string; onChange: (v: string) => void
  options: { value: string; icon: React.ReactNode; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', gap: 3, background: 'var(--bg3)', borderRadius: 8, padding: 3 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} title={o.label} style={{
          flex: 1, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: value === o.value ? 'var(--accent)' : 'transparent',
          color: value === o.value ? '#fff' : 'var(--text4)',
          transition: 'all .15s',
        }}>
          {o.icon}
        </button>
      ))}
    </div>
  )
}

function HeightPicker({ value, onChange, options }: {
  value: number; onChange: (v: number) => void; options: number[]
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {options.map(h => (
        <button key={h} onClick={() => onChange(h)} style={{
          flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid',
          cursor: 'pointer', fontSize: 10, fontWeight: 700,
          borderColor: value === h ? 'var(--accent)' : 'var(--border)',
          background: value === h ? 'var(--accentS)' : 'transparent',
          color: value === h ? 'var(--accent)' : 'var(--text4)',
        }}>
          {h}px
        </button>
      ))}
    </div>
  )
}

export function LayoutPanel() {
  const { layout, updateHeader, updateFooter, updateWatermark, updateHierarchy, resetLayout } = usePageLayout()
  const { profile } = useProfile()

  const [openSection, setOpenSection] = useState<'header' | 'footer' | 'watermark' | 'hierarchy'>('header')

  const h = layout.header
  const f = layout.footer
  const wm = layout.watermark
  const hr = layout.hierarchy

  const lbl: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: '.12em',
    textTransform: 'uppercase', color: 'var(--text4)',
    marginBottom: 6, display: 'block', marginTop: 12,
  }
  const pad = { padding: '0 14px 14px' }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg2)',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
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

      {/* ══ HEADER ══ */}
      <SectionHeader icon={<FileText size={12} />} label="En-tête"
        open={openSection === 'header'} onToggle={() => setOpenSection(openSection === 'header' ? 'footer' : 'header')} />
      {openSection === 'header' && (
        <div style={pad}>
          <Toggle label="Afficher l'en-tête" sub="Sur toutes les pages" value={h.show} onChange={v => updateHeader({ show: v })} />
          {h.show && (<>
            <Toggle label="Logo entreprise" value={h.showLogo} onChange={v => updateHeader({ showLogo: v })} />
            <Toggle label="Nom entreprise" value={h.showCompanyName} onChange={v => updateHeader({ showCompanyName: v })} />
            <Toggle label="Titre du document" value={h.showDocTitle} onChange={v => updateHeader({ showDocTitle: v })} />
            <Toggle label="Confidentialité" value={h.showConfidentiality} onChange={v => updateHeader({ showConfidentiality: v })} />
            <Toggle label="Ligne séparatrice" value={h.showSeparator} onChange={v => updateHeader({ showSeparator: v })} />
            <label style={lbl}>Disposition</label>
            <AlignPicker value={h.align} onChange={v => updateHeader({ align: v as HeaderConfig['align'] })}
              options={[
                { value: 'left', icon: <AlignLeft size={13} />, label: 'Gauche' },
                { value: 'center', icon: <AlignCenter size={13} />, label: 'Centré' },
                { value: 'split', icon: <AlignRight size={13} />, label: 'Réparti' },
              ]} />
            <label style={{ ...lbl, marginTop: 10 }}>Hauteur</label>
            <HeightPicker value={h.height} onChange={v => updateHeader({ height: v as HeaderConfig['height'] })} options={[44, 52, 64]} />
          </>)}
          {/* Aperçu */}
          <div style={{ marginTop: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', padding: '4px 8px', background: 'var(--bg3)' }}>Aperçu</div>
            <div style={{ height: h.show ? h.height : 28, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, transition: 'height .2s', borderBottom: h.showSeparator && h.show ? '1px solid #e8e8e8' : 'none' }}>
              {h.show ? (<>
                {h.showCompanyName && profile.name && (<span style={{ fontSize: 8, fontWeight: 800, color: '#555', textTransform: 'uppercase', flex: 1 }}>{profile.name.slice(0, 20)}</span>)}
                {!h.showCompanyName && <div style={{ flex: 1 }} />}
                {h.showDocTitle && <span style={{ fontSize: 7, color: '#aaa', flex: 2, textAlign: 'center', letterSpacing: '.06em' }}>Titre du document</span>}
                {h.showConfidentiality && <span style={{ fontSize: 6, fontWeight: 800, letterSpacing: '.15em', padding: '1px 5px', border: '1px solid #1B4FD840', color: '#1B4FD8', borderRadius: 2 }}>CONFIDENTIEL</span>}
              </>) : (<span style={{ fontSize: 9, color: '#ccc', flex: 1, textAlign: 'center' }}>En-tête désactivé</span>)}
            </div>
          </div>
        </div>
      )}

      {/* ══ FOOTER ══ */}
      <SectionHeader icon={<Layout size={12} />} label="Pied de page"
        open={openSection === 'footer'} onToggle={() => setOpenSection(openSection === 'footer' ? 'header' : 'footer')} />
      {openSection === 'footer' && (
        <div style={pad}>
          <Toggle label="Afficher le pied de page" value={f.show} onChange={v => updateFooter({ show: v })} />
          {f.show && (<>
            <Toggle label="Numéro de page" value={f.showPageNumber} onChange={v => updateFooter({ showPageNumber: v })} />
            <Toggle label="Référence document" value={f.showDocRef} onChange={v => updateFooter({ showDocRef: v })} />
            <Toggle label="Nom entreprise" value={f.showCompanyName} onChange={v => updateFooter({ showCompanyName: v })} />
            <Toggle label="Date" value={f.showDate} onChange={v => updateFooter({ showDate: v })} />
            <Toggle label="Ligne séparatrice" value={f.showSeparator} onChange={v => updateFooter({ showSeparator: v })} />
            <label style={lbl}>Format numéro de page</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {([['simple', '3'], ['total', '3/12'], ['dash', '—3—']] as const).map(([id, label]) => (
                <button key={id} onClick={() => updateFooter({ pageNumberFormat: id })} style={{
                  flex: 1, padding: '5px 4px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
                  borderColor: f.pageNumberFormat === id ? 'var(--accent)' : 'var(--border)',
                  background: f.pageNumberFormat === id ? 'var(--accentS)' : 'transparent',
                  color: f.pageNumberFormat === id ? 'var(--accent)' : 'var(--text4)',
                }}>{label}</button>
              ))}
            </div>
            <label style={lbl}>Position numéro</label>
            <AlignPicker value={f.pageNumberAlign} onChange={v => updateFooter({ pageNumberAlign: v as FooterConfig['pageNumberAlign'] })}
              options={[
                { value: 'left', icon: <AlignLeft size={13} />, label: 'Gauche' },
                { value: 'center', icon: <AlignCenter size={13} />, label: 'Centré' },
                { value: 'right', icon: <AlignRight size={13} />, label: 'Droite' },
              ]} />
            <label style={{ ...lbl, marginTop: 10 }}>Hauteur</label>
            <HeightPicker value={f.height} onChange={v => updateFooter({ height: v as FooterConfig['height'] })} options={[36, 44, 52]} />
          </>)}
        </div>
      )}

      {/* ══ WATERMARK ══ */}
      <SectionHeader icon={<Shield size={12} />} label="Filigrane"
        open={openSection === 'watermark'} onToggle={() => setOpenSection(openSection === 'watermark' ? 'header' : 'watermark')} />
      {openSection === 'watermark' && (
        <div style={pad}>
          <Toggle label="Afficher le filigrane" sub="Texte diagonal sur chaque page" value={wm.show} onChange={v => updateWatermark({ show: v })} />
          {wm.show && (<>
            <label style={lbl}>Modèle</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {([
                { id: 'confidential', label: 'CONFIDENTIEL', color: '#1B4FD8' },
                { id: 'draft', label: 'BROUILLON', color: '#D97706' },
                { id: 'sample', label: 'SPECIMEN', color: '#059669' },
                { id: 'custom', label: 'Personnalisé', color: '#6B7280' },
              ] as const).map(p => (
                <button key={p.id} onClick={() => updateWatermark({ preset: p.id, color: p.color, text: p.id !== 'custom' ? p.label : wm.text })}
                  style={{
                    padding: '7px 8px', borderRadius: 8, cursor: 'pointer', border: '1.5px solid', fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textAlign: 'center',
                    borderColor: wm.preset === p.id ? p.color : 'var(--border)',
                    background: wm.preset === p.id ? `${p.color}14` : 'var(--surface)',
                    color: wm.preset === p.id ? p.color : 'var(--text4)',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
            {wm.preset === 'custom' && (
              <>
                <label style={lbl}>Texte personnalisé</label>
                <input value={wm.text} onChange={e => updateWatermark({ text: e.target.value.toUpperCase() })}
                  placeholder="VOTRE TEXTE" maxLength={30}
                  style={{ width: '100%', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 12, fontWeight: 700, outline: 'none', letterSpacing: '.1em', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                <label style={lbl}>Couleur</label>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                  {PALETTE.slice(0, 8).map(c => (
                    <button key={c} onClick={() => updateWatermark({ color: c })}
                      style={{ width: 22, height: 22, borderRadius: 5, background: c, border: `2px solid ${wm.color === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                  ))}
                  <input type="color" value={wm.color} onChange={e => updateWatermark({ color: e.target.value })}
                    style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)', padding: 1, cursor: 'pointer' }} />
                </div>
              </>
            )}
            <label style={lbl}>Opacité — {wm.opacity}%</label>
            <input type="range" min={3} max={40} step={1} value={wm.opacity} onChange={e => updateWatermark({ opacity: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <label style={{ ...lbl, marginTop: 8 }}>Taille — {wm.fontSize}pt</label>
            <input type="range" min={40} max={120} step={4} value={wm.fontSize} onChange={e => updateWatermark({ fontSize: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <label style={{ ...lbl, marginTop: 8 }}>Angle — {wm.angle}°</label>
            <input type="range" min={-75} max={0} step={5} value={wm.angle} onChange={e => updateWatermark({ angle: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </>)}
        </div>
      )}

      {/* ══ HIERARCHY ══ */}
      <SectionHeader icon={<List size={12} />} label="Hiérarchie de sections"
        open={openSection === 'hierarchy'} onToggle={() => setOpenSection(openSection === 'hierarchy' ? 'header' : 'hierarchy')} />
      {openSection === 'hierarchy' && (
        <div style={pad}>
          <Toggle label="Numérotation automatique" sub="Préfixe 1., 1.1., 1.1.1. sur les sections" value={hr.autoNumberSections} onChange={v => updateHierarchy({ autoNumberSections: v })} />
          <Toggle label="Section active dans l'en-tête" value={hr.showOutlineInHeader} onChange={v => updateHierarchy({ showOutlineInHeader: v })} />
          <Toggle label="Indenter les sous-sections" value={hr.indentSubSections} onChange={v => updateHierarchy({ indentSubSections: v })} />
          {hr.autoNumberSections && (
            <>
              <label style={lbl}>Style de numérotation</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {([['numeric', '1. 2. 3.'], ['roman', 'I. II.'], ['alpha', 'A. B.']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => updateHierarchy({ numberStyle: id })} style={{
                    flex: 1, padding: '5px 4px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 9, fontWeight: 700,
                    borderColor: hr.numberStyle === id ? 'var(--accent)' : 'var(--border)',
                    background: hr.numberStyle === id ? 'var(--accentS)' : 'transparent',
                    color: hr.numberStyle === id ? 'var(--accent)' : 'var(--text4)',
                  }}>{label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ height: 24, flexShrink: 0 }} />
    </div>
  )
}