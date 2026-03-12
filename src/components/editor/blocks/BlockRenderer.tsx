'use client'

import { DocBlock } from '@/types'

interface Props {
  block: DocBlock
  color: string
  entityName: string
}

export function BlockRenderer({ block, color: co, entityName: en }: Props) {
  const { type } = block

  if (type === 'section') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 4, height: 16, background: co, borderRadius: 2, flexShrink: 0 }} />
      <h2
        contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#111', margin: 0 }}
      >
        {block.content || `SECTION // ${en.toUpperCase()}`}
      </h2>
    </div>
  )

  if (type === 'text') return (
    <p
      contentEditable suppressContentEditableWarning
      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 12, lineHeight: 1.85, color: '#444', margin: 0, textAlign: 'justify' }}
    >
      {block.content || `Rédigez votre contenu ici. Les perspectives stratégiques pour ${en} s'articulent autour de vecteurs de croissance que ce document vise à détailler avec rigueur.`}
    </p>
  )

  if (type === 'quote') return (
    <div style={{ borderLeft: `3px solid ${co}`, padding: '14px 18px', background: '#fafafa' }}>
      <p contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'Libre Caslon Text, serif', fontSize: 18, fontStyle: 'italic', color: '#222', margin: '0 0 8px' }}>
        {block.content || '"L\'excellence opérationnelle est le fondement de toute croissance durable."'}
      </p>
      <span contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999' }}>
        Direction Générale — {en}
      </span>
    </div>
  )

  if (type === 'table') return (
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${co}` }}>
            {['Indicateur', 'Réf. 2025', 'Cible 2026', 'Variation'].map(h => (
              <th key={h} contentEditable suppressContentEditableWarning
                style={{ textAlign: 'left', padding: '8px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#111' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ["Chiffre d'Affaires", "9 200 000 FCFA", "12 000 000 FCFA", "+30%"],
            ["Marge Opérationnelle", "16%", "21%", "+5pt"],
            ["Effectifs", "34", "47", "+38%"],
            ["Nouveaux Marchés", "2", "4", "+100%"],
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 ? '#fafafa' : '#fff' }}>
              {row.map((cell, j) => (
                <td key={j} contentEditable suppressContentEditableWarning
                  style={{ padding: '9px 10px', color: '#555' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (type === 'kpi') return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {[["12M FCFA", "Revenus Cible"], ["21%", "Marge Nette"], ["+38%", "Croissance"], ["47", "Effectifs 2026"]].map(([v, l]) => (
        <div key={l} style={{ background: '#F5F7FA', borderTop: `3px solid ${co}`, borderRadius: '0 0 8px 8px', padding: '14px 10px', textAlign: 'center' }}>
          <div contentEditable suppressContentEditableWarning
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 20, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4 }}>{v}</div>
          <div contentEditable suppressContentEditableWarning
            style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999' }}>{l}</div>
        </div>
      ))}
    </div>
  )

  if (type === 'clause') return (
    <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 7, padding: 16 }}>
      <div contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: co, marginBottom: 8 }}>
        {block.content?.split('\n')[0] || 'Article — Disposition Contractuelle'}
      </div>
      <p contentEditable suppressContentEditableWarning
        style={{ fontFamily: 'Libre Caslon Text, serif', fontSize: 12, lineHeight: 1.8, color: '#555', margin: 0 }}>
        {block.content?.split('\n').slice(1).join('\n') || 'Les parties s\'engagent à respecter l\'ensemble des termes et obligations stipulés dans le présent accord, conformément aux dispositions légales et réglementaires applicables.'}
      </p>
    </div>
  )

  if (type === 'sign') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 16, paddingTop: 16 }}>
      {['Émetteur', 'Destinataire'].map(role => (
        <div key={role}>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bbb', marginBottom: 24 }}>{role}</div>
          <div style={{ borderBottom: '1px solid #333', height: 40, marginBottom: 8 }} />
          <div contentEditable suppressContentEditableWarning style={{ fontSize: 11, color: '#888' }}>
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
