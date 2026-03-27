'use client'

import { DocBlock } from '@/types'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'

interface TemplatePreviewProps {
  blocks: (DocBlock | any)[]
  coverStyle?: CoverStyle | any
  name: string
  accentColor?: string
}

// ── Cover Page ────────────────────────────────────────────────────────────────

function CoverPagePreview({ coverStyle, name, accentColor }: { coverStyle?: any; name: string; accentColor: string }) {
  const layout = coverStyle?.layout || 'classic'
  const accent = coverStyle?.accentColor || accentColor
  const titleSize = { sm: 11, md: 13, lg: 16, xl: 19 }[(coverStyle?.titleSize as string) || 'lg'] ?? 16

  const docTitle = name || 'Document'
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const initial = docTitle.charAt(0).toUpperCase()

  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Times New Roman', serif",
    background: '#fff',
  }

  if (layout === 'bold') return (
    <div style={{ ...baseStyle, background: accent }}>
      {/* Background orb */}
      <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
      <div style={{ position: 'absolute', right: 10, bottom: 30, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
      {/* Header — company */}
      <div style={{ padding: '12px 14px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 7, fontWeight: 900, color: '#fff' }}>{initial}</span>
        </div>
        <div style={{ fontSize: 5, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>VOTRE ENTREPRISE</div>
      </div>
      {/* Title */}
      <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>DOCUMENT</div>
        <div style={{ fontSize: titleSize * 0.55, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.1, wordBreak: 'break-word' }}>{docTitle.toUpperCase()}</div>
        <div style={{ width: 20, height: 1.5, background: 'rgba(255,255,255,.4)', margin: '5px 0' }} />
      </div>
      {/* Footer */}
      <div style={{ padding: '0 14px 10px', marginTop: 'auto' }}>
        <div style={{ height: .5, background: 'rgba(255,255,255,.18)', marginBottom: 5 }} />
        <div style={{ fontSize: 4.5, color: 'rgba(255,255,255,.4)', letterSpacing: '.05em' }}>{date}</div>
      </div>
    </div>
  )

  if (layout === 'minimal') return (
    <div style={{ ...baseStyle, background: '#fafbfc' }}>
      {/* Bottom accent bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: accent }} />
      {/* Dots */}
      <div style={{ position: 'absolute', top: 18, right: 18, width: 3, height: 3, borderRadius: '50%', background: accent, opacity: .3 }} />
      {/* Company */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ fontSize: 5, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bcc5d0' }}>VOTRE ENTREPRISE</div>
      </div>
      {/* Title zone */}
      <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 10 }}>
        <div style={{ fontSize: titleSize * 0.55, fontWeight: 900, color: '#0A0F1E', letterSpacing: '-.02em', lineHeight: 1.1 }}>{docTitle.toUpperCase()}</div>
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${accent}22` }}>
          <div style={{ fontSize: 4, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 2 }}>Date</div>
          <div style={{ fontSize: 4.5, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
        </div>
      </div>
    </div>
  )

  if (layout === 'split') return (
    <div style={{ ...baseStyle, display: 'flex' }}>
      {/* Left panel */}
      <div style={{ width: '42%', background: accent, padding: '10px 8px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', right: -15, top: -15, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        {/* Company */}
        <div style={{ marginBottom: 'auto' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 3 }}>
            <span style={{ fontSize: 6, fontWeight: 900, color: '#fff' }}>{initial}</span>
          </div>
        </div>
        {/* Title */}
        <div>
          <div style={{ fontSize: 5, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 3 }}>DOC</div>
          <div style={{ fontSize: titleSize * 0.5, fontWeight: 900, color: '#fff', lineHeight: 1.1, wordBreak: 'break-word' }}>{docTitle.toUpperCase()}</div>
        </div>
        <div style={{ marginTop: 6, fontSize: 4, color: 'rgba(255,255,255,.4)' }}>{date}</div>
      </div>
      {/* Right panel */}
      <div style={{ flex: 1, background: '#fff', padding: '10px 8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 4.5, fontWeight: 700, letterSpacing: '.12em', color: '#a8b4c4', textTransform: 'uppercase', marginBottom: 5 }}>CONFIDENTIEL</div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: 4, color: '#a8b4c4', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 2 }}>Référence</div>
          <div style={{ fontSize: 4.5, fontWeight: 700, color: accent, fontFamily: 'monospace', letterSpacing: '.05em' }}>REF-2026-001</div>
        </div>
      </div>
    </div>
  )

  // Classic (default)
  return (
    <div style={{ ...baseStyle, display: 'flex', flexDirection: 'column' }}>
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 2.5, height: '100%', background: accent }} />
      {/* Decoration top-right */}
      <div style={{ position: 'absolute', top: -15, right: -15, width: 50, height: 50, borderRadius: '50%', background: `${accent}08` }} />
      {/* Header */}
      <div style={{ padding: '10px 12px 0 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 7, fontWeight: 900, color: '#fff' }}>{initial}</span>
        </div>
        <div>
          <div style={{ fontSize: 4.5, fontWeight: 800, color: '#0A0F1E', letterSpacing: '-.01em' }}>VOTRE ENTREPRISE</div>
          <div style={{ fontSize: 3.5, color: '#9aa8b8' }}>Votre slogan ici</div>
        </div>
      </div>
      {/* Title zone */}
      <div style={{ flex: 1, padding: '0 12px 0 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 4, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: accent, marginBottom: 4 }}>DOCUMENT</div>
        <div style={{ fontSize: titleSize * 0.55, fontWeight: 900, color: '#0A0F1E', letterSpacing: '-.02em', lineHeight: 1.1 }}>{docTitle.toUpperCase()}</div>
        {/* Sep */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5, marginBottom: 4 }}>
          <div style={{ width: 14, height: 1.5, borderRadius: 1, background: accent }} />
          <div style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: `${accent}55` }} />
        </div>
      </div>
      {/* Footer */}
      <div style={{ padding: '0 12px 8px 10px' }}>
        <div style={{ height: .5, background: `linear-gradient(90deg,${accent}44,transparent)`, marginBottom: 4 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 3.5, color: '#a8b4c4', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 1 }}>Date</div>
            <div style={{ fontSize: 4.5, fontWeight: 600, color: '#0A0F1E' }}>{date}</div>
          </div>
          {/* Mini QR placeholder */}
          <div style={{ width: 14, height: 14, background: '#f5f7fa', border: '1px solid #e8e8e8', borderRadius: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 2, gap: 1 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ background: i < 3 ? '#999' : '#ddd', borderRadius: 0.5 }} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Block Renderers ───────────────────────────────────────────────────────────

function BlockPreview({ block, accentColor }: { block: DocBlock | any; accentColor: string }) {
  const style: React.CSSProperties = { marginBottom: 5, fontFamily: "'Times New Roman', serif" }

  switch (block.type) {
    case 'section':
      return (
        <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, marginTop: 4 }}>
          <div style={{ width: 2, height: 7, background: accentColor, borderRadius: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 6, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#111' }}>
            {block.content || 'SECTION TITRE'}
          </span>
        </div>
      )

    case 'h1':
      return <div style={{ ...style, fontSize: 9.5, fontWeight: 900, color: '#111', letterSpacing: '-.02em', lineHeight: 1.2, marginBottom: 4, marginTop: 5 }}>{block.content || 'Titre H1'}</div>

    case 'h2':
      return <div style={{ ...style, fontSize: 8, fontWeight: 800, color: '#222', lineHeight: 1.2, marginBottom: 3, marginTop: 4 }}>{block.content || 'Titre H2'}</div>

    case 'h3':
      return <div style={{ ...style, fontSize: 7, fontWeight: 700, color: '#333', lineHeight: 1.2, marginBottom: 2, marginTop: 3 }}>{block.content || 'Titre H3'}</div>

    case 'h4':
      return <div style={{ ...style, fontSize: 6.5, fontWeight: 700, fontStyle: 'italic', color: '#444', lineHeight: 1.2, marginBottom: 2 }}>{block.content || 'Titre H4'}</div>

    case 'text': {
      const text = block.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'
      return (
        <p style={{ ...style, fontSize: 5.5, lineHeight: 1.75, color: '#444', textAlign: 'justify', margin: '0 0 4px' }}>
          {text}
        </p>
      )
    }

    case 'quote': {
      const text = block.content || '"L\'excellence opérationnelle est le fondement de toute croissance durable."'
      return (
        <div style={{ ...style, borderLeft: `1.5px solid ${accentColor}`, paddingLeft: 6, background: '#fafafa', padding: '4px 4px 4px 6px' }}>
          <p style={{ fontSize: 5.5, fontStyle: 'italic', color: '#222', lineHeight: 1.65, margin: 0 }}>{text}</p>
          <div style={{ fontSize: 4.5, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#999', marginTop: 2 }}>Direction Générale</div>
        </div>
      )
    }

    case 'divider':
      return (
        <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
          <div style={{ flex: 1, height: .5, background: '#e8e8e8' }} />
          <div style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: accentColor, opacity: .4 }} />
          <div style={{ flex: 1, height: .5, background: '#e8e8e8' }} />
        </div>
      )

    case 'table': {
      const td = block.tableData || {
        headers: ['Indicateur', 'Référence', 'Cible', 'Var.'],
        rows: [
          ["Chiffre d'Affaires", "9 200K", "12 000K", "+30%"],
          ["Marge Opérat.", "16%", "21%", "+5pt"],
          ["Effectifs", "34", "47", "+38%"],
        ]
      }
      return (
        <div style={{ ...style, overflowX: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 4.5 }}>
            <thead>
              <tr>
                {td.headers.map((h: string, i: number) => (
                  <th key={i} style={{ padding: '2px 3px', textAlign: 'left', fontSize: 4, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: accentColor, borderBottom: `1px solid ${accentColor}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {td.rows.slice(0, 4).map((row: string[], ri: number) => (
                <tr key={ri} style={{ background: ri % 2 ? '#fafafa' : '#fff' }}>
                  {row.map((cell: string, ci: number) => (
                    <td key={ci} style={{ padding: '2px 3px', color: '#555', borderBottom: '1px solid #f0f0f0' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'kpi': {
      let kpis = [
        { val: '12M FCFA', label: 'Revenus' },
        { val: '21%', label: 'Marge' },
        { val: '+38%', label: 'Croissance' },
        { val: '47', label: 'Effectifs' },
      ]
      try {
        if (block.content) kpis = JSON.parse(block.content)
      } catch {}
      return (
        <div style={{ ...style, display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`, gap: 3 }}>
          {kpis.slice(0, 4).map((k: any, i: number) => (
            <div key={i} style={{ background: '#F5F7FA', borderTop: `2px solid ${accentColor}`, borderRadius: '0 0 3px 3px', padding: '3px 4px', textAlign: 'center' }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '-.02em', color: '#111' }}>{k.val}</div>
              <div style={{ fontSize: 3.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#999', marginTop: 1 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )
    }

    case 'clause': {
      const lines = (block.content || 'Article 1 — Disposition\nLes parties s\'engagent à respecter l\'ensemble des termes et obligations stipulés dans le présent accord contractuel.').split('\n')
      return (
        <div style={{ ...style, background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 3, padding: '4px 5px' }}>
          <div style={{ fontSize: 4.5, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: accentColor, marginBottom: 3 }}>{lines[0] || 'Article'}</div>
          <p style={{ fontSize: 5, lineHeight: 1.7, color: '#555', fontStyle: 'italic', margin: 0 }}>{lines.slice(1).join(' ') || 'Contenu de la clause...'}</p>
        </div>
      )
    }

    case 'checklist': {
      const items = block.content ? block.content.split('\n').filter(Boolean) : ['Vérification point 1', 'Vérification point 2', 'Vérification point 3']
      return (
        <div style={style}>
          {items.slice(0, 5).map((item: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 3, marginBottom: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: 1.5, border: `1.5px solid ${accentColor}`, flexShrink: 0, marginTop: 0.5 }} />
              <span style={{ fontSize: 5, color: '#555', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>
      )
    }

    case 'bullet-list': {
      const items = block.content ? block.content.split('\n').filter(Boolean) : ['Premier élément', 'Deuxième élément', 'Troisième élément']
      return (
        <ul style={{ ...style, listStyle: 'disc', paddingLeft: 8, margin: '0 0 4px' }}>
          {items.slice(0, 5).map((item: string, i: number) => (
            <li key={i} style={{ fontSize: 5, lineHeight: 1.7, color: '#444' }}>{item}</li>
          ))}
        </ul>
      )
    }

    case 'numbered-list': {
      const items = block.content ? block.content.split('\n').filter(Boolean) : ['Premier élément', 'Deuxième élément', 'Troisième élément']
      return (
        <ol style={{ ...style, listStyleType: 'decimal', paddingLeft: 8, margin: '0 0 4px' }}>
          {items.slice(0, 5).map((item: string, i: number) => (
            <li key={i} style={{ fontSize: 5, lineHeight: 1.7, color: '#444' }}>{item}</li>
          ))}
        </ol>
      )
    }

    case 'sign':
      return (
        <div style={{ ...style, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 6 }}>
          {['Émetteur', 'Destinataire'].map(role => (
            <div key={role}>
              <div style={{ fontSize: 4, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>{role}</div>
              <div style={{ borderBottom: '1px solid #333', height: 12, marginBottom: 3 }} />
              <div style={{ fontSize: 4.5, color: '#888' }}>{role === 'Émetteur' ? 'Nom, Titre' : 'Nom, Titre'}</div>
              <div style={{ fontSize: 4, color: '#bbb', marginTop: 1 }}>Date : ___/___/2026</div>
            </div>
          ))}
        </div>
      )

    case 'image':
      return (
        <div style={{ ...style, background: '#f0f2f5', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, border: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, opacity: .4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#666" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#666"/><path d="M21 15l-5-5L5 21" stroke="#666" strokeWidth="1.5"/></svg>
            <span style={{ fontSize: 4, color: '#666', fontWeight: 600 }}>Image</span>
          </div>
        </div>
      )

    case 'chart':
      return (
        <div style={{ ...style, background: '#f9fafc', border: '1px solid #e8e8e8', borderRadius: 3, padding: '4px 5px', height: 30, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
          {[55, 75, 90, 68, 82, 95, 78].map((h, i) => (
            <div key={i} style={{ flex: 1, background: i === 6 ? accentColor : `${accentColor}55`, borderRadius: '2px 2px 0 0', height: `${h * 0.7}%` }} />
          ))}
        </div>
      )

    default:
      return null
  }
}

// ── Content Page Preview ──────────────────────────────────────────────────────

function ContentPagePreview({ blocks, accentColor, pageNumber }: { blocks: (DocBlock | any)[]; accentColor: string; pageNumber: number }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Times New Roman', serif",
    }}>
      {/* Accent side bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1.5, height: '100%', background: accentColor, opacity: .2 }} />

      {/* Header */}
      <div style={{
        height: 14, flexShrink: 0, borderBottom: `1px solid ${accentColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 8px 0 6px',
      }}>
        <span style={{ fontSize: 4, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>VOTRE ENTREPRISE</span>
        <span style={{ fontSize: 4, color: '#ccc', fontFamily: 'monospace' }}>CONFIDENTIEL</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '6px 8px 4px 7px', overflow: 'hidden' }}>
        {blocks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, padding: '4px 0' }}>
            {[85, 70, 90, 55, 80, 65, 75, 50].map((w, i) => (
              <div key={i} style={{ height: 3, background: '#f0f0f0', borderRadius: 1.5, width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {blocks.slice(0, 12).map((block, i) => (
              <BlockPreview key={i} block={block} accentColor={accentColor} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        height: 11, flexShrink: 0, borderTop: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 8px 0 6px',
      }}>
        <span style={{ fontSize: 3.5, color: '#ddd', letterSpacing: '.08em' }}>Généré par EETRA</span>
        <span style={{ fontFamily: 'monospace', fontSize: 4, color: '#bbb' }}>{pageNumber}</span>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TemplatePreview({ blocks, coverStyle, name, accentColor = '#1B4FD8' }: TemplatePreviewProps) {
  const accent = coverStyle?.accentColor || accentColor
  const PAGE_RATIO = 1 / 0.707 // A4 ratio (height/width)

  // Split blocks into pages (simulate ~8 blocks per page)
  const BLOCKS_PER_PAGE = 8
  const pageChunks: (DocBlock | any)[][] = []
  for (let i = 0; i < Math.max(blocks.length, 1); i += BLOCKS_PER_PAGE) {
    pageChunks.push(blocks.slice(i, i + BLOCKS_PER_PAGE))
  }
  const contentPages = pageChunks.slice(0, 2) // show max 2 content pages

  return (
    <div style={{ display: 'flex', gap: 10, height: '100%', width: '100%', alignItems: 'flex-start' }}>
      {/* Cover page */}
      <div style={{
        width: 110,
        flexShrink: 0,
        aspectRatio: '0.707',
        borderRadius: 5,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,.18), 0 1px 4px rgba(0,0,0,.1)',
        border: '1px solid rgba(0,0,0,.08)',
        background: '#fff',
      }}>
        <CoverPagePreview coverStyle={coverStyle} name={name} accentColor={accent} />
      </div>

      {/* Content pages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        {contentPages.map((pageBlocks, idx) => (
          <div key={idx} style={{
            width: '100%',
            aspectRatio: '0.707',
            maxHeight: 220,
            borderRadius: 5,
            overflow: 'hidden',
            boxShadow: '0 3px 14px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.08)',
            border: '1px solid rgba(0,0,0,.08)',
            background: '#fff',
          }}>
            <ContentPagePreview
              blocks={pageBlocks}
              accentColor={accent}
              pageNumber={idx + 2}
            />
          </div>
        ))}
        {blocks.length === 0 && (
          <div style={{
            width: '100%',
            aspectRatio: '0.707',
            maxHeight: 220,
            borderRadius: 5,
            overflow: 'hidden',
            boxShadow: '0 3px 14px rgba(0,0,0,.12)',
            border: '1px solid rgba(0,0,0,.08)',
          }}>
            <ContentPagePreview blocks={[]} accentColor={accent} pageNumber={2} />
          </div>
        )}
      </div>
    </div>
  )
}