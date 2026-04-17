'use client'

import { useState, useCallback } from 'react'
import {
  AlignLeft, BarChart2, CheckSquare, ChevronRight, Image, Minus, Quote,
  Table, Type, Zap, Scale, PenTool, ChevronDown, ChevronUp, SlidersHorizontal,
  List, Hash, BookMarked, Radar,
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useToast }    from '@/hooks/useToast'
import { Toast }       from '@/components/ui/Toast'
import { BlockType }   from '@/types'
import { TemplatesPanel }        from './TemplatesPanel'
import { AnalyticsPanel }        from './AnalyticsPanel'
import { CommentsPanel }         from './CommentsPanel'
import { StylePanel }            from './StylePanel'
import { LayoutPanel }           from './LayoutPanel'
import { OrientationZonePanel }  from './OrientationZonePanel'
import { BlockStylePanel }       from './BlockStylePanel'
import { QuickFormatPanel }      from './QuickFormatPanel'
import { RadarPanel }            from './RadarPanel'

interface BlockDef {
  type: BlockType; label: string; icon: React.ReactNode; desc: string; group: string
}

const BLOCKS: BlockDef[] = [
  { type: 'h1',           label: 'Titre H1',       icon: <span style={{ fontFamily: 'Times New Roman, serif', fontWeight: 900, fontSize: 13 }}>H1</span>, desc: 'Titre principal niveau 1',        group: 'Titres' },
  { type: 'h2',           label: 'Titre H2',       icon: <span style={{ fontFamily: 'Times New Roman, serif', fontWeight: 800, fontSize: 12 }}>H2</span>, desc: 'Titre de section niveau 2',       group: 'Titres' },
  { type: 'h3',           label: 'Titre H3',       icon: <span style={{ fontFamily: 'Times New Roman, serif', fontWeight: 700, fontSize: 11 }}>H3</span>, desc: 'Sous-titre niveau 3',             group: 'Titres' },
  { type: 'h4',           label: 'Titre H4',       icon: <span style={{ fontFamily: 'Times New Roman, serif', fontWeight: 600, fontSize: 11, fontStyle: 'italic' }}>H4</span>, desc: 'Sous-titre niveau 4',  group: 'Titres' },
  { type: 'bullet-list',  label: 'Liste à puces',  icon: <List size={12} />,  desc: 'Liste avec points (•)',           group: 'Listes' },
  { type: 'numbered-list',label: 'Liste numérotée',icon: <Hash size={12} />,  desc: 'Liste avec numéros (1. 2. 3.)',   group: 'Listes' },
  { type: 'section',      label: 'Section',        icon: <Type size={12}/>,         desc: 'Titre de section caps',    group: 'Structure' },
  { type: 'text',         label: 'Paragraphe',     icon: <AlignLeft size={12}/>,    desc: 'Texte éditorial',           group: 'Structure' },
  { type: 'quote',        label: 'Citation',       icon: <Quote size={12}/>,        desc: 'Citation exécutive',        group: 'Structure' },
  { type: 'divider',      label: 'Séparateur',     icon: <Minus size={12}/>,        desc: 'Ligne décorative',          group: 'Structure' },
  { type: 'table',        label: 'Tableau',        icon: <Table size={12}/>,        desc: 'Données tabulaires',        group: 'Données'   },
  { type: 'kpi',          label: 'KPIs',           icon: <Zap size={12}/>,          desc: 'Métriques clés',            group: 'Données'   },
  { type: 'chart',        label: 'Graphique',      icon: <BarChart2 size={12}/>,    desc: 'Bar, ligne, camembert',     group: 'Données'   },
  { type: 'checklist',    label: 'Checklist',      icon: <CheckSquare size={12}/>,  desc: 'Liste de contrôle',         group: 'Données'   },
  { type: 'image',        label: 'Image',          icon: <Image size={12}/>,        desc: 'Photo ou illustration',     group: 'Visuel'    },
  { type: 'clause',       label: 'Clause',         icon: <Scale size={12}/>,        desc: 'Disposition juridique',     group: 'Juridique' },
  { type: 'sign',         label: 'Signature',      icon: <PenTool size={12}/>,      desc: 'Zone de signature',         group: 'Juridique' },
]

const GROUPS = ['Titres', 'Listes', 'Structure', 'Données', 'Visuel', 'Juridique']

function DocumentPropertiesPanel() {
  const {
    title, setTitle, subtitle, setSubtitle,
    ref, setRef, destination, setDestination,
    confidentiality, setConfidentiality,
  } = useDocument()
  const [open, setOpen] = useState(true)

  const inp: React.CSSProperties = {
    width: '100%', padding: '5px 9px', borderRadius: 6,
    border: '1px solid var(--border)', background: 'var(--bg)',
    fontSize: 12, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', height: 28,
  }
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'
  }
  const bl = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg)'
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={12} color="var(--accent)" />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>Page de garde</span>
        </div>
        {open ? <ChevronUp size={11} color="var(--text4)" /> : <ChevronDown size={11} color="var(--text4)" />}
      </button>

      {open && (
        <div style={{ padding: '0 10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {([
            { label: 'Titre *',    val: title,    set: setTitle,    ph: 'Titre du document', max: 200 },
            { label: 'Sous-titre', val: subtitle, set: setSubtitle, ph: 'Objet / description', max: 300 },
          ] as const).map(({ label, val, set, ph, max }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>{label}</label>
              <input style={inp} placeholder={ph} value={val} onChange={e => set(e.target.value)} onFocus={fo} onBlur={bl} maxLength={max} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {([
              { label: 'Référence',    val: ref,         set: setRef,         ph: 'REF-001',       mono: true  },
              { label: 'Destinataire', val: destination, set: setDestination, ph: "À l'att. de…",  mono: false },
            ] as const).map(({ label, val, set, ph, mono }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>{label}</label>
                <input style={{ ...inp, fontFamily: mono ? 'monospace' : 'inherit' }} placeholder={ph} value={val} onChange={e => set(e.target.value)} onFocus={fo} onBlur={bl} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BlockLibrary() {
  const { addBlock } = useDocument()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUPS.map(g => [g, g === 'Titres' || g === 'Listes' || g === 'Structure']))
  )
  const toggle = (g: string) => setOpenGroups(p => ({ ...p, [g]: !p[g] }))
  const handleAdd = useCallback((type: BlockType) => addBlock(type), [addBlock])

  const groupAccent: Record<string, string> = {
    Titres: 'rgba(27,79,216,.08)', Listes: 'rgba(5,150,105,.08)',
    Structure: 'transparent', Données: 'transparent', Visuel: 'transparent', Juridique: 'transparent',
  }
  const groupIconColor: Record<string, string> = {
    Titres: '#1B4FD8', Listes: '#059669',
    Structure: 'var(--accent)', Données: 'var(--accent)', Visuel: 'var(--accent)', Juridique: 'var(--accent)',
  }

  return (
    <div style={{ padding: '8px 10px' }}>
      {GROUPS.map(group => {
        const blocks = BLOCKS.filter(b => b.group === group)
        const isOpen = openGroups[group]
        return (
          <div key={group} style={{ marginBottom: 4 }}>
            <button onClick={() => toggle(group)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: groupAccent[group] || 'transparent' }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>{group}</span>
              <span style={{ color: 'var(--text4)', display: 'flex', transform: isOpen ? 'rotate(180deg)' : '' }}><ChevronDown size={11} /></span>
            </button>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 6 }}>
                {blocks.map(b => (
                  <button key={b.type} onClick={() => handleAdd(b.type)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', transition: 'all .12s', width: '100%' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.background = 'var(--accentS)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--surface)' }}
                  >
                    <span style={{ color: groupIconColor[group] || 'var(--accent)', flexShrink: 0, minWidth: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{b.icon}</span>
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
  const { toast, showToast } = useToast()

  if (activeTab === 'templates')   return (<><TemplatesPanel showToast={showToast} /><Toast {...toast} /></>)
  if (activeTab === 'analytics')   return <AnalyticsPanel />
  if (activeTab === 'comments')    return (<><CommentsPanel showToast={showToast} /><Toast {...toast} /></>)
  if (activeTab === 'layout')      return <LayoutPanel />
  if (activeTab === 'orientation') return (<><OrientationZonePanel showToast={showToast} /><Toast {...toast} /></>)
  if (activeTab === 'radar')       return <RadarPanel />

  return (
    <div data-tour="editor-panel" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <DocumentPropertiesPanel />
      <QuickFormatPanel />
      <div style={{ flexShrink: 0, padding: '10px 14px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)' }}>
          Bibliothèque de Blocs
        </div>
      </div>
      <div data-tour="block-library" style={{ flex: 1, overflowY: 'auto' }}>
        <BlockLibrary />
      </div>
      <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <StylePanel compact />
      </div>
      <Toast {...toast} />
    </div>
  )
}