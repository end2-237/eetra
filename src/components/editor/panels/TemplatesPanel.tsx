'use client'

import { Grid } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/Button'
import { TEMPLATES } from '@/lib/templates'
import { generateId } from '@/lib/utils'
import { DocBlock } from '@/types'

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

export function TemplatesPanel({ showToast }: Props) {
  const { selectedTemplate, setSelectedTemplate, pages, currentPageIndex, setPageBlocks } = useDocument()
  const { profile } = useProfile()

  function applyTemplate() {
    const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
    if (!tpl) return
    const page = pages[currentPageIndex]
    if (!page) { showToast('Ajoutez d\'abord une page', 'err'); return }
    const en = profile.name || '[Entité]'
    const newBlocks: DocBlock[] = tpl.blocks.map(b => ({
      id: generateId(),
      type: b.type,
      content: b.content?.replace(/\[Entité\]/g, en),
    }))
    setPageBlocks(page.id, newBlocks)
    showToast(`"${tpl.name}" appliqué`, 'ok')
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
                <span className="text-[16px]">{tpl.icon}</span>
                <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{tpl.name}</span>
                <span className="ml-auto text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                  {tpl.blocks.length} blocs
                </span>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text4)' }}>{tpl.desc}</p>
              <div className="flex gap-1 flex-wrap mt-2">
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
      </div>
    </div>
  )
}
