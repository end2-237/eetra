'use client'

import { BarChart2 } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'

export function AnalyticsPanel() {
  const { pages } = useDocument()
  const allBlocks = pages.flatMap(p => p.blocks)
  const total = allBlocks.length
  const wordCount = pages.reduce((acc, p) => {
    return acc + p.blocks.reduce((a, b) => a + (b.content?.split(/\s+/).filter(Boolean).length || 0), 0)
  }, 0)
  const typeCount: Record<string, number> = {}
  allBlocks.forEach(b => { typeCount[b.type] = (typeCount[b.type] || 0) + 1 })
  const score = Math.min(100, Math.round((total / 8) * 100))

  const bars = [
    { label: 'Mots', val: wordCount, max: 600 },
    { label: 'Blocs', val: total, max: 8 },
    { label: 'Pages', val: pages.length + 1, max: 6 },
  ]

  return (
    <div className="w-[272px] min-w-[272px] border-r overflow-y-auto hide-scroll"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={13} color="var(--accent)" strokeWidth={2} />
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Structure Analytics</span>
        </div>

        {total === 0 ? (
          <p className="text-[12px] text-center py-8" style={{ color: 'var(--text4)' }}>
            Ajoutez des blocs pour voir les analytics.
          </p>
        ) : (
          <>
            <div className="rounded-xl p-4 mb-4 border"
              style={{ background: 'var(--accentS)', borderColor: 'var(--accentS2)' }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text3)' }}>
                Score Complétude
              </div>
              <div className="text-[36px] font-black" style={{ color: 'var(--accent)' }}>{score}%</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>
                {total} blocs · {wordCount} mots · {pages.length + 1} page{pages.length > 0 ? 's' : ''}
              </div>
            </div>

            {bars.map(({ label, val, max }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{label}</span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>{val}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ background: 'var(--accent)', width: `${Math.min(100, (val / max) * 100)}%` }} />
                </div>
              </div>
            ))}

            <div className="h-px my-4" style={{ background: 'var(--border)' }} />
            <div className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text4)' }}>
              Répartition
            </div>
            {Object.entries(typeCount).map(([t, c]) => (
              <div key={t} className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[11px] uppercase font-500" style={{ color: 'var(--text3)', fontWeight: 500 }}>{t}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>{c}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
