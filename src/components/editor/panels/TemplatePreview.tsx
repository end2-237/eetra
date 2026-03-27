'use client'

import { DocBlock } from '@/types'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'

interface TemplatePreviewProps {
  blocks: (DocBlock | any)[]
  coverStyle?: CoverStyle | any
  name: string
  accentColor?: string
}

function renderBlockPreview(block: DocBlock | any, accentColor: string = '#1B4FD8') {
  const getColor = (text: string) => {
    const hue = text.charCodeAt(0) * 137.508 % 360
    const hsl = `hsl(${hue}, 70%, 60%)`
    return hsl
  }

  switch (block.type) {
    case 'h1':
      return (
        <div key={block.id} style={{ fontSize: '18px', fontWeight: 900, color: '#111', margin: '16px 0 8px', lineHeight: 1.2 }}>
          {block.content || 'Heading 1'}
        </div>
      )
    case 'h2':
      return (
        <div key={block.id} style={{ fontSize: '15px', fontWeight: 800, color: '#111', margin: '14px 0 6px', lineHeight: 1.2 }}>
          {block.content || 'Heading 2'}
        </div>
      )
    case 'h3':
      return (
        <div key={block.id} style={{ fontSize: '13px', fontWeight: 700, color: '#333', margin: '12px 0 5px', lineHeight: 1.2 }}>
          {block.content || 'Heading 3'}
        </div>
      )
    case 'h4':
      return (
        <div key={block.id} style={{ fontSize: '12px', fontWeight: 700, color: '#444', margin: '10px 0 4px', lineHeight: 1.2 }}>
          {block.content || 'Heading 4'}
        </div>
      )
    case 'text':
      return (
        <p key={block.id} style={{ fontSize: '10px', lineHeight: 1.6, color: '#555', margin: '8px 0' }}>
          {block.content || 'Texte du document'}
        </p>
      )
    case 'section':
      return (
        <div key={block.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '12px 0 8px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#111' }}>
          <div style={{ width: '3px', height: '12px', background: accentColor, borderRadius: '1px' }} />
          {block.content || 'SECTION'}
        </div>
      )
    case 'bullet-list':
      const items = block.content?.split('\n').filter(l => l.trim()) || []
      return (
        <ul key={block.id} style={{ fontSize: '10px', lineHeight: 1.5, color: '#555', margin: '6px 0', paddingLeft: '20px' }}>
          {items.map((item, i) => (
            <li key={i}>{item.trim()}</li>
          ))}
        </ul>
      )
    case 'numbered-list':
      const numItems = block.content?.split('\n').filter(l => l.trim()) || []
      return (
        <ol key={block.id} style={{ fontSize: '10px', lineHeight: 1.5, color: '#555', margin: '6px 0', paddingLeft: '20px' }}>
          {numItems.map((item, i) => (
            <li key={i}>{item.trim()}</li>
          ))}
        </ol>
      )
    case 'divider':
      return (
        <div key={block.id} style={{ height: '1px', background: '#ddd', margin: '10px 0' }} />
      )
    case 'quote':
      return (
        <div key={block.id} style={{ fontSize: '10px', lineHeight: 1.6, color: '#666', fontStyle: 'italic', margin: '10px 0', paddingLeft: '12px', borderLeft: `3px solid ${accentColor}` }}>
          {block.content || 'Citation'}
        </div>
      )
    case 'table':
      if (!block.tableData) return null
      return (
        <table key={block.id} style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse', margin: '10px 0' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {block.tableData.headers.map((h, i) => (
                <th key={i} style={{ padding: '4px', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid #ddd' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.tableData.rows.slice(0, 3).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '4px', borderBottom: '1px solid #eee' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'kpi':
      return (
        <div key={block.id} style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', fontSize: '10px', textAlign: 'center', margin: '10px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: accentColor }}>{block.content || '100'}</div>
          <div style={{ fontSize: '8px', color: '#999', marginTop: '3px' }}>KPI Value</div>
        </div>
      )
    case 'image':
      return (
        <div key={block.id} style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0', borderRadius: '6px', fontSize: '9px', color: '#999', textAlign: 'center' }}>
          [Image]
        </div>
      )
    case 'chart':
      return (
        <div key={block.id} style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0', borderRadius: '6px', fontSize: '9px', color: '#999', textAlign: 'center', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          [Chart Preview]
        </div>
      )
    default:
      return null
  }
}

