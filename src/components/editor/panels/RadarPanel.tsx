'use client'

import { useMemo } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { Radar } from 'lucide-react'

// ── Radar chart SVG ──────────────────────────────────────────────────────────

function RadarChart({
  scores,
  labels,
  accent,
}: {
  scores: number[]
  labels: string[]
  accent: string
}) {
  const SIZE = 200
  const CX = SIZE / 2
  const CY = SIZE / 2
  const R = 76
  const n = scores.length
  const levels = [0.25, 0.5, 0.75, 1]

  function point(i: number, r: number): [number, number] {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)]
  }

  // Grid polygons
  const gridPaths = levels.map(level =>
    Array.from({ length: n }, (_, i) => point(i, R * level))
      .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
      .join(' ') + 'Z'
  )

  // Data polygon
  const dataPath =
    scores
      .map((s, i) => point(i, R * Math.min(1, s / 100)))
      .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
      .join(' ') + 'Z'

  return (
    <svg width={SIZE} height={SIZE + 32} viewBox={`0 0 ${SIZE} ${SIZE + 32}`}>
      {/* Grid lines */}
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth={0.8} />
      ))}
      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = point(i, R)
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--border)" strokeWidth={0.8} />
      })}
      {/* Data polygon */}
      <path d={dataPath} fill={`${accent}28`} stroke={accent} strokeWidth={1.8} strokeLinejoin="round" />
      {/* Data points */}
      {scores.map((s, i) => {
        const [x, y] = point(i, R * Math.min(1, s / 100))
        return <circle key={i} cx={x} cy={y} r={3.5} fill={accent} stroke="white" strokeWidth={1.5} />
      })}
      {/* Labels */}
      {labels.map((label, i) => {
        const [x, y] = point(i, R + 18)
        const anchor = x < CX - 4 ? 'end' : x > CX + 4 ? 'start' : 'middle'
        return (
          <text
            key={i}
            x={x}
            y={y + 4}
            textAnchor={anchor}
            fontSize={9}
            fontWeight={700}
            letterSpacing={0.3}
            fill="var(--text4)"
            style={{ fontFamily: 'inherit', textTransform: 'uppercase' }}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({
  label,
  score,
  detail,
  accent,
}: {
  label: string
  score: number
  detail: string
  accent: string
}) {
  const color = score >= 75 ? '#059669' : score >= 45 ? accent : '#DC2626'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color, fontFamily: 'monospace' }}>{score}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'var(--bg3)', overflow: 'hidden', marginBottom: 2 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 99, transition: 'width .4s ease' }} />
      </div>
      <div style={{ fontSize: 9, color: 'var(--text4)', lineHeight: 1.4 }}>{detail}</div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function RadarPanel() {
  const { pages, title, subtitle } = useDocument()
  const { profile } = useProfile()
  const accent = profile.color || '#1B4FD8'

  const allBlocks = useMemo(() => pages.flatMap(p => p.blocks), [pages])

  const metrics = useMemo(() => {
    const types = allBlocks.map(b => b.type)
    const total = allBlocks.length

    // Structure: h1/h2/h3/section present, divider
    const hasSection = types.filter(t => ['section', 'h1', 'h2'].includes(t)).length
    const structureScore = Math.min(100, Math.round(
      (hasSection > 0 ? 40 : 0) +
      (types.includes('divider') ? 15 : 0) +
      (title ? 25 : 0) +
      (subtitle ? 20 : 0)
    ))

    // Contenu: text paragraphs & word count
    const textBlocks = allBlocks.filter(b => b.type === 'text')
    const wordCount = textBlocks.reduce((acc, b) => acc + (b.content?.split(/\s+/).filter(Boolean).length || 0), 0)
    const contenuScore = Math.min(100, Math.round(
      Math.min(60, wordCount / 2) +
      (textBlocks.length > 0 ? 20 : 0) +
      (types.includes('quote') ? 20 : 0)
    ))

    // Données: tables, KPIs, charts
    const dataTypes = ['table', 'kpi', 'chart', 'checklist']
    const dataCount = types.filter(t => dataTypes.includes(t)).length
    const donneesScore = Math.min(100, dataCount * 28 + (dataCount > 0 ? 16 : 0))

    // Visuel: images, chart
    const visualCount = types.filter(t => ['image', 'chart'].includes(t)).length + (profile.logoDataUrl ? 1 : 0)
    const visualScore = Math.min(100, visualCount * 40 + (profile.color !== '#1B4FD8' ? 20 : 0))

    // Juridique: clauses, signatures
    const legalCount = types.filter(t => ['clause', 'sign'].includes(t)).length
    const juridScore = Math.min(100, legalCount * 45 + (allBlocks.some(b => b.content?.includes('Article')) ? 10 : 0))

    // Complétude globale
    const completudeScore = Math.min(100, Math.round(
      (total > 0 ? 20 : 0) +
      Math.min(40, total * 4) +
      (profile.name ? 20 : 0) +
      (title ? 20 : 0)
    ))

    return {
      structure: structureScore,
      contenu: contenuScore,
      donnees: donneesScore,
      visuel: visualScore,
      juridique: juridScore,
      completude: completudeScore,
    }
  }, [allBlocks, title, subtitle, profile])

  const globalScore = Math.round(
    (metrics.structure + metrics.contenu + metrics.donnees + metrics.visuel + metrics.juridique + metrics.completude) / 6
  )

  const radarScores = [
    metrics.structure,
    metrics.contenu,
    metrics.donnees,
    metrics.visuel,
    metrics.juridique,
    metrics.completude,
  ]

  const radarLabels = ['Structure', 'Contenu', 'Données', 'Visuel', 'Juridique', 'Complétude']

  const globalColor = globalScore >= 70 ? '#059669' : globalScore >= 40 ? accent : '#DC2626'
  const globalLabel = globalScore >= 70 ? 'Excellent' : globalScore >= 40 ? 'En cours' : 'Incomplet'

  const details: Record<keyof typeof metrics, string> = {
    structure: 'Titres, sections et séparateurs',
    contenu: `${allBlocks.filter(b => b.type === 'text').length} paragraphe(s) · ${allBlocks.flatMap(b => b.content?.split(/\s+/).filter(Boolean) || []).length} mots`,
    donnees: `${allBlocks.filter(b => ['table', 'kpi', 'chart', 'checklist'].includes(b.type)).length} élément(s) de données`,
    visuel: `${allBlocks.filter(b => ['image', 'chart'].includes(b.type)).length} visuel(s) · ${profile.logoDataUrl ? 'logo ✓' : 'logo absent'}`,
    juridique: `${allBlocks.filter(b => ['clause', 'sign'].includes(b.type)).length} clause(s) / signature(s)`,
    completude: `${allBlocks.length} bloc(s) · ${pages.length + 1} page(s)`,
  }

  const suggestions = useMemo(() => {
    const list: string[] = []
    if (!title) list.push('Ajoutez un titre au document')
    if (metrics.structure < 50) list.push('Structurez avec des blocs Section ou H1')
    if (metrics.contenu < 40) list.push('Rédigez des paragraphes de texte')
    if (metrics.donnees < 30) list.push('Ajoutez un tableau ou des KPIs')
    if (metrics.visuel < 20) list.push('Intégrez une image ou un graphique')
    if (!profile.name) list.push('Renseignez le nom de votre entreprise')
    if (allBlocks.length < 4) list.push('Enrichissez le document avec plus de blocs')
    return list.slice(0, 4)
  }, [metrics, title, profile, allBlocks])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 280,
        minWidth: 280,
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
        background: 'var(--bg2)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '14px 14px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <Radar size={13} color={accent} strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Radar Qualité</span>
        </div>

        {/* Global score */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: `${globalColor}18`,
              border: `2.5px solid ${globalColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: globalColor, fontFamily: 'monospace' }}>
              {globalScore}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{globalLabel}</div>
            <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2 }}>
              Score global du document
            </div>
            <div
              style={{
                display: 'inline-flex',
                marginTop: 4,
                padding: '1px 7px',
                borderRadius: 99,
                background: `${globalColor}18`,
                fontSize: 9,
                fontWeight: 800,
                color: globalColor,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
              }}
            >
              {globalScore >= 70 ? '✓ Prêt à exporter' : globalScore >= 40 ? '⚡ En cours' : '⚠ Incomplet'}
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <RadarChart scores={radarScores} labels={radarLabels} accent={accent} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 14px' }} />

        {/* Score bars */}
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>
          Détail par dimension
        </div>
        {(Object.keys(metrics) as (keyof typeof metrics)[]).map(key => (
          <ScoreBar
            key={key}
            label={radarLabels[['structure', 'contenu', 'donnees', 'visuel', 'juridique', 'completude'].indexOf(key)]}
            score={metrics[key]}
            detail={details[key]}
            accent={accent}
          />
        ))}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>
              Suggestions
            </div>
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 7,
                  padding: '7px 9px',
                  borderRadius: 8,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  marginBottom: 5,
                }}
              >
                <span style={{ color: accent, fontSize: 11, flexShrink: 0, marginTop: 1 }}>→</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}