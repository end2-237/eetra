'use client'

import { useState, useCallback } from 'react'
import { DocBlock, TableData } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  block: DocBlock
  color: string
  entityName: string
  pageId: string
  onUpdateTable?: (blockId: string, tableData: TableData) => void
}

function InteractiveTable({ block, co, onUpdateTable }: {
  block: DocBlock
  co: string
  onUpdateTable?: (blockId: string, tableData: TableData) => void
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
    const headers = [...data.headers]; headers[i] = val; update({ ...data, headers })
  }
  const updateCell = (r: number, c: number, val: string) => {
    update({ ...data, rows: data.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? val : cell) : row) })
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${co}` }}>
            {data.headers.map((h, ci) => (
              <th key={ci} style={{ textAlign: 'left', padding: '8px 10px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updateHeader(ci, e.currentTarget.textContent || '')}
                    style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#111', outline: 'none', flex: 1 }}
                  >
                    {h}
                  </span>
                  {/* Delete column button — hidden in PDF */}
                  {data.headers.length > 1 && (
                    <button
                      onClick={() => removeCol(ci)}
                      title="Supprimer colonne"
                      className="pdf-hidden"
                      style={{ width: 14, height: 14, borderRadius: 3, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#DC2626', flexShrink: 0, padding: 0 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </th>
            ))}
            {/* Add column button — hidden in PDF */}
            <th style={{ width: 28, padding: '4px' }} className="pdf-hidden">
              <button
                onClick={addCol}
                title="Ajouter une colonne"
                style={{ width: 22, height: 22, borderRadius: 4, background: `${co}18`, border: `1px dashed ${co}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: co, padding: 0 }}
              >
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
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updateCell(ri, ci, e.currentTarget.textContent || '')}
                    style={{ color: '#555', outline: 'none', display: 'block', minWidth: 40 }}
                  >
                    {cell}
                  </span>
                </td>
              ))}
              {/* Delete row button — hidden in PDF */}
              <td style={{ padding: '4px', width: 28 }} className="pdf-hidden">
                <button
                  onClick={() => removeRow(ri)}
                  title="Supprimer ligne"
                  style={{ width: 22, height: 22, borderRadius: 4, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', padding: 0 }}
                >
                  <Trash2 size={9} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add row button — hidden in PDF */}
      <button
        onClick={addRow}
        className="pdf-hidden"
        style={{ marginTop: 6, width: '100%', padding: '6px', borderRadius: 5, background: `${co}10`, border: `1px dashed ${co}50`, cursor: 'pointer', color: co, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
      >
        <Plus size={10} /> Ajouter une ligne
      </button>
    </div>
  )
}

export function BlockRenderer({ block, color: co, entityName: en, pageId, onUpdateTable }: Props) {
  const { type } = block

  if (type === 'section') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 4, height: 16, background: co, borderRadius: 2, flexShrink: 0 }} />
      <h2
        contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'inherit', fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#111', margin: 0, outline: 'none' }}
      >
        {block.content || `SECTION // ${en.toUpperCase()}`}
      </h2>
    </div>
  )

  if (type === 'text') return (
    <p
      contentEditable suppressContentEditableWarning
      style={{ fontFamily: 'inherit', fontSize: 12, lineHeight: 1.85, color: '#444', margin: 0, textAlign: 'justify', outline: 'none', whiteSpace: 'pre-wrap' }}
    >
      {block.content || `Rédigez votre contenu ici. Les perspectives stratégiques pour ${en} s'articulent autour de vecteurs de croissance que ce document vise à détailler avec rigueur.`}
    </p>
  )

  if (type === 'quote') return (
    <div style={{ borderLeft: `3px solid ${co}`, padding: '14px 18px', background: '#fafafa' }}>
      <p contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 16, fontStyle: 'italic', color: '#222', margin: '0 0 8px', outline: 'none' }}>
        {block.content || '"L\'excellence opérationnelle est le fondement de toute croissance durable."'}
      </p>
      <span contentEditable suppressContentEditableWarning
        style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999', outline: 'none' }}>
        Direction Générale — {en}
      </span>
    </div>
  )

  if (type === 'table') return (
    <InteractiveTable block={block} co={co} onUpdateTable={onUpdateTable} />
  )

  if (type === 'kpi') return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {[["12M FCFA", "Revenus Cible"], ["21%", "Marge Nette"], ["+38%", "Croissance"], ["47", "Effectifs 2026"]].map(([v, l]) => (
        <div key={l} style={{ background: '#F5F7FA', borderTop: `3px solid ${co}`, borderRadius: '0 0 8px 8px', padding: '14px 10px', textAlign: 'center' }}>
          <div contentEditable suppressContentEditableWarning
            style={{ fontFamily: 'inherit', fontSize: 20, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4, outline: 'none' }}>{v}</div>
          <div contentEditable suppressContentEditableWarning
            style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999', outline: 'none' }}>{l}</div>
        </div>
      ))}
    </div>
  )

  if (type === 'clause') return (
    <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 7, padding: 16 }}>
      <div contentEditable suppressContentEditableWarning
        style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: co, marginBottom: 8, outline: 'none' }}>
        {block.content?.split('\n')[0] || 'Article — Disposition Contractuelle'}
      </div>
      <p contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 12, lineHeight: 1.8, color: '#555', margin: 0, outline: 'none', whiteSpace: 'pre-wrap' }}>
        {block.content?.split('\n').slice(1).join('\n') || 'Les parties s\'engagent à respecter l\'ensemble des termes et obligations stipulés dans le présent accord, conformément aux dispositions légales et réglementaires applicables.'}
      </p>
    </div>
  )

  if (type === 'sign') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 16, paddingTop: 16 }}>
      {['Émetteur', 'Destinataire'].map(role => (
        <div key={role}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bbb', marginBottom: 24 }}>{role}</div>
          <div style={{ borderBottom: '1px solid #333', height: 40, marginBottom: 8 }} />
          <div contentEditable suppressContentEditableWarning style={{ fontSize: 11, color: '#888', outline: 'none' }}>
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

  if (type === 'checklist') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {['Item à compléter 1', 'Item à compléter 2', 'Item à compléter 3'].map((item, i) => (
        <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${co}`, marginTop: 2, flexShrink: 0 }} />
          <span contentEditable suppressContentEditableWarning style={{ fontSize: 12, color: '#555', outline: 'none' }}>
            {block.content?.split('\n')[i] || item}
          </span>
        </label>
      ))}
    </div>
  )

  return null
}
