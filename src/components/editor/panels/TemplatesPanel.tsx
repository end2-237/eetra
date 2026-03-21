'use client'

import { Grid, Layout } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/Button'
import { TEMPLATES } from '@/lib/templates'
import { generateId } from '@/lib/utils'
import { DocBlock } from '@/types'

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

// Professional inline SVG icons for each template type
const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  bp: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3h18v4H3V3z" fill="currentColor" opacity=".15"/>
      <path d="M3 3h18v4H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M3 9h11v2H3V9z" fill="currentColor" opacity=".3"/>
      <path d="M3 13h8v2H3v-2z" fill="currentColor" opacity=".2"/>
      <path d="M16 11l2 3 3-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 17h6v2H3v-2z" fill="currentColor" opacity=".15"/>
      <rect x="16" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  ),
  ao: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="18" cy="18" r="4" fill="currentColor" opacity=".2"/>
      <path d="M16.5 18h3M18 16.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  audit: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="2" fill="currentColor" opacity=".2"/>
    </svg>
  ),
  memo: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4a1 1 0 00-1 1v16l4-2h13a1 1 0 001-1V3a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M20 2H4a1 1 0 00-1 1v16l4-2h13a1 1 0 001-1V3a1 1 0 00-1-1z" fill="currentColor" opacity=".07"/>
      <path d="M7 8h10M7 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  contrat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  devis: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="2" y="4" width="20" height="4" rx="1" fill="currentColor" opacity=".15"/>
      <path d="M6 13h4M14 13h4M6 16h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

// Layout preview mini icons
const LAYOUT_ICONS: Record<string, string> = {
  classic:  '▎',
  bold:     '■',
  minimal:  '—',
  split:    '▌',
}

export function TemplatesPanel({ showToast }: Props) {
  const { selectedTemplate, setSelectedTemplate, pages, currentPageIndex, setPageBlocks, setCoverStyle } = useDocument()
  const { profile } = useProfile()

  function applyTemplate() {
    const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
    if (!tpl) return
    const page = pages[currentPageIndex]
    if (!page) { showToast('Ajoutez d\'abord une page', 'err'); return }

    // Apply cover style from template
    if (tpl.coverStyle) {
      setCoverStyle(tpl.coverStyle)
    }

    // Apply blocks
    const en = profile.name || '[Entité]'
    const newBlocks: DocBlock[] = tpl.blocks.map(b => ({
      id: generateId(),
      type: b.type,
      content: b.content?.replace(/\[Entité\]/g, en),
      tableData: b.tableData,
    }))
    setPageBlocks(page.id, newBlocks)
    showToast(`"${tpl.name}" appliqué — ${newBlocks.length} blocs + couverture ${tpl.coverStyle?.layout || 'classic'}`, 'ok')
  }

  return (
    <div className="w-[272px] min-w-[272px] border-r overflow-y-auto hide-scroll flex flex-col"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Grid size={13} color="var(--accent)" strokeWidth={2} />
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Smart Templates</span>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {TEMPLATES.map(tpl => (
            <div key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id === selectedTemplate ? null : tpl.id)}
              className="px-3.5 py-3 rounded-xl border cursor-pointer transition-all duration-150"
              style={selectedTemplate === tpl.id
                ? { background: 'var(--accentS)', borderColor: 'var(--accent)' }
                : { background: 'var(--surface)', borderColor: 'var(--border)' }
              }
              onMouseEnter={e => { if (selectedTemplate !== tpl.id) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; } }}
              onMouseLeave={e => { if (selectedTemplate !== tpl.id) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; } }}
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Professional SVG Icon */}
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: 32, height: 32,
                    background: selectedTemplate === tpl.id ? 'var(--accentS2)' : 'var(--bg3)',
                    color: selectedTemplate === tpl.id ? 'var(--accent)' : 'var(--text3)',
                  }}
                >
                  {TEMPLATE_ICONS[tpl.icon] || TEMPLATE_ICONS['memo']}
                </div>
                <span className="text-[13px] font-bold flex-1" style={{ color: 'var(--text)' }}>{tpl.name}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                  {tpl.blocks.length} blocs
                </span>
              </div>
              <p className="text-[11px] pl-10" style={{ color: 'var(--text4)' }}>{tpl.desc}</p>

              {/* Cover layout indicator */}
              {tpl.coverStyle && (
                <div className="flex items-center gap-1.5 mt-2 pl-10">
                  <Layout size={10} color="var(--text4)" />
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text4)' }}>
                    Couverture {tpl.coverStyle.layout}
                  </span>
                  {tpl.coverStyle.accentColor && (
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: tpl.coverStyle.accentColor, flexShrink: 0,
                    }} />
                  )}
                </div>
              )}

              <div className="flex gap-1 flex-wrap mt-2 pl-10">
                {tpl.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="h-px mb-4" style={{ background: 'var(--border)' }} />
        <Button variant="primary" fullWidth disabled={!selectedTemplate} onClick={applyTemplate}>
          Appliquer le template →
        </Button>
        {selectedTemplate && (() => {
          const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
          return tpl?.coverStyle ? (
            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text4)' }}>
              Applique aussi la couverture <strong>{tpl.coverStyle.layout}</strong>
            </p>
          ) : null
        })()}
      </div>
    </div>
  )
}