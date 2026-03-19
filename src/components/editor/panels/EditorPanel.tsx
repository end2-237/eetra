'use client'

import { useState, useCallback } from 'react'
import {
  AlignLeft, BarChart2, CheckSquare, ChevronRight, Image, Minus, Quote,
  Table, FileText, Type, Zap, Scale, PenTool, ChevronDown
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { BlockType } from '@/types'
import { TemplatesPanel } from '../panels/TemplatesPanel'
import { AnalyticsPanel } from '../panels/AnalyticsPanel'
import { CommentsPanel } from '../panels/CommentsPanel'
import { StylePanel } from '../panels/StylePanel'

interface BlockDef {
  type: BlockType
  label: string
  icon: React.ReactNode
  desc: string
  group: string
}

const BLOCKS: BlockDef[] = [
  // Structure
  { type: 'section', label: 'Section', icon: <Type size={12} />, desc: 'Titre de section', group: 'Structure' },
  { type: 'text', label: 'Paragraphe', icon: <AlignLeft size={12} />, desc: 'Texte éditorial', group: 'Structure' },
  { type: 'quote', label: 'Citation', icon: <Quote size={12} />, desc: 'Citation exécutive', group: 'Structure' },
  { type: 'divider', label: 'Séparateur', icon: <Minus size={12} />, desc: 'Ligne décorative', group: 'Structure' },
  // Données
  { type: 'table', label: 'Tableau', icon: <Table size={12} />, desc: 'Données tabulaires', group: 'Données' },
  { type: 'kpi', label: 'KPIs', icon: <Zap size={12} />, desc: 'Métriques clés', group: 'Données' },
  { type: 'chart', label: 'Graphique', icon: <BarChart2 size={12} />, desc: 'Bar, ligne, camembert', group: 'Données' },
  { type: 'checklist', label: 'Checklist', icon: <CheckSquare size={12} />, desc: 'Liste de contrôle', group: 'Données' },
  // Visuel
  { type: 'image', label: 'Image', icon: <Image size={12} />, desc: 'Photo ou illustration', group: 'Visuel' },
  // Juridique
  { type: 'clause', label: 'Clause', icon: <Scale size={12} />, desc: 'Disposition juridique', group: 'Juridique' },
  { type: 'sign', label: 'Signature', icon: <PenTool size={12} />, desc: 'Zone de signature', group: 'Juridique' },
]

const GROUPS = ['Structure', 'Données', 'Visuel', 'Juridique']

function BlockLibrary() {
  const { addBlock, activeTab } = useDocument()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUPS.map(g => [g, true]))
  )

  const toggle = (group: string) => setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }))

  const handleAdd = useCallback((type: BlockType) => {
    addBlock(type)
  }, [addBlock])

  return (
    <div style={{ padding: '8px 10px' }}>
      {GROUPS.map(group => {
        const groupBlocks = BLOCKS.filter(b => b.group === group)
        const isOpen = openGroups[group]
        return (
          <div key={group} style={{ marginBottom: 4 }}>
            <button
              onClick={() => toggle(group)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'transparent', marginBottom: isOpen ? 4 : 0,
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase',
                color: 'var(--text4)',
              }}>{group}</span>
              <span style={{ color: 'var(--text4)', transition: 'transform .15s', display: 'flex', transform: isOpen ? 'rotate(180deg)' : '' }}>
                <ChevronDown size={11} />
              </span>
            </button>

            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 6 }}>
                {groupBlocks.map(b => (
                  <button
                    key={b.type}
                    onClick={() => handleAdd(b.type)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)',
                      background: 'var(--surface)', cursor: 'pointer', textAlign: 'left',
                      transition: 'all .12s', width: '100%',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--accentS)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                    }}
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
  if (activeTab === 'comments') return <CommentsPanel />

  // Editor tab — show block library + style
  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0, padding: '12px 14px 6px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>
          Bibliothèque de Blocs
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <BlockLibrary />
      </div>
      <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <StylePanel compact />
      </div>
    </div>
  )
}
