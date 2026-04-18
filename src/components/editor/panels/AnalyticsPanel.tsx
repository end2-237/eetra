'use client'
import { BarChart2 } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'

export function AnalyticsPanel() {
  const { pages } = useDocument()
  const allBlocks = pages.flatMap(p => p.blocks)
  const total = allBlocks.length
  const wordCount = pages.reduce((acc, p) => acc + p.blocks.reduce((a, b) => a + (b.content?.split(/\s+/).filter(Boolean).length || 0), 0), 0)
  const typeCount: Record<string, number> = {}
  allBlocks.forEach(b => { typeCount[b.type] = (typeCount[b.type] || 0) + 1 })
  const score = Math.min(100, Math.round((total / 10) * 100))
  const bars = [{ label: 'Mots', val: wordCount, max: 600 }, { label: 'Blocs', val: total, max: 12 }, { label: 'Pages', val: pages.length + 1, max: 8 }]

  return (
    <div style={{
      width: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'var(--bg2)',
      boxSizing: 'border-box',
    }}>
      <div style={{ padding: '12px 14px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <BarChart2 size={13} color="var(--accent)" strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Structure Analytics</span>
        </div>
        {total === 0 ? (
          <p style={{ fontSize: 12, textAlign: 'center', padding: '24px 0', color: 'var(--text4)' }}>
            Ajoutez des blocs pour voir les analytics.
          </p>
        ) : (
          <>
            <div style={{
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 14,
              border: '1px solid var(--accentS2)',
              background: 'var(--accentS)',
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--text3)', marginBottom: 4 }}>
                Score Complétude
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)' }}>{score}%</div>
              <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text4)' }}>
                {total} blocs · {wordCount} mots · {pages.length + 1} page{pages.length > 0 ? 's' : ''}
              </div>
            </div>

            {bars.map(({ label, val, max }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{val}</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, overflow: 'hidden', background: 'var(--bg3)' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 99,
                    background: 'var(--accent)',
                    width: `${Math.min(100, (val / max) * 100)}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}

            <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--text4)', marginBottom: 10 }}>
              Répartition
            </div>

            {Object.entries(typeCount).map(([t, c]) => (
              <div key={t} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase' }}>{t}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 7px', borderRadius: 99,
                  background: 'var(--accentS2)', color: 'var(--accent)',
                }}>{c}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}