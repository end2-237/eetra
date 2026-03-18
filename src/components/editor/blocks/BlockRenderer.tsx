'use client'

import { useState, useCallback, useRef, useLayoutEffect } from 'react'
import { DocBlock, TableData } from '@/types'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { SafeBlock } from '@/components/ErrorBoundary'
import { sanitizeContent } from '@/lib/sanitize'

interface Props {
  block: DocBlock
  color: string
  entityName: string
  pageId: string
  onUpdateTable?: (blockId: string, tableData: TableData) => void
  onUpdateContent?: (blockId: string, content: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

// ─── Editable text hook ───────────────────────────────────────────────────────
function useEditableRef(initialContent: string, blockId: string) {
  const ref = useRef<any>(null)
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.textContent = initialContent
    }
  }, [blockId])
  return ref
}

// Safely read textContent from a contenteditable element and sanitize it
function readAndSanitize(el: HTMLElement): string {
  return sanitizeContent(el.textContent || '')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionBlock({ block, co, onUpdateContent }: { block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const ref = useEditableRef(block.content || `SECTION // ${block.id.toUpperCase()}`, block.id)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 4, height: 16, background: co, borderRadius: 2, flexShrink: 0 }} />
      <h2
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={{ fontFamily: 'inherit', fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#111', margin: 0, outline: 'none', cursor: 'text' }}
      />
    </div>
  )
}

function TextBlock({ block, onUpdateContent }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent'] }) {
  const ref = useEditableRef(block.content || '', block.id)
  return (
    <p
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
      style={{ fontFamily: 'inherit', fontSize: 12, lineHeight: 1.85, color: '#444', margin: 0, textAlign: 'justify', outline: 'none', whiteSpace: 'pre-wrap', cursor: 'text', minHeight: 20 }}
    />
  )
}

function QuoteBlock({ block, co, entityName, onUpdateContent }: { block: DocBlock; co: string; entityName: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const textRef = useEditableRef(block.content?.split('\n')[0] || '"L\'excellence opérationnelle est le fondement de toute croissance durable."', block.id)
  return (
    <div style={{ borderLeft: `3px solid ${co}`, padding: '14px 18px', background: '#fafafa' }}>
      <p
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={{ fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 16, fontStyle: 'italic', color: '#222', margin: '0 0 8px', outline: 'none', cursor: 'text' }}
      />
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999' }}>
        Direction Générale — {entityName}
      </span>
    </div>
  )
}

function KpiBlock({ block, co, onUpdateContent }: { block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultKpis = [
    { val: '12M FCFA', label: 'Revenus Cible' },
    { val: '21%', label: 'Marge Nette' },
    { val: '+38%', label: 'Croissance' },
    { val: '47', label: 'Effectifs 2026' },
  ]

  const getKpis = () => {
    try {
      if (block.content) return JSON.parse(block.content)
    } catch {}
    return defaultKpis
  }

  const [kpis, setKpis] = useState(getKpis)

  const updateKpi = (idx: number, field: 'val' | 'label', value: string) => {
    const sanitized = sanitizeContent(value)
    const next = kpis.map((k: any, i: number) => i === idx ? { ...k, [field]: sanitized } : k)
    setKpis(next)
    onUpdateContent?.(block.id, JSON.stringify(next))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {kpis.map((kpi: any, i: number) => (
        <div key={i} style={{ background: '#F5F7FA', borderTop: `3px solid ${co}`, borderRadius: '0 0 8px 8px', padding: '14px 10px', textAlign: 'center' }}>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e => updateKpi(i, 'val', e.currentTarget.textContent || '')}
            style={{ fontFamily: 'inherit', fontSize: 20, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4, outline: 'none', cursor: 'text' }}
          >{kpi.val}</div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={e => updateKpi(i, 'label', e.currentTarget.textContent || '')}
            style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999', outline: 'none', cursor: 'text' }}
          >{kpi.label}</div>
        </div>
      ))}
    </div>
  )
}

function ClauseBlock({ block, co, onUpdateContent }: { block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const titleRef = useEditableRef(block.content?.split('\n')[0] || 'Article — Disposition Contractuelle', block.id)
  const bodyRef = useEditableRef(block.content?.split('\n').slice(1).join('\n') || 'Les parties s\'engagent à respecter l\'ensemble des termes et obligations stipulés dans le présent accord, conformément aux dispositions légales et réglementaires applicables.', block.id)

  const syncContent = (e: React.FocusEvent<HTMLElement>) => {
    const title = sanitizeContent(titleRef.current?.textContent || '')
    const body = sanitizeContent(bodyRef.current?.textContent || '')
    onUpdateContent?.(block.id, `${title}\n${body}`)
  }

  return (
    <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 7, padding: 16 }}>
      <div
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={syncContent}
        style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: co, marginBottom: 8, outline: 'none', cursor: 'text' }}
      />
      <p
        ref={bodyRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={syncContent}
        style={{ fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 12, lineHeight: 1.8, color: '#555', margin: 0, outline: 'none', whiteSpace: 'pre-wrap', cursor: 'text' }}
      />
    </div>
  )
}

