'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'

interface Props {
  status: string
  showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void
}

export function Topbar({ status, showToast }: Props) {
  const { zoom, setZoom, docId, addPage } = useDocument()

  const zoomLevels = [
    { label: '100%', value: 1 },
    { label: '75%',  value: 0.75 },
    { label: '55%',  value: 0.55 },
  ]

  return (
    <div className="h-[52px] flex items-center justify-between px-4 border-b flex-shrink-0"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Status */}
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--success)' }} />
        <span className="font-mono text-[11px]" style={{ color: 'var(--text3)' }}>{status}</span>
        <span style={{ color: 'var(--border2)' }}>·</span>
        <span className="font-mono text-[11px]" style={{ color: 'var(--text4)' }}>{docId}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {zoomLevels.map(z => (
          <button key={z.label} onClick={() => setZoom(z.value)}
            className="px-2.5 py-1 rounded-md text-[11px] cursor-pointer border transition-all font-mono"
            style={zoom === z.value
              ? { color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accentS)' }
              : { color: 'var(--text3)', borderColor: 'transparent', background: 'transparent' }
            }>
            {z.label}
          </button>
        ))}
        <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />
        <Button variant="ghost" size="sm" onClick={addPage}>+ Page</Button>
        <Button variant="primary" size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent('eetra:export-pdf'))}>
          <Download size={12} />
          PDF
        </Button>
      </div>
    </div>
  )
}