export function TemplatePreview({ blocks, coverStyle, name, accentColor = '#1B4FD8' }: TemplatePreviewProps) {
  const layout = (coverStyle?.layout as string) || 'classic'
  const accent = (coverStyle?.accentColor as string) || accentColor
  const initial = name.charAt(0).toUpperCase()

  const getCoverSvg = () => {
    if (layout === 'bold') return (
      <svg viewBox="0 0 80 113" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="80" height="113" fill={accent} />
        <circle cx="72" cy="20" r="32" fill="rgba(255,255,255,.07)" />
        <rect x="8" y="12" width="16" height="16" rx="4" fill="rgba(255,255,255,.18)" />
        <text x="16" y="24" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">{initial}</text>
        <rect x="8" y="56" width="50" height="7" rx="3" fill="rgba(255,255,255,.9)" />
        <rect x="8" y="68" width="38" height="7" rx="3" fill="rgba(255,255,255,.7)" />
      </svg>
    )
    if (layout === 'minimal') return (
      <svg viewBox="0 0 80 113" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="80" height="113" fill="white" />
        <rect x="0" y="110" width="80" height="3" fill={accent} />
        <rect x="8" y="44" width="60" height="8" rx="4" fill="#111" opacity=".88" />
        <rect x="8" y="58" width="44" height="7" rx="3" fill="#111" opacity=".72" />
        <rect x="8" y="72" width="22" height="2" rx="1" fill={accent} />
      </svg>
    )
    if (layout === 'split') return (
      <svg viewBox="0 0 80 113" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="80" height="113" fill="white" />
        <rect x="0" y="0" width="34" height="113" fill={accent} />
        <rect x="8" y="60" width="22" height="7" rx="3" fill="rgba(255,255,255,.9)" />
        <rect x="40" y="40" width="30" height="5" rx="2.5" fill="#F5F5F5" />
        <rect x="40" y="52" width="24" height="5" rx="2.5" fill="#F5F5F5" />
      </svg>
    )
    return (
      <svg viewBox="0 0 80 113" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="80" height="113" fill="white" />
        <rect x="0" y="0" width="3" height="113" fill={accent} />
        <rect x="10" y="10" width="18" height="18" rx="4" fill={accent} opacity=".12" />
        <text x="19" y="23" textAnchor="middle" fill={accent} fontSize="9" fontWeight="900" fontFamily="Arial">{initial}</text>
        <rect x="10" y="50" width="56" height="7" rx="3" fill="#111" opacity=".88" />
        <rect x="10" y="62" width="40" height="6" rx="3" fill="#111" opacity=".72" />
        <rect x="10" y="76" width="60" height="18" rx="4" fill="#F5F7FA" />
      </svg>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '12px', height: '100%' }}>
      {/* Cover */}
      <div style={{ width: '100px', flexShrink: 0, borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', background: '#f5f5f5' }}>
        {getCoverSvg()}
      </div>

      {/* Content Preview */}
      <div style={{ flex: 1, minWidth: 0, background: '#fff', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontSize: '10px', lineHeight: 1.4, overflow: 'auto', maxHeight: '300px' }}>
        <div style={{ paddingRight: '8px' }}>
          {blocks.length === 0 ? (
            <p style={{ color: 'var(--text4)', textAlign: 'center', margin: '40px 0' }}>Aucun contenu</p>
          ) : (
            blocks.slice(0, 10).map(block => renderBlockPreview(block, accent))
          )}
          {blocks.length > 10 && (
            <p style={{ color: 'var(--text4)', textAlign: 'center', margin: '10px 0 0', fontSize: '9px', fontStyle: 'italic' }}>... et {blocks.length - 10} bloc(s) supplémentaire(s)</p>
          )}
        </div>
      </div>
    </div>
  )
}
