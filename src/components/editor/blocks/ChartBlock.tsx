'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { BarChart2, TrendingUp, PieChart, Settings, X, Plus, Trash2 } from 'lucide-react'

type ChartType = 'bar' | 'line' | 'pie' | 'donut'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

interface ChartBlockProps {
  blockId: string
  initialType?: ChartType
  initialData?: ChartData
  initialTitle?: string
  accentColor?: string
  onUpdate?: (data: { type: ChartType; data: ChartData; title: string }) => void
}

const DEFAULT_COLORS = ['#1B4FD8', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0E7490', '#374151']

const DEFAULT_DATA: ChartData = {
  labels: ['T1 2026', 'T2 2026', 'T3 2026', 'T4 2026'],
  datasets: [{
    label: 'Chiffre d\'Affaires',
    data: [2800000, 3200000, 2900000, 4100000],
    color: '#1B4FD8',
  }],
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return n.toString()
}

export function ChartBlock({
  blockId,
  initialType = 'bar',
  initialData = DEFAULT_DATA,
  initialTitle = 'Évolution des Performances',
  accentColor = '#1B4FD8',
  onUpdate,
}: ChartBlockProps) {
  const [chartType, setChartType] = useState<ChartType>(initialType)
  const [chartData, setChartData] = useState<ChartData>(initialData)
  const [title, setTitle] = useState(initialTitle)
  const [showEditor, setShowEditor] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  const drawChart = useCallback(async () => {
    if (!canvasRef.current || typeof window === 'undefined') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Dynamically import Chart.js
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const datasets = chartData.datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: chartType === 'pie' || chartType === 'donut'
        ? DEFAULT_COLORS.slice(0, ds.data.length).map(c => c + 'CC')
        : (ds.color || DEFAULT_COLORS[i]) + '99',
      borderColor: chartType === 'pie' || chartType === 'donut'
        ? DEFAULT_COLORS.slice(0, ds.data.length)
        : ds.color || DEFAULT_COLORS[i],
      borderWidth: chartType === 'line' ? 2 : 1.5,
      tension: chartType === 'line' ? 0.4 : 0,
      fill: chartType === 'line' ? false : undefined,
      pointBackgroundColor: ds.color || DEFAULT_COLORS[i],
      pointRadius: chartType === 'line' ? 4 : 0,
    }))

    const type = chartType === 'donut' ? 'doughnut' : chartType

    chartRef.current = new Chart(ctx, {
      type: type as any,
      data: { labels: chartData.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: chartType === 'pie' || chartType === 'donut',
            position: 'bottom',
            labels: { font: { size: 10, family: 'Bricolage Grotesque, sans-serif' }, padding: 12, boxWidth: 10 },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const val = ctx.parsed.y ?? ctx.parsed
                return ` ${ctx.dataset.label}: ${formatNumber(val)}`
              }
            }
          }
        },
        scales: (chartType === 'bar' || chartType === 'line') ? {
          x: {
            grid: { color: 'rgba(0,0,0,.05)', lineWidth: 0.5 },
            ticks: { font: { size: 9, family: 'Bricolage Grotesque, sans-serif' }, color: '#9CA3AF' }
          },
          y: {
            grid: { color: 'rgba(0,0,0,.06)', lineWidth: 0.5 },
            ticks: { font: { size: 9, family: 'Bricolage Grotesque, sans-serif' }, color: '#9CA3AF', callback: (v: any) => formatNumber(v) }
          },
        } : undefined,
      },
    })
  }, [chartType, chartData])

  useEffect(() => {
    drawChart()
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [drawChart])

  const CHART_TYPES: { id: ChartType; icon: React.ReactNode; label: string }[] = [
    { id: 'bar',    icon: <BarChart2 size={13} />, label: 'Barres' },
    { id: 'line',   icon: <TrendingUp size={13} />, label: 'Ligne' },
    { id: 'pie',    icon: <PieChart size={13} />, label: 'Camembert' },
    { id: 'donut',  icon: <PieChart size={13} />, label: 'Donut' },
  ]

  const addRow = () => {
    const newLabel = `Label ${chartData.labels.length + 1}`
    setChartData(prev => ({
      ...prev,
      labels: [...prev.labels, newLabel],
      datasets: prev.datasets.map(ds => ({ ...ds, data: [...ds.data, 0] })),
    }))
  }

  const updateLabel = (i: number, val: string) => {
    setChartData(prev => ({ ...prev, labels: prev.labels.map((l, idx) => idx === i ? val : l) }))
  }

  const updateValue = (dsIdx: number, valIdx: number, val: string) => {
    const num = parseFloat(val.replace(/[^\d.-]/g, '')) || 0
    setChartData(prev => ({
      ...prev,
      datasets: prev.datasets.map((ds, i) => i === dsIdx
        ? { ...ds, data: ds.data.map((d, j) => j === valIdx ? num : d) }
        : ds
      ),
    }))
  }

  const removeRow = (i: number) => {
    setChartData(prev => ({
      ...prev,
      labels: prev.labels.filter((_, idx) => idx !== i),
      datasets: prev.datasets.map(ds => ({ ...ds, data: ds.data.filter((_, idx) => idx !== i) })),
    }))
  }

  const addDataset = () => {
    const newDs = {
      label: `Série ${chartData.datasets.length + 1}`,
      data: new Array(chartData.labels.length).fill(0),
      color: DEFAULT_COLORS[chartData.datasets.length % DEFAULT_COLORS.length],
    }
    setChartData(prev => ({ ...prev, datasets: [...prev.datasets, newDs] }))
  }

  return (
    <div>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 14, background: accentColor, borderRadius: 2, flexShrink: 0 }} />
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={e => { setTitle(e.currentTarget.textContent || ''); onUpdate?.({ type: chartType, data: chartData, title: e.currentTarget.textContent || '' }) }}
            style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#111', outline: 'none', cursor: 'text' }}
          >
            {title}
          </span>
        </div>
        <div className="pdf-hidden" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Chart type switcher */}
          <div style={{ display: 'flex', gap: 2, background: '#f5f7fa', borderRadius: 8, padding: 2 }}>
            {CHART_TYPES.map(ct => (
              <button key={ct.id} onClick={() => { setChartType(ct.id); onUpdate?.({ type: ct.id, data: chartData, title }) }}
                title={ct.label}
                style={{ padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: chartType === ct.id ? accentColor : 'transparent', color: chartType === ct.id ? '#fff' : '#888' }}>
                {ct.icon}
              </button>
            ))}
          </div>
          <button onClick={() => setShowEditor(!showEditor)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: '1px solid #e8e8e8', background: showEditor ? accentColor : 'white', color: showEditor ? '#fff' : '#555', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
            <Settings size={11} /> Données
          </button>
        </div>
      </div>

      {/* Chart canvas */}
      <div style={{ position: 'relative', height: 200, marginBottom: showEditor ? 12 : 0 }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Data editor */}
      {showEditor && (
        <div className="pdf-hidden" style={{ background: '#f9fafc', border: '1px solid #e8e8e8', borderRadius: 10, padding: 14, marginTop: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Données
            </div>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: `120px ${chartData.datasets.map(() => '1fr').join(' ')} 28px`, gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: '#aaa', fontWeight: 700 }}>Libellé</span>
              {chartData.datasets.map((ds, i) => (
                <input key={i} value={ds.label}
                  onChange={e => setChartData(prev => ({ ...prev, datasets: prev.datasets.map((d, di) => di === i ? { ...d, label: e.target.value } : d) }))}
                  style={{ fontSize: 9, fontWeight: 700, border: 'none', background: 'transparent', outline: 'none', color: ds.color || '#1B4FD8', textAlign: 'center' }} />
              ))}
              <span />
            </div>

            {/* Rows */}
            {chartData.labels.map((label, li) => (
              <div key={li} style={{ display: 'grid', gridTemplateColumns: `120px ${chartData.datasets.map(() => '1fr').join(' ')} 28px`, gap: 6, marginBottom: 4 }}>
                <input value={label} onChange={e => updateLabel(li, e.target.value)}
                  style={{ fontSize: 11, padding: '4px 8px', border: '1px solid #e8e8e8', borderRadius: 6, outline: 'none', background: '#fff', color: '#555' }} />
                {chartData.datasets.map((ds, di) => (
                  <input key={di} type="number" value={ds.data[li]}
                    onChange={e => updateValue(di, li, e.target.value)}
                    style={{ fontSize: 11, padding: '4px 8px', border: '1px solid #e8e8e8', borderRadius: 6, outline: 'none', background: '#fff', color: '#333', textAlign: 'right' }} />
                ))}
                <button onClick={() => removeRow(li)} disabled={chartData.labels.length <= 2}
                  style={{ width: 24, height: 24, border: 'none', borderRadius: 5, background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <Trash2 size={9} />
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1px dashed ${accentColor}50`, background: `${accentColor}10`, color: accentColor, cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
                <Plus size={10} /> Ajouter une ligne
              </button>
              {chartData.datasets.length < 3 && (
                <button onClick={addDataset} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px dashed #e8e8e8', background: '#f5f7fa', color: '#888', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
                  <Plus size={10} /> Série
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