function ChecklistBlock({ block, onUpdateContent }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultItems = ['Item à compléter 1', 'Item à compléter 2', 'Item à compléter 3']
  const getItems = () => {
    if (block.content) return block.content.split('\n').filter(Boolean)
    return defaultItems
  }
  const [items, setItems] = useState(getItems)
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false))

  const updateItem = (idx: number, val: string) => {
    const sanitized = sanitizeContent(val)
    const next = items.map((item, i) => i === idx ? sanitized : item)
    setItems(next)
    onUpdateContent?.(block.id, next.join('\n'))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <div
            onClick={() => setChecked(c => c.map((v, idx) => idx === i ? !v : v))}
            style={{
              width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked[i] ? '#059669' : '#1B4FD8'}`,
              marginTop: 2, flexShrink: 0, background: checked[i] ? '#059669' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
          >
            {checked[i] && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
          </div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={e => updateItem(i, e.currentTarget.textContent || '')}
            style={{ fontSize: 12, color: checked[i] ? '#999' : '#555', outline: 'none', cursor: 'text', textDecoration: checked[i] ? 'line-through' : 'none' }}
          >{item}</span>
        </label>
      ))}
    </div>
  )
}

function InteractiveTable({ block, co, onUpdateTable }: {
  block: DocBlock; co: string; onUpdateTable?: (blockId: string, tableData: TableData) => void
}) {
  const defaultData: TableData = block.tableData || {
    headers: ['Indicateur', 'Réf. 2025', 'Cible 2026', 'Variation'],
    rows: [
      ["Chiffre d'Affaires", "9 200 000 FCFA", "12 000 000 FCFA", "+30%"],
      ["Marge Opérationnelle", "16%", "21%", "+5pt"],
      ["Effectifs", "34", "47", "+38%"],
      ["Nouveaux Marchés", "2", "4", "+100%"],
    ],
  }
  const [data, setData] = useState<TableData>(defaultData)

  const update = useCallback((newData: TableData) => {
    setData(newData)
    onUpdateTable?.(block.id, newData)
  }, [block.id, onUpdateTable])

  const addRow = () => update({ ...data, rows: [...data.rows, data.headers.map(() => '—')] })
  const removeRow = (i: number) => update({ ...data, rows: data.rows.filter((_, idx) => idx !== i) })
  const addCol = () => update({ headers: [...data.headers, 'Colonne'], rows: data.rows.map(r => [...r, '—']) })
  const removeCol = (i: number) => update({
    headers: data.headers.filter((_, idx) => idx !== i),
    rows: data.rows.map(r => r.filter((_, idx) => idx !== i)),
  })
  const updateHeader = (i: number, val: string) => {
    const headers = [...data.headers]; headers[i] = sanitizeContent(val); update({ ...data, headers })
  }
  const updateCell = (r: number, c: number, val: string) => {
    update({ ...data, rows: data.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? sanitizeContent(val) : cell) : row) })
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${co}` }}>
            {data.headers.map((h, ci) => (
              <th key={ci} style={{ textAlign: 'left', padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    contentEditable suppressContentEditableWarning
                    onBlur={e => updateHeader(ci, e.currentTarget.textContent || '')}
                    style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#111', outline: 'none', flex: 1, cursor: 'text' }}
                  >{h}</span>
                  {data.headers.length > 1 && (
                    <button onClick={() => removeCol(ci)} className="pdf-hidden"
                      style={{ width: 14, height: 14, borderRadius: 3, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#DC2626', flexShrink: 0, padding: 0 }}>×</button>
                  )}
                </div>
              </th>
            ))}
            <th style={{ width: 28, padding: '4px' }} className="pdf-hidden">
              <button onClick={addCol}
                style={{ width: 22, height: 22, borderRadius: 4, background: `${co}18`, border: `1px dashed ${co}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: co, padding: 0 }}>
                <Plus size={10} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #f0f0f0', background: ri % 2 ? '#fafafa' : '#fff' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '9px 10px' }}>
                  <span
                    contentEditable suppressContentEditableWarning
                    onBlur={e => updateCell(ri, ci, e.currentTarget.textContent || '')}
                    style={{ color: '#555', outline: 'none', display: 'block', minWidth: 40, cursor: 'text' }}
                  >{cell}</span>
                </td>
              ))}
              <td style={{ padding: '4px', width: 28 }} className="pdf-hidden">
                <button onClick={() => removeRow(ri)}
                  style={{ width: 22, height: 22, borderRadius: 4, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', padding: 0 }}>
                  <Trash2 size={9} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="pdf-hidden"
        style={{ marginTop: 6, width: '100%', padding: '6px', borderRadius: 5, background: `${co}10`, border: `1px dashed ${co}50`, cursor: 'pointer', color: co, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Plus size={10} /> Ajouter une ligne
      </button>
    </div>
  )
}

// ─── Main BlockRenderer ───────────────────────────────────────────────────────

export function BlockRenderer({ block, color: co, entityName: en, pageId, onUpdateTable, onUpdateContent, dragHandleProps }: Props) {
  const { type } = block

  const dragHandle = (
    <div
      {...dragHandleProps}
      className="pdf-hidden block-drag-handle"
      title="Déplacer le bloc"
      style={{
        position: 'absolute', left: -28, top: '50%', transform: 'translateY(-50%)',
        width: 20, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'grab', opacity: 0, transition: 'opacity .15s', color: '#bbb',
      }}
    >
      <GripVertical size={13} />
    </div>
  )

  const wrap = (children: React.ReactNode, label?: string) => (
    <div style={{ position: 'relative' }}>
      {dragHandle}
      <SafeBlock label={label || type}>
        {children}
      </SafeBlock>
    </div>
  )

  if (type === 'section') return wrap(<SectionBlock block={block} co={co} onUpdateContent={onUpdateContent} />, 'Section')
  if (type === 'text') return wrap(<TextBlock block={block} onUpdateContent={onUpdateContent} />, 'Text')
  if (type === 'quote') return wrap(<QuoteBlock block={block} co={co} entityName={en} onUpdateContent={onUpdateContent} />, 'Quote')
  if (type === 'table') return wrap(<InteractiveTable block={block} co={co} onUpdateTable={onUpdateTable} />, 'Table')
  if (type === 'kpi') return wrap(<KpiBlock block={block} co={co} onUpdateContent={onUpdateContent} />, 'KPI')
  if (type === 'clause') return wrap(<ClauseBlock block={block} co={co} onUpdateContent={onUpdateContent} />, 'Clause')
  if (type === 'checklist') return wrap(<ChecklistBlock block={block} onUpdateContent={onUpdateContent} />, 'Checklist')

  if (type === 'sign') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 16, paddingTop: 16 }}>
      {['Émetteur', 'Destinataire'].map(role => (
        <div key={role}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bbb', marginBottom: 24 }}>{role}</div>
          <div style={{ borderBottom: '1px solid #333', height: 40, marginBottom: 8 }} />
          <div contentEditable suppressContentEditableWarning style={{ fontSize: 11, color: '#888', outline: 'none', cursor: 'text' }}>
            {role === 'Émetteur' ? (en || 'Émetteur — Titre') : 'Nom, Titre'}
          </div>
          <div style={{ fontSize: 10, color: '#bbb', marginTop: 3 }}>Date : ___/___/2026</div>
        </div>
      ))}
    </div>
  )

  if (type === 'divider') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: co, opacity: .4 }} />
      <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
    </div>
  )

  return null
}
