'use client'

import { useState, useCallback } from 'react'
import {
  AlignLeft, BarChart2, CheckSquare, ChevronRight, Image, Minus, Quote,
  Table, Type, Zap, Scale, PenTool, ChevronDown, ChevronUp, SlidersHorizontal
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { BlockType } from '@/types'
import { TemplatesPanel } from '../panels/TemplatesPanel'
import { AnalyticsPanel } from '../panels/AnalyticsPanel'
import { CommentsPanel } from '../panels/CommentsPanel'
import { StylePanel } from '../panels/StylePanel'
import { LayoutPanel } from '../panels/LayoutPanel'

interface BlockDef { type: BlockType; label: string; icon: React.ReactNode; desc: string; group: string }

const BLOCKS: BlockDef[] = [
  { type: 'section',   label: 'Section',    icon: <Type size={12} />,        desc: 'Titre de section',      group: 'Structure' },
  { type: 'text',      label: 'Paragraphe', icon: <AlignLeft size={12} />,   desc: 'Texte éditorial',       group: 'Structure' },
  { type: 'quote',     label: 'Citation',   icon: <Quote size={12} />,       desc: 'Citation exécutive',    group: 'Structure' },
  { type: 'divider',   label: 'Séparateur', icon: <Minus size={12} />,       desc: 'Ligne décorative',      group: 'Structure' },
  { type: 'table',     label: 'Tableau',    icon: <Table size={12} />,       desc: 'Données tabulaires',    group: 'Données' },
  { type: 'kpi',       label: 'KPIs',       icon: <Zap size={12} />,         desc: 'Métriques clés',        group: 'Données' },
  { type: 'chart',     label: 'Graphique',  icon: <BarChart2 size={12} />,   desc: 'Bar, ligne, camembert', group: 'Données' },
  { type: 'checklist', label: 'Checklist',  icon: <CheckSquare size={12} />, desc: 'Liste de contrôle',     group: 'Données' },
  { type: 'image',     label: 'Image',      icon: <Image size={12} />,       desc: 'Photo ou illustration', group: 'Visuel' },
  { type: 'clause',    label: 'Clause',     icon: <Scale size={12} />,       desc: 'Disposition juridique', group: 'Juridique' },
  { type: 'sign',      label: 'Signature',  icon: <PenTool size={12} />,     desc: 'Zone de signature',     group: 'Juridique' },
]

const GROUPS = ['Structure', 'Données', 'Visuel', 'Juridique']
const CONFIDENTIALITIES = ['CONFIDENTIEL', 'USAGE INTERNE', 'PUBLIC', 'STRICTEMENT CONFIDENTIEL']

function DocumentPropertiesPanel() {
  const { title, setTitle, subtitle, setSubtitle, ref, setRef, destination, setDestination, confidentiality, setConfidentiality } = useDocument()
  const [open, setOpen] = useState(true)
  const inp = "w-full rounded-lg px-3 py-2 text-[12px] border outline-none font-sans"
  const is: React.CSSProperties = { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)' }
  const bl = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg2)' }
  return (
    <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={12} color="var(--accent)" />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>Page de garde</span>
        </div>
        {open ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
      </button>
      {open && (
        <div style={{ padding: '0 10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { label: 'Titre *', val: title, set: setTitle, ph: 'Titre du document', max: 200, mono: false },
            { label: 'Sous-titre', val: subtitle, set: setSubtitle, ph: 'Objet ou description', max: 300, mono: false },
          ].map(({ label, val, set, ph, max, mono }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>{label}</label>
              <input className={inp + (mono ? ' font-mono' : '')} style={is} placeholder={ph} value={val} onChange={e => set(e.target.value)} onFocus={fo} onBlur={bl} maxLength={max} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {[
              { label: 'Référence', val: ref, set: setRef, ph: 'REF-001', mono: true },
              { label: 'Destinataire', val: destination, set: setDestination, ph: 'À l\'att. de...', mono: false },
            ].map(({ label, val, set, ph, mono }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>{label}</label>
                <input className={inp + (mono ? ' font-mono' : '')} style={is} placeholder={ph} value={val} onChange={e => set(e.target.value)} onFocus={fo} onBlur={bl} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>Confidentialité</label>
            <select className={inp} style={is} value={confidentiality} onChange={e => setConfidentiality(e.target.value)} onFocus={fo} onBlur={bl as any}>
              {CONFIDENTIALITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

function BlockLibrary() {
  const { addBlock } = useDocument()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(Object.fromEntries(GROUPS.map(g => [g, true])))
  const toggle = (g: string) => setOpenGroups(p => ({ ...p, [g]: !p[g] }))
  const handleAdd = useCallback((type: BlockType) => addBlock(type), [addBlock])
  return (
    <div style={{ padding: '8px 10px' }}>
      {GROUPS.map(group => {
        const blocks = BLOCKS.filter(b => b.group === group)
        const isOpen = openGroups[group]
        return (
          <div key={group} style={{ marginBottom: 4 }}>
            <button onClick={() => toggle(group)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>{group}</span>
              <span style={{ color: 'var(--text4)', display: 'flex', transform: isOpen ? 'rotate(180deg)' : '' }}><ChevronDown size={11} /></span>
            </button>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 6 }}>
                {blocks.map(b => (
                  <button key={b.type} onClick={() => handleAdd(b.type)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', transition: 'all .12s', width: '100%' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';  (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
                  >
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{b.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', lineHeight: 1.2 }}>{b.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>{b.desc}</div>
                    </div>
                    <ChevronRight size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function EditorPanel() {
  const { activeTab } = useDocument()
  if (activeTab === 'templates') return <TemplatesPanel />
  if (activeTab === 'analytics') return <AnalyticsPanel />
  if (activeTab === 'comments')  return <CommentsPanel />
  if (activeTab === 'layout')    return <LayoutPanel />
  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <DocumentPropertiesPanel />
      <div style={{ flexShrink: 0, padding: '10px 14px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>Bibliothèque de Blocs</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}><BlockLibrary /></div>
      <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}><StylePanel compact /></div>
    </div>
  )
}