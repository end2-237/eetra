'use client'

import { useState } from 'react'
import {
  BookOpen, List, Image, Table2, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Settings, Eye, EyeOff,
  ArrowUp, ArrowDown, Hash, AlignLeft,
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import type { OrientationZoneConfig } from '@/types'

const CSS = `
  .oz-panel { height:100%; display:flex; flex-direction:column; background:var(--bg2); overflow:hidden; }
  .oz-header { padding:12px 14px 10px; border-bottom:1px solid var(--border); flex-shrink:0; }
  .oz-body { flex:1; overflow-y:auto; }

  .oz-section { border-bottom:1px solid var(--border); }
  .oz-section-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; cursor:pointer; background:transparent; border:none; width:100%; }
  .oz-section-head:hover { background:var(--bg3); }
  .oz-section-body { padding:0 14px 12px; }

  .oz-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:7px 0; gap:8px; }
  .oz-toggle-label { font-size:12px; font-weight:600; color:var(--text2); flex:1; }
  .oz-toggle-sub { font-size:10px; color:var(--text4); margin-top:1px; }
  .oz-pill { display:inline-flex; align-items:center; gap:4px; font-size:9px; font-weight:800; padding:2px 7px; border-radius:99px; letter-spacing:.08em; text-transform:uppercase; }

  .oz-level-btn { flex:1; padding:5px 2px; border-radius:6px; border:1.5px solid; cursor:pointer; font-size:10px; font-weight:700; text-align:center; transition:all .12s; }
  .oz-input { width:100%; padding:5px 8px; border-radius:7px; border:1px solid var(--border); background:var(--bg); color:var(--text); font-size:11px; font-family:inherit; outline:none; box-sizing:border-box; }
  .oz-input:focus { border-color:var(--accent); }

  .oz-pos-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:4px; padding:6px 4px; border-radius:8px; border:1.5px solid; cursor:pointer; font-size:10px; font-weight:700; transition:all .12s; background:transparent; }

  .oz-enable-big { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:32px 20px; text-align:center; }
  .oz-enable-btn { display:flex; align-items:center; gap:7px; padding:10px 22px; border-radius:12px; background:var(--accent); color:#fff; border:none; cursor:pointer; font-size:13px; font-weight:800; transition:opacity .15s; }
  .oz-enable-btn:hover { opacity:.88; }
  .oz-disable-btn { font-size:10px; color:var(--text4); background:transparent; border:none; cursor:pointer; padding:4px 8px; border-radius:6px; }
  .oz-disable-btn:hover { background:var(--bg3); color:var(--danger); }

  .oz-preview { margin:10px 14px; border-radius:10px; border:1px solid var(--border); background:#fff; overflow:hidden; }
  .oz-preview-inner { padding:14px 16px; }
  .oz-preview-label { font-size:8px; font-weight:800; letter-spacing:.15em; text-transform:uppercase; color:var(--text4); padding:4px 10px; background:var(--bg3); }
`

interface Props {
  showToast: (msg: string, type?: 'ok'|'err'|'default') => void
}

const DEFAULT_CONFIG: OrientationZoneConfig = {
  enabled: false,
  position: 'after-cover',
  afterPageIndex: null,
  showTOC: true,
  tocLevels: [1, 2, 3],
  numberStyle: 'numeric',
  showPageNumbers: true,
  tocTitle: 'Table des Matières',
  showTableList: false,
  tableListTitle: 'Liste des Tableaux',
  showIllustrationList: false,
  illustrationListTitle: 'Liste des Illustrations',
}

function Toggle({ value, onChange, accent }: { value: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 34, height: 18, borderRadius: 9, cursor: 'pointer', position: 'relative',
        background: value ? (accent || 'var(--accent)') : 'var(--border2)',
        transition: 'background .18s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 1.5, width: 15, height: 15, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        left: value ? 17 : 1.5, transition: 'left .18s',
      }} />
    </div>
  )
}

export function OrientationZonePanel({ showToast }: Props) {
  const { orientationZone, setOrientationZone, pages } = useDocument()
  const config: OrientationZoneConfig = orientationZone || DEFAULT_CONFIG
  const [openSections, setOpenSections] = useState({ toc: true, lists: false, position: false, options: false })

  const upd = (patch: Partial<OrientationZoneConfig>) => {
    setOrientationZone({ ...config, ...patch })
  }

  const toggleSection = (k: keyof typeof openSections) => {
    setOpenSections(p => ({ ...p, [k]: !p[k] }))
  }

  const toggleLevel = (lvl: number) => {
    const levels = config.tocLevels.includes(lvl)
      ? config.tocLevels.filter(l => l !== lvl)
      : [...config.tocLevels, lvl].sort()
    if (levels.length === 0) return // need at least 1
    upd({ tocLevels: levels })
  }

  const accent = 'var(--accent)'

  // Position options
  const positionOptions = [
    { id: 'after-cover', label: 'Après la couverture', icon: '①' },
    { id: 'after-page', label: 'Après une page', icon: '➔' },
    { id: 'end', label: 'À la fin du document', icon: '⑩' },
  ]

  if (!config.enabled) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="oz-panel">
          <div className="oz-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <BookOpen size={13} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Zone d'Orientation</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 3 }}>
              Table des matières, listes de tableaux et d'illustrations
            </div>
          </div>

          <div className="oz-body">
            <div className="oz-enable-big">
              <div style={{ fontSize: 32 }}>📑</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                  Zone d'orientation inactive
                </div>
                <div style={{ fontSize: 12, color: 'var(--text4)', lineHeight: 1.6, maxWidth: 220 }}>
                  Activez pour générer automatiquement une table des matières, 
                  une liste des tableaux et une liste des illustrations.
                </div>
              </div>

              {/* Feature pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'stretch' }}>
                {[
                  { icon: '📋', label: 'Table des matières', desc: 'Niveaux H1 à H4 + Sections' },
                  { icon: '📊', label: 'Liste des tableaux', desc: 'Tous les blocs Table' },
                  { icon: '🖼', label: 'Liste des illustrations', desc: 'Images avec légende' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{f.label}</div>
                      <div style={{ fontSize: 9, color: 'var(--text4)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text4)' }}>1 à 4 pages • Mise à jour automatique</div>
                <button className="oz-enable-btn" onClick={() => { upd({ enabled: true }); showToast('Zone d\'orientation activée', 'ok') }}>
                  <BookOpen size={14} /> Activer la Zone d'Orientation
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Active config UI ────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="oz-panel">

        {/* Header */}
        <div className="oz-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <BookOpen size={13} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Zone d'Orientation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(5,150,105,.1)', color: '#059669' }}>
                ACTIVE
              </span>
              <button className="oz-disable-btn" onClick={() => { upd({ enabled: false }); showToast('Zone désactivée') }}>
                Désactiver
              </button>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 3 }}>
            Mise à jour automatique · {config.showTOC ? 'TdM' : ''}{config.showTableList ? ' + Tableaux' : ''}{config.showIllustrationList ? ' + Illustrations' : ''}
          </div>
        </div>

        <div className="oz-body">

          {/* ── Position ── */}
          <div className="oz-section">
            <button className="oz-section-head" onClick={() => toggleSection('position')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <AlignLeft size={11} color="var(--accent)" />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)' }}>
                  Position dans le document
                </span>
              </div>
              {openSections.position ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
            </button>
            {openSections.position && (
              <div className="oz-section-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {positionOptions.map(opt => (
                    <button key={opt.id}
                      onClick={() => upd({ position: opt.id as OrientationZoneConfig['position'] })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
                        borderRadius: 9, border: '1.5px solid',
                        borderColor: config.position === opt.id ? 'var(--accent)' : 'var(--border)',
                        background: config.position === opt.id ? 'var(--accentS)' : 'var(--surface)',
                        cursor: 'pointer', textAlign: 'left',
                      }}>
                      <span style={{ fontSize: 15 }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: config.position === opt.id ? 'var(--accent)' : 'var(--text2)' }}>
                          {opt.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* After specific page */}
                {config.position === 'after-page' && pages.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 5 }}>
                      Après la page de contenu n°
                    </label>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {pages.map((_, i) => (
                        <button key={i} onClick={() => upd({ afterPageIndex: i })}
                          style={{
                            padding: '4px 10px', borderRadius: 6, border: '1.5px solid',
                            cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            borderColor: config.afterPageIndex === i ? 'var(--accent)' : 'var(--border)',
                            background: config.afterPageIndex === i ? 'var(--accentS)' : 'transparent',
                            color: config.afterPageIndex === i ? 'var(--accent)' : 'var(--text4)',
                          }}>
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Table des Matières ── */}
          <div className="oz-section">
            <button className="oz-section-head" onClick={() => toggleSection('toc')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <List size={11} color="var(--accent)" />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)' }}>
                  Table des Matières
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Toggle value={config.showTOC} onChange={v => upd({ showTOC: v })} />
                {openSections.toc ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
              </div>
            </button>
            {openSections.toc && (
              <div className="oz-section-body">

                {/* Title */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>
                    Titre de la section
                  </label>
                  <input className="oz-input" value={config.tocTitle} onChange={e => upd({ tocTitle: e.target.value })} placeholder="Table des Matières" />
                </div>

                {/* Heading levels */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
                    Niveaux inclus
                  </label>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[1, 2, 3, 4].map(lvl => {
                      const active = config.tocLevels.includes(lvl)
                      const labels = ['H1 / Section', 'H2', 'H3', 'H4']
                      return (
                        <button key={lvl} className="oz-level-btn"
                          onClick={() => toggleLevel(lvl)}
                          style={{
                            borderColor: active ? 'var(--accent)' : 'var(--border)',
                            background: active ? 'var(--accentS)' : 'transparent',
                            color: active ? 'var(--accent)' : 'var(--text4)',
                          }}>
                          <div style={{ fontSize: 8, fontWeight: 900 }}>H{lvl}</div>
                          <div style={{ fontSize: 7, opacity: .7, marginTop: 1 }}>{lvl === 1 ? '+Sec.' : ''}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Number style */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 6 }}>
                    Style de numérotation
                  </label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[
                      { id: 'numeric', label: '1. 2. 3.' },
                      { id: 'roman', label: 'I. II.' },
                      { id: 'alpha', label: 'A. B.' },
                    ].map(s => (
                      <button key={s.id}
                        onClick={() => upd({ numberStyle: s.id as any })}
                        style={{
                          flex: 1, padding: '5px 3px', borderRadius: 6, border: '1.5px solid',
                          cursor: 'pointer', fontSize: 9, fontWeight: 700,
                          borderColor: config.numberStyle === s.id ? 'var(--accent)' : 'var(--border)',
                          background: config.numberStyle === s.id ? 'var(--accentS)' : 'transparent',
                          color: config.numberStyle === s.id ? 'var(--accent)' : 'var(--text4)',
                        }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show page numbers */}
                <div className="oz-toggle-row">
                  <div>
                    <div className="oz-toggle-label">Numéros de page</div>
                    <div className="oz-toggle-sub">Afficher le numéro de page en face de chaque titre</div>
                  </div>
                  <Toggle value={config.showPageNumbers} onChange={v => upd({ showPageNumbers: v })} />
                </div>
              </div>
            )}
          </div>

          {/* ── Listes ── */}
          <div className="oz-section">
            <button className="oz-section-head" onClick={() => toggleSection('lists')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Table2 size={11} color="var(--accent)" />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)' }}>
                  Listes d'objets
                </span>
              </div>
              {openSections.lists ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
            </button>
            {openSections.lists && (
              <div className="oz-section-body">

                {/* Table list */}
                <div style={{ padding: '10px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: 8 }}>
                  <div className="oz-toggle-row" style={{ padding: 0, marginBottom: config.showTableList ? 8 : 0 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 14 }}>📊</span>
                        <div className="oz-toggle-label">Liste des Tableaux</div>
                      </div>
                      <div className="oz-toggle-sub" style={{ marginLeft: 19 }}>Répertorie tous les blocs Table</div>
                    </div>
                    <Toggle value={config.showTableList} onChange={v => upd({ showTableList: v })} />
                  </div>
                  {config.showTableList && (
                    <input className="oz-input" value={config.tableListTitle} onChange={e => upd({ tableListTitle: e.target.value })} placeholder="Liste des Tableaux" />
                  )}
                </div>

                {/* Illustration list */}
                <div style={{ padding: '10px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <div className="oz-toggle-row" style={{ padding: 0, marginBottom: config.showIllustrationList ? 8 : 0 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 14 }}>🖼</span>
                        <div className="oz-toggle-label">Liste des Illustrations</div>
                      </div>
                      <div className="oz-toggle-sub" style={{ marginLeft: 19 }}>Images avec légende uniquement</div>
                    </div>
                    <Toggle value={config.showIllustrationList} onChange={v => upd({ showIllustrationList: v })} />
                  </div>
                  {config.showIllustrationList && (
                    <input className="oz-input" value={config.illustrationListTitle} onChange={e => upd({ illustrationListTitle: e.target.value })} placeholder="Liste des Illustrations" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Mini Preview ── */}
          <div className="oz-preview">
            <div className="oz-preview-label">Aperçu structure</div>
            <div className="oz-preview-inner">
              {config.showTOC && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 3, height: 12, background: 'var(--accent)', borderRadius: 1 }} />
                    {config.tocTitle || 'Table des Matières'}
                  </div>
                  {[
                    { num: '1.', label: 'Titre de niveau 1', indent: 0, bold: true },
                    config.tocLevels.includes(2) && { num: '1.1', label: 'Titre de niveau 2', indent: 12, bold: false },
                    config.tocLevels.includes(3) && { num: '1.1.1', label: 'Niveau 3', indent: 22, bold: false },
                    config.tocLevels.includes(4) && { num: '1.1.1.1', label: 'Niveau 4', indent: 30, bold: false },
                    { num: '2.', label: 'Autre titre 1', indent: 0, bold: true },
                  ].filter(Boolean).map((row: any, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: row.indent, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--accent)', minWidth: 28 }}>{row.num}</span>
                      <span style={{ fontSize: 9, color: row.bold ? '#222' : '#666', fontWeight: row.bold ? 700 : 400, flex: 1 }}>{row.label}</span>
                      <span style={{ flex: '0 0 20px', borderBottom: '1px dotted #ccc', height: 1 }} />
                      {config.showPageNumbers && <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#999' }}>X</span>}
                    </div>
                  ))}
                </div>
              )}
              {config.showTableList && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {config.tableListTitle || 'Liste des Tableaux'}
                  </div>
                  {[1, 2].map(n => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--accent)', minWidth: 16 }}>{n}</span>
                      <span style={{ fontSize: 9, color: '#666', flex: 1 }}>Tableau exemple {n}</span>
                      <span style={{ flex: '0 0 16px', borderBottom: '1px dotted #ccc', height: 1 }} />
                      {config.showPageNumbers && <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#999' }}>X</span>}
                    </div>
                  ))}
                </div>
              )}
              {config.showIllustrationList && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {config.illustrationListTitle || 'Liste des Illustrations'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--accent)', minWidth: 16 }}>1</span>
                    <span style={{ fontSize: 9, color: '#666', flex: 1 }}>Légende de l'image</span>
                    <span style={{ flex: '0 0 16px', borderBottom: '1px dotted #ccc', height: 1 }} />
                    {config.showPageNumbers && <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#999' }}>X</span>}
                  </div>
                </div>
              )}
              {!config.showTOC && !config.showTableList && !config.showIllustrationList && (
                <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text4)', padding: '8px 0' }}>
                  Activez au moins un élément ci-dessus
                </div>
              )}
            </div>
          </div>

          {/* Info footer */}
          <div style={{ padding: '10px 14px 16px', fontSize: 10, color: 'var(--text4)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text3)' }}>Astuce :</strong> Les numéros de page sont calculés automatiquement selon la position de chaque titre dans le document.
          </div>

        </div>
      </div>
    </>
  )
}