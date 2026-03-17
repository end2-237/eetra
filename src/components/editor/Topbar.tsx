'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { usePlan } from '@/contexts/PlanContext'
import { Button } from '@/components/ui/Button'
import { Download, Undo2, Redo2, FilePlus } from 'lucide-react'

interface Props {
  status: string
  showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void
}

const PLAN_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  starter: { bg: 'rgba(107,114,128,.12)', text: '#6B7280' },
  pro:     { bg: 'rgba(27,79,216,.1)',    text: '#1B4FD8' },
  business:{ bg: 'rgba(5,150,105,.1)',    text: '#059669' },
}

export function Topbar({ status, showToast }: Props) {
  const { zoom, setZoom, docId, addPage, pages, canUndo, canRedo, undo, redo } = useDocument()
  const { plan, planId, canAddPage, requestUpgrade } = usePlan()

  const zoomLevels = [
    { label: '100%', value: 1 },
    { label: '75%', value: 0.75 },
    { label: '55%', value: 0.55 },
  ]

  const badge = PLAN_BADGE_COLORS[planId] || PLAN_BADGE_COLORS.pro

  const handleAddPage = () => {
    if (!canAddPage(pages.length)) {
      requestUpgrade(`Le plan ${plan.label} est limité à ${plan.maxPagesPerDoc} page(s) par document. Passez au plan Pro pour des pages illimitées.`)
      return
    }
    addPage()
  }

  const btnIcon = {
    width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
    background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all .12s',
  }

  return (
    <div
      className="h-[52px] flex items-center justify-between px-4 border-b flex-shrink-0"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Left: status + plan badge */}
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--success)' }} />
        <span className="font-mono text-[11px]" style={{ color: 'var(--text3)' }}>{status}</span>
        <span style={{ color: 'var(--border2)' }}>·</span>
        <span className="font-mono text-[11px]" style={{ color: 'var(--text4)' }}>{docId}</span>
        <div
          style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 20, ...badge,
          }}
        >
          {plan.label}
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <button
          onClick={() => { if (canUndo) undo() }}
          title="Annuler (Ctrl+Z)"
          style={{ ...btnIcon, opacity: canUndo ? 1 : 0.35, color: 'var(--text3)' }}
          onMouseEnter={e => { if (canUndo) (e.currentTarget).style.background = 'var(--bg3)' }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent' }}
        >
          <Undo2 size={13} />
        </button>
        <button
          onClick={() => { if (canRedo) redo() }}
          title="Rétablir (Ctrl+Y)"
          style={{ ...btnIcon, opacity: canRedo ? 1 : 0.35, color: 'var(--text3)' }}
          onMouseEnter={e => { if (canRedo) (e.currentTarget).style.background = 'var(--bg3)' }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent' }}
        >
          <Redo2 size={13} />
        </button>

        <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />

        {/* Zoom */}
        {zoomLevels.map(z => (
          <button key={z.label} onClick={() => setZoom(z.value)}
            className="px-2.5 py-1 rounded-md text-[11px] cursor-pointer border transition-all font-mono"
            style={zoom === z.value
              ? { color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accentS)' }
              : { color: 'var(--text3)', borderColor: 'transparent', background: 'transparent' }
            }
          >
            {z.label}
          </button>
        ))}

        <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />

        <Button variant="ghost" size="sm" onClick={handleAddPage}>
          <FilePlus size={12} /> Page
        </Button>
        <Button variant="primary" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('eetra:export-pdf'))}>
          <Download size={12} /> PDF
        </Button>
      </div>
    </div>
  )
}
