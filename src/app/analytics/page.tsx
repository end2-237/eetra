'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter }    from 'next/navigation'
import {
  ArrowLeft, TrendingUp, FileText, Download,
  Users, BarChart2, RefreshCw, Calendar,
} from 'lucide-react'
import { useLibrary }   from '@/contexts/LibraryContext'
import { useHistory }   from '@/contexts/HistoryContext'
import { useTeam }      from '@/contexts/TeamContext'
import { ThemeToggle }  from '@/components/ui/ThemeToggle'

// ── Inline Chart (no external lib needed beyond chart.js) ─────────────────────

function LineChart({
  data, labels, color = '#1B4FD8', height = 120,
}: {
  data: number[]; labels: string[]; color?: string; height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables)
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }

      chartRef.current = new Chart(canvasRef.current!, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data,
            borderColor:     color,
            backgroundColor: `${color}18`,
            fill:            true,
            tension:         0.4,
            borderWidth:     2,
            pointRadius:     3,
            pointBackgroundColor: color,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#9CA3AF' } },
            y: {
              grid: { color: 'rgba(0,0,0,.05)' },
              ticks: { font: { size: 9 }, color: '#9CA3AF', maxTicksLimit: 5 },
              beginAtZero: true,
            },
          },
        },
      })
    }).catch(() => {})

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [data, labels, color])

  return <div style={{ height, position: 'relative' }}><canvas ref={canvasRef} /></div>
}

function DonutChart({
  values, labels, colors, size = 120,
}: {
  values: number[]; labels: string[]; colors: string[]; size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current || !values.length || values.every(v => v === 0)) return

    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables)
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }

      chartRef.current = new Chart(canvasRef.current!, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data:            values,
            backgroundColor: colors.map(c => `${c}CC`),
            borderColor:     colors,
            borderWidth:     1.5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}`,
              },
            },
          },
        },
      })
    }).catch(() => {})

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [values, labels, colors])

  return <div style={{ height: size, width: size, margin: '0 auto', position: 'relative' }}><canvas ref={canvasRef} /></div>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  })
}

function getLast6Months(): string[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  })
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  .ana-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }
  .ana-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .ana-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .ana-back:hover { color:var(--text); }
  .ana-body { max-width:1200px; margin:0 auto; padding:24px 20px 48px; }
  .ana-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
  .ana-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
  .ana-grid-3 { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:14px; }
  .ana-card { border:1px solid var(--border); border-radius:8px; background:var(--surface); padding:16px; }
  .ana-card-head { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--text4); margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; }
  .ana-stat-val { font-size:28px; font-weight:800; letter-spacing:-.03em; color:var(--text); line-height:1; margin:8px 0 3px; }
  .ana-stat-label { font-size:11px; color:var(--text4); }
  .ana-stat-delta { font-size:10px; font-weight:700; display:inline-flex; align-items:center; gap:2px; padding:1px 6px; border-radius:4px; }
  .ana-stat-delta.up   { background:rgba(5,150,105,.1);  color:#059669; }
  .ana-stat-delta.down { background:rgba(220,38,38,.1);  color:#DC2626; }
  .ana-stat-delta.neutral { background:var(--bg3); color:var(--text4); }

  .ana-legend-item { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text3); }
  .ana-legend-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

  .ana-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); }
  .ana-row:last-child { border-bottom:none; padding-bottom:0; }

  @media (max-width:767px) {
    .ana-grid-4 { grid-template-columns: 1fr 1fr !important; }
    .ana-grid-2 { grid-template-columns: 1fr !important; }
    .ana-grid-3 { grid-template-columns: 1fr !important; }
  }
`

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router          = useRouter()
  const { documents }   = useLibrary()
  const { entries }     = useHistory()
  const { members }     = useTeam()
  const [range, setRange] = useState<'7d' | '30d' | '6m'>('7d')

  // ── Build data series ──────────────────────────────────────────────────────

  const today    = new Date()
  const last7    = getLast7Days()
  const last6m   = getLast6Months()

  // Documents created per day (last 7 days)
  const docsPerDay = last7.map((day, i) => {
    const target = new Date(); target.setDate(target.getDate() - (6 - i))
    return documents.filter(d => {
      const dd = new Date(d.updatedAt)
      return dd.toDateString() === target.toDateString()
    }).length
  })

  // Exports per day
  const exportsPerDay = last7.map((day, i) => {
    const target = new Date(); target.setDate(target.getDate() - (6 - i))
    return entries.filter(e => {
      return e.exportedAt.toDateString() === target.toDateString()
    }).length
  })

  // Block type distribution
  const blockTypeCounts: Record<string, number> = {}
  documents.forEach(doc => {
    (doc.pages || []).forEach((page: any) => {
      (page.blocks || []).forEach((block: any) => {
        blockTypeCounts[block.type] = (blockTypeCounts[block.type] || 0) + 1
      })
    })
  })
  const blockEntries = Object.entries(blockTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const BLOCK_COLORS = ['#1B4FD8', '#059669', '#7C3AED', '#D97706', '#DC2626']

  // Totals
  const totalBlocks = Object.values(blockTypeCounts).reduce((a, b) => a + b, 0)
  const totalPages  = documents.reduce((a, d) => a + (d.pageCount || 0), 0)
  const avgScore    = documents.length ? Math.min(100, Math.round((totalBlocks / (documents.length * 8)) * 100)) : 0

  // Recent exports table
  const recentExports = entries.slice(0, 8)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="ana-page">

        {/* Topbar */}
        <header className="ana-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="ana-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13} /> Tableau de bord
            </button>
            <span style={{ color: 'var(--border2)' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Analytics</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            {/* Range picker */}
            <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 7, padding: 3, border: '1px solid var(--border)', gap: 2 }}>
              {(['7d', '30d', '6m'] as const).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: range === r ? 'var(--accent)' : 'transparent', color: range === r ? '#fff' : 'var(--text4)' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="ana-body">

          {/* Page title */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Vue Analytics</h1>
            <p style={{ fontSize: 11, color: 'var(--text4)', margin: '3px 0 0' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* KPI cards */}
          <div className="ana-grid-4">
            {[
              { icon: FileText,  color: '#1B4FD8', label: 'Documents',    val: documents.length,    delta: '+12%', dir: 'up'      as const },
              { icon: Download,  color: '#059669', label: 'Exports',      val: entries.length,      delta: '+8%',  dir: 'up'      as const },
              { icon: BarChart2, color: '#7C3AED', label: 'Blocs créés',  val: totalBlocks,         delta: `${avgScore}%`, dir: 'neutral' as const },
              { icon: Users,     color: '#D97706', label: 'Membres',      val: members.length,      delta: `${totalPages}p`, dir: 'neutral' as const },
            ].map(({ icon: Icon, color, label, val, delta, dir }) => (
              <div key={label} className="ana-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={color} />
                  </div>
                  <span className={`ana-stat-delta ${dir}`}>{delta}</span>
                </div>
                <div className="ana-stat-val">{val}</div>
                <div className="ana-stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="ana-grid-3">

            {/* Documents activity */}
            <div className="ana-card">
              <div className="ana-card-head">
                <span>Activité documents — 7 derniers jours</span>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span className="ana-legend-item"><span className="ana-legend-dot" style={{ background: '#1B4FD8' }} />Modifiés</span>
                  <span className="ana-legend-item"><span className="ana-legend-dot" style={{ background: '#059669' }} />Exportés</span>
                </div>
              </div>
              <div style={{ position: 'relative', height: 140 }}>
                <LineChart data={docsPerDay}    labels={last7} color="#1B4FD8" height={140} />
              </div>
              <div style={{ marginTop: 8, height: 50, position: 'relative' }}>
                <LineChart data={exportsPerDay} labels={last7} color="#059669" height={50} />
              </div>
            </div>

            {/* Block distribution */}
            <div className="ana-card">
              <div className="ana-card-head">Répartition des blocs</div>
              {totalBlocks > 0 ? (
                <>
                  <DonutChart
                    values={blockEntries.map(([, v]) => v)}
                    labels={blockEntries.map(([k]) => k)}
                    colors={BLOCK_COLORS}
                    size={110}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
                    {blockEntries.map(([type, count], i) => (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLOCK_COLORS[i], flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1, textTransform: 'capitalize' }}>{type}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text4)', fontFamily: 'monospace' }}>
                          {Math.round(count / totalBlocks * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text4)', fontSize: 12 }}>
                  Créez des documents pour voir la répartition
                </div>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="ana-grid-2">

            {/* Recent exports */}
            <div className="ana-card">
              <div className="ana-card-head">Exports récents</div>
              {recentExports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text4)', fontSize: 12 }}>
                  Aucun export enregistré
                </div>
              ) : (
                recentExports.map(e => (
                  <div key={e.id} className="ana-row">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        {e.title || 'Sans titre'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>
                        {e.exportedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        · {e.pageCount}p · {e.blockCount} blocs
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(5,150,105,.1)', color: '#059669', flexShrink: 0 }}>
                      PDF
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Document scores */}
            <div className="ana-card">
              <div className="ana-card-head">Score de complétude</div>
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text4)', fontSize: 12 }}>
                  Aucun document
                </div>
              ) : (
                documents.slice(0, 6).map(doc => {
                  const score = Math.min(100, Math.round(((doc.blockCount || 0) / 8) * 100))
                  const color = score >= 80 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'
                  return (
                    <div key={doc.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                          {doc.title || 'Sans titre'}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>{score}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 2, background: color, width: `${score}%`, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  )
                })
              )}

              {/* Avg score big number */}
              {documents.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px', borderRadius: 8, background: 'var(--accentS)', border: '1px solid var(--accentS2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 3 }}>Score moyen</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-.02em' }}>{avgScore}%</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
