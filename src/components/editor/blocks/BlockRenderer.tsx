'use client'

import { useState, useCallback, useRef, useLayoutEffect } from 'react'
import { DocBlock, TableData, ChartBlockData, ImageBlockData, BlockStyleProperties } from '@/types'
import { Plus, Trash2, GripVertical, Sparkles, Check, X, Lock } from 'lucide-react'
import { usePlan } from '@/contexts/PlanContext'
import { SafeBlock } from '@/components/ErrorBoundary'
import { sanitizeContent } from '@/lib/sanitize'
import { LoadingSpinner } from '@/components/ui/Loading'
import { ImageBlock } from './ImageBlock'
import { ChartBlock } from './ChartBlock'

interface Props {
  block: DocBlock
  color: string
  entityName: string
  pageId: string
  onUpdateTable?: (blockId: string, tableData: TableData) => void
  onUpdateContent?: (blockId: string, content: string) => void
  onUpdateChart?: (blockId: string, chartData: ChartBlockData) => void
  onUpdateImage?: (blockId: string, imageData: ImageBlockData) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  fontBody?: string
  fontTitle?: string
  blockStyles?: BlockStyleProperties
}

// ── Style helper: merges blockStyles over defaults ────────────────────────────

function applyBlockStyles(
  defaults: React.CSSProperties,
  blockStyles?: BlockStyleProperties,
): React.CSSProperties {
  if (!blockStyles) return defaults
  return {
    ...defaults,
    ...(blockStyles.color && { color: blockStyles.color }),
    ...(blockStyles.fontSize && { fontSize: blockStyles.fontSize }),
    ...(blockStyles.fontFamily && { fontFamily: `'${blockStyles.fontFamily}', sans-serif` }),
    ...(blockStyles.align && { textAlign: blockStyles.align }),
    ...(blockStyles.textStyles?.bold !== undefined && {
      fontWeight: blockStyles.textStyles.bold ? 700 : (defaults.fontWeight || 'normal'),
    }),
    ...(blockStyles.textStyles?.italic !== undefined && {
      fontStyle: blockStyles.textStyles.italic ? 'italic' : 'normal',
    }),
    ...(blockStyles.textStyles?.underline !== undefined && {
      textDecoration: blockStyles.textStyles.underline ? 'underline' : 'none',
    }),
  }
}

function useEditableRef(initialContent: string, blockId: string) {
  const ref = useRef<any>(null)
  useLayoutEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = initialContent
    }
  }, [blockId, initialContent])
  return ref
}

function readAndSanitize(el: HTMLElement): string {
  return sanitizeContent(el.textContent || '')
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SectionBlock({ block, co, onUpdateContent, blockStyles }: {
  block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const ref = useEditableRef(block.content || `SECTION // ${block.id.toUpperCase()}`, block.id)
  const style = applyBlockStyles({
    fontFamily: 'inherit', fontSize: 10, fontWeight: 800, letterSpacing: '.22em',
    textTransform: 'uppercase', color: '#111', margin: 0, outline: 'none', cursor: 'text',
  }, blockStyles)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 4, height: 16, background: blockStyles?.color || co, borderRadius: 2, flexShrink: 0 }} />
      <h2 ref={ref} contentEditable suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={style} />
    </div>
  )
}

// ─── Text with AI Assist ──────────────────────────────────────────────────────

function TextBlock({ block, onUpdateContent, fontFamily, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; fontFamily?: string; blockStyles?: BlockStyleProperties
}) {
  const placeholder = 'Commencez à écrire votre paragraphe ici.'
  const ref = useEditableRef(block.content || '', block.id)
  const { planId, requestUpgrade } = usePlan()
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const canUseAI = planId !== 'starter'

  const handleAIAssist = async () => {
    const currentText = ref.current?.textContent?.trim() || ''
    if (!currentText || currentText.length < 5) {
      setError('Écrivez au moins 5 caractères'); setTimeout(() => setError(null), 3000); return
    }
    if (!canUseAI) { requestUpgrade('L\'assistance IA nécessite un plan Étudiant ou supérieur.', 'document'); return }
    setIsLoading(true); setError(null); setSuggestion(null)
    try {
      const res = await fetch('/api/ai/edit-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, action: 'improve' }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.needsUpgrade) requestUpgrade(data.error, 'document')
        else setError(data.error || 'Erreur lors de l\'amélioration')
        return
      }
      setSuggestion(data.text)
      if (data.remaining !== null) setRemaining(data.remaining)
    } catch { setError('Erreur de connexion') }
    finally { setIsLoading(false) }
  }

  const acceptSuggestion = () => {
    if (suggestion && ref.current) {
      ref.current.textContent = suggestion
      onUpdateContent?.(block.id, suggestion)
      setSuggestion(null)
    }
  }

  const defaultStyle: React.CSSProperties = {
    fontFamily: fontFamily || 'Times New Roman, serif',
    fontSize: 12, lineHeight: 1.85, color: '#444',
    margin: 0, textAlign: 'justify', outline: 'none',
    whiteSpace: 'pre-wrap', cursor: 'text', minHeight: 20,
  }
  const pStyle = applyBlockStyles(defaultStyle, blockStyles)

  return (
    <div style={{ position: 'relative' }}>
      {error && (
        <div className="pdf-hidden" style={{
          padding: '4px 8px', borderRadius: 4,
          background: '#FEF2F2', color: '#DC2626', fontSize: 10, marginBottom: 4,
        }}>{error}</div>
      )}
      {suggestion && (
        <div className="pdf-hidden" style={{ marginBottom: 8, padding: 12, borderRadius: 8, background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid #86EFAC' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={10} /> Suggestion IA
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={acceptSuggestion} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 4, background: '#059669', color: '#fff', border: 'none', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                <Check size={9} /> Accepter
              </button>
              <button onClick={() => setSuggestion(null)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 4, background: '#fff', color: '#666', border: '1px solid #E5E7EB', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                <X size={9} /> Rejeter
              </button>
            </div>
          </div>
          <p style={{ ...pStyle, color: '#166534', opacity: 1 }}>{suggestion}</p>
          {remaining !== null && <div style={{ marginTop: 8, fontSize: 9, color: '#6B7280' }}>{remaining} utilisation{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}</div>}
        </div>
      )}

      {/* Texte éditable */}
      <p ref={ref} contentEditable suppressContentEditableWarning
        data-placeholder={placeholder}
        onBlur={e => onUpdateContent?.(block.id, sanitizeContent(e.currentTarget.textContent || ''))}
        style={{ ...pStyle, opacity: suggestion ? 0.5 : 1, transition: 'opacity .2s', marginBottom: 0 }} />

      {/* ── BOUTON IA : position absolue, sans impact sur la hauteur du bloc ── */}
      <div className="pdf-hidden ai-improve-btn" style={{
        position: 'absolute',
        right: 0,
        bottom: -20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        opacity: 0,
        transition: 'opacity .15s',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        <div style={{ position: 'relative', pointerEvents: 'auto' }}>
          <button
            onClick={handleAIAssist}
            disabled={isLoading}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 5,
              border: canUseAI ? '1px solid #C7D2FE' : '1px solid #E5E7EB',
              background: canUseAI ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : '#F9FAFB',
              color: canUseAI ? '#4F46E5' : '#9CA3AF', fontSize: 9, fontWeight: 600,
              cursor: isLoading ? 'wait' : canUseAI ? 'pointer' : 'not-allowed',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading
              ? <LoadingSpinner size={9} className="text-current" />
              : !canUseAI
              ? <Lock size={9} />
              : <Sparkles size={9} />}
            <span>{isLoading ? 'En cours…' : 'Améliorer'}</span>
          </button>
          {showTooltip && !isLoading && (
            <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 4, padding: '6px 10px', borderRadius: 6, background: '#1F2937', color: '#fff', fontSize: 10, whiteSpace: 'nowrap', zIndex: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Assistance IA à l'édition</div>
              <div style={{ color: canUseAI ? '#10B981' : '#F59E0B', marginTop: 4 }}>
                {canUseAI ? 'Disponible' : 'Passez à Étudiant+'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Headings ─────────────────────────────────────────────────────────────────

function H1Block({ block, onUpdateContent, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const ref = useEditableRef(block.content || 'Titre de niveau 1', block.id)
  const style = applyBlockStyles({
    fontFamily: 'Times New Roman, serif', fontSize: 20, fontWeight: 900,
    color: '#111', margin: 0, outline: 'none', cursor: 'text',
    letterSpacing: '-.01em', lineHeight: 1.15,
  }, blockStyles)
  return <h1 ref={ref} contentEditable suppressContentEditableWarning onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))} style={style} />
}

function H2Block({ block, onUpdateContent, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const ref = useEditableRef(block.content || 'Titre de niveau 2', block.id)
  const style = applyBlockStyles({
    fontFamily: 'Times New Roman, serif', fontSize: 16, fontWeight: 800,
    color: '#222', margin: 0, outline: 'none', cursor: 'text', lineHeight: 1.25,
  }, blockStyles)
  return <h2 ref={ref} contentEditable suppressContentEditableWarning onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))} style={style} />
}

function H3Block({ block, onUpdateContent, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const ref = useEditableRef(block.content || 'Titre de niveau 3', block.id)
  const style = applyBlockStyles({
    fontFamily: 'Times New Roman, serif', fontSize: 14, fontWeight: 700,
    color: '#333', margin: 0, outline: 'none', cursor: 'text', lineHeight: 1.3,
  }, blockStyles)
  return <h3 ref={ref} contentEditable suppressContentEditableWarning onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))} style={style} />
}

function H4Block({ block, onUpdateContent, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const ref = useEditableRef(block.content || 'Titre de niveau 4', block.id)
  const style = applyBlockStyles({
    fontFamily: 'Times New Roman, serif', fontSize: 13, fontWeight: 700,
    fontStyle: 'italic', color: '#444', margin: 0, outline: 'none',
    cursor: 'text', lineHeight: 1.35,
  }, blockStyles)
  return <h4 ref={ref} contentEditable suppressContentEditableWarning onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))} style={style} />
}

// ─── Bullet List ──────────────────────────────────────────────────────────────

function BulletListBlock({ block, onUpdateContent, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const defaultItems = ['Premier élément', 'Deuxième élément', 'Troisième élément']
  const getItems = () => block.content ? block.content.split('\n').filter(Boolean) : defaultItems
  const [items, setItems] = useState<string[]>(getItems)

  const updateItems = (next: string[]) => { setItems(next); onUpdateContent?.(block.id, next.join('\n')) }
  const addItem = () => updateItems([...items, 'Nouvel élément'])
  const updateItem = (i: number, val: string) => {
    const sanitized = sanitizeContent(val)
    updateItems(items.map((item, idx) => idx === i ? sanitized : item))
  }
  const removeItem = (i: number) => { if (items.length > 1) updateItems(items.filter((_, idx) => idx !== i)) }

  const itemStyle = applyBlockStyles({
    fontFamily: 'Times New Roman, serif', fontSize: 12, color: '#444', lineHeight: 1.7,
  }, blockStyles)

  return (
    <div>
      <ul style={{ listStyle: 'disc', paddingLeft: 22, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 5, ...itemStyle }}>
            <span contentEditable suppressContentEditableWarning
              onBlur={e => updateItem(i, e.currentTarget.textContent || '')}
              style={{ outline: 'none', cursor: 'text', display: 'inline' }}>{item}</span>
            {items.length > 1 && (
              <button className="pdf-hidden" onClick={() => removeItem(i)}
                style={{ marginLeft: 6, fontSize: 9, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            )}
          </li>
        ))}
      </ul>
      <button className="pdf-hidden" onClick={addItem}
        style={{ marginTop: 5, marginLeft: 22, fontSize: 10, color: '#aaa', background: 'none', border: '1px dashed #e0e0e0', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', display: 'block' }}>
        + Ajouter un élément
      </button>
    </div>
  )
}

// ─── Numbered List ────────────────────────────────────────────────────────────

function NumberedListBlock({ block, onUpdateContent, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const defaultItems = ['Premier élément numéroté', 'Deuxième élément numéroté', 'Troisième élément numéroté']
  const getItems = () => block.content ? block.content.split('\n').filter(Boolean) : defaultItems
  const [items, setItems] = useState<string[]>(getItems)

  const updateItems = (next: string[]) => { setItems(next); onUpdateContent?.(block.id, next.join('\n')) }
  const addItem = () => updateItems([...items, 'Nouvel élément'])
  const updateItem = (i: number, val: string) => {
    updateItems(items.map((item, idx) => idx === i ? sanitizeContent(val) : item))
  }
  const removeItem = (i: number) => { if (items.length > 1) updateItems(items.filter((_, idx) => idx !== i)) }

  const itemStyle = applyBlockStyles({
    fontFamily: 'Times New Roman, serif', fontSize: 12, color: '#444', lineHeight: 1.7,
  }, blockStyles)

  return (
    <div>
      <ol style={{ listStyleType: 'decimal', paddingLeft: 22, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 5, ...itemStyle }}>
            <span contentEditable suppressContentEditableWarning
              onBlur={e => updateItem(i, e.currentTarget.textContent || '')}
              style={{ outline: 'none', cursor: 'text', display: 'inline' }}>{item}</span>
            {items.length > 1 && (
              <button className="pdf-hidden" onClick={() => removeItem(i)}
                style={{ marginLeft: 6, fontSize: 9, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            )}
          </li>
        ))}
      </ol>
      <button className="pdf-hidden" onClick={addItem}
        style={{ marginTop: 5, marginLeft: 22, fontSize: 10, color: '#aaa', background: 'none', border: '1px dashed #e0e0e0', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', display: 'block' }}>
        + Ajouter un élément
      </button>
    </div>
  )
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function QuoteBlock({ block, co, entityName, onUpdateContent, blockStyles }: {
  block: DocBlock; co: string; entityName: string; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const textRef = useEditableRef(block.content?.split('\n')[0] || '"L\'excellence opérationnelle est le fondement de toute croissance durable."', block.id)
  const textStyle = applyBlockStyles({
    fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 16, fontStyle: 'italic',
    color: '#222', margin: '0 0 8px', outline: 'none', cursor: 'text',
  }, blockStyles)
  return (
    <div style={{ borderLeft: `3px solid ${blockStyles?.color || co}`, padding: '14px 18px', background: '#fafafa' }}>
      <p ref={textRef} contentEditable suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={textStyle} />
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999' }}>
        Direction Générale — {entityName}
      </span>
    </div>
  )
}

// ─── KPI ──────────────────────────────────────────────────────────────────────

function KpiBlock({ block, co, onUpdateContent, blockStyles }: {
  block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const defaultKpis = [
    { val: '12M FCFA', label: 'Revenus Cible' }, { val: '21%', label: 'Marge Nette' },
    { val: '+38%', label: 'Croissance' }, { val: '47', label: 'Effectifs 2026' },
  ]
  const getKpis = () => { try { if (block.content) return JSON.parse(block.content) } catch {} return defaultKpis }
  const [kpis, setKpis] = useState(getKpis)
  const updateKpi = (idx: number, field: 'val' | 'label', value: string) => {
    const next = kpis.map((k: any, i: number) => i === idx ? { ...k, [field]: sanitizeContent(value) } : k)
    setKpis(next); onUpdateContent?.(block.id, JSON.stringify(next))
  }
  const accentColor = blockStyles?.color || co
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {kpis.map((kpi: any, i: number) => (
        <div key={i} style={{ background: '#F5F7FA', borderTop: `3px solid ${accentColor}`, borderRadius: '0 0 8px 8px', padding: '14px 10px', textAlign: 'center' }}>
          <div contentEditable suppressContentEditableWarning
            onBlur={e => updateKpi(i, 'val', e.currentTarget.textContent || '')}
            style={{ fontFamily: 'inherit', fontSize: 20, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4, outline: 'none', cursor: 'text' }}>
            {kpi.val}
          </div>
          <div contentEditable suppressContentEditableWarning
            onBlur={e => updateKpi(i, 'label', e.currentTarget.textContent || '')}
            style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999', outline: 'none', cursor: 'text' }}>
            {kpi.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Clause ───────────────────────────────────────────────────────────────────

function ClauseBlock({ block, co, onUpdateContent, blockStyles }: {
  block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const titleRef = useEditableRef(block.content?.split('\n')[0] || 'Article — Disposition Contractuelle', block.id)
  const bodyRef = useEditableRef(block.content?.split('\n').slice(1).join('\n') || 'Les parties s\'engagent à respecter l\'ensemble des termes et obligations stipulés dans le présent accord.', block.id)
  const syncContent = () => {
    const title = sanitizeContent(titleRef.current?.textContent || '')
    const body = sanitizeContent(bodyRef.current?.textContent || '')
    onUpdateContent?.(block.id, `${title}\n${body}`)
  }
  const bodyStyle = applyBlockStyles({
    fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 12, lineHeight: 1.8,
    color: '#555', margin: 0, outline: 'none', whiteSpace: 'pre-wrap', cursor: 'text',
  }, blockStyles)
  return (
    <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 7, padding: 16 }}>
      <div ref={titleRef} contentEditable suppressContentEditableWarning onBlur={syncContent}
        style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: blockStyles?.color || co, marginBottom: 8, outline: 'none', cursor: 'text' }} />
      <p ref={bodyRef} contentEditable suppressContentEditableWarning onBlur={syncContent} style={bodyStyle} />
    </div>
  )
}

// ─── Checklist ────────────────────────────────────────────────────────────────

function ChecklistBlock({ block, onUpdateContent, blockStyles }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; blockStyles?: BlockStyleProperties
}) {
  const defaultItems = ['Item à compléter 1', 'Item à compléter 2', 'Item à compléter 3']
  const getItems = () => block.content ? block.content.split('\n').filter(Boolean) : defaultItems
  const [items, setItems] = useState(getItems)
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false))
  const updateItem = (idx: number, val: string) => {
    const next = items.map((item, i) => i === idx ? sanitizeContent(val) : item)
    setItems(next); onUpdateContent?.(block.id, next.join('\n'))
  }
  const itemStyle = applyBlockStyles({ fontSize: 12, color: '#555', lineHeight: 1.6 }, blockStyles)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <div onClick={() => setChecked(c => c.map((v, idx) => idx === i ? !v : v))}
            style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked[i] ? '#059669' : '#1B4FD8'}`, marginTop: 2, flexShrink: 0, background: checked[i] ? '#059669' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
            {checked[i] && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
          </div>
          <span contentEditable suppressContentEditableWarning
            onBlur={e => updateItem(i, e.currentTarget.textContent || '')}
            style={{ ...itemStyle, outline: 'none', cursor: 'text', textDecoration: checked[i] ? 'line-through' : (itemStyle.textDecoration || 'none') }}>
            {item}
          </span>
        </label>
      ))}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

function InteractiveTable({ block, co, onUpdateTable, blockStyles }: {
  block: DocBlock; co: string; onUpdateTable?: (blockId: string, tableData: TableData) => void; blockStyles?: BlockStyleProperties
}) {
  const defaultData: TableData = block.tableData || {
    headers: ['Indicateur', 'Réf. 2025', 'Cible 2026', 'Variation'],
    rows: [
      ["Chiffre d'Affaires", "9 200 000 FCFA", "12 000 000 FCFA", "+30%"],
      ["Marge Opérationnelle", "16%", "21%", "+5pt"],
      ["Effectifs", "34", "47", "+38%"],
    ],
  }
  const [data, setData] = useState<TableData>(defaultData)
  const accentColor = blockStyles?.color || co
  const update = useCallback((newData: TableData) => { setData(newData); onUpdateTable?.(block.id, newData) }, [block.id, onUpdateTable])
  const addRow = () => update({ ...data, rows: [...data.rows, data.headers.map(() => '—')] })
  const removeRow = (i: number) => update({ ...data, rows: data.rows.filter((_, idx) => idx !== i) })
  const addCol = () => update({ headers: [...data.headers, 'Colonne'], rows: data.rows.map(r => [...r, '—']) })
  const removeCol = (i: number) => update({ headers: data.headers.filter((_, idx) => idx !== i), rows: data.rows.map(r => r.filter((_, idx) => idx !== i)) })
  const updateHeader = (i: number, val: string) => { const headers = [...data.headers]; headers[i] = sanitizeContent(val); update({ ...data, headers }) }
  const updateCell = (r: number, c: number, val: string) => {
    update({ ...data, rows: data.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? sanitizeContent(val) : cell) : row) })
  }
  return (
    <div style={{ overflowX: 'auto', marginTop: 4, maxWidth: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 11, tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${accentColor}` }}>
            {data.headers.map((h, ci) => (
              <th key={ci} style={{ textAlign: 'left', padding: '6px 8px', wordBreak: 'break-word', minWidth: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span contentEditable suppressContentEditableWarning onBlur={e => updateHeader(ci, e.currentTarget.textContent || '')}
                    style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#111', outline: 'none', flex: 1, cursor: 'text', wordBreak: 'break-word' }}>{h}</span>
                  {data.headers.length > 1 && (
                    <button onClick={() => removeCol(ci)} className="pdf-hidden"
                      style={{ width: 14, height: 14, borderRadius: 3, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#DC2626', padding: 0, flexShrink: 0 }}>×</button>
                  )}
                </div>
              </th>
            ))}
            <th style={{ width: 24, padding: '4px' }} className="pdf-hidden">
              <button onClick={addCol} style={{ width: 20, height: 20, borderRadius: 4, background: `${accentColor}18`, border: `1px dashed ${accentColor}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, padding: 0 }}>
                <Plus size={9} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #f0f0f0', background: ri % 2 ? '#fafafa' : '#fff' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '7px 8px', wordBreak: 'break-word' }}>
                  <span contentEditable suppressContentEditableWarning onBlur={e => updateCell(ri, ci, e.currentTarget.textContent || '')}
                    style={{ color: '#555', outline: 'none', display: 'block', cursor: 'text', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{cell}</span>
                </td>
              ))}
              <td style={{ padding: '4px', width: 24 }} className="pdf-hidden">
                <button onClick={() => removeRow(ri)} style={{ width: 20, height: 20, borderRadius: 4, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', padding: 0 }}>
                  <Trash2 size={8} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="pdf-hidden" style={{ marginTop: 6, width: '100%', padding: '5px', borderRadius: 5, background: `${accentColor}10`, border: `1px dashed ${accentColor}50`, cursor: 'pointer', color: accentColor, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Plus size={10} /> Ajouter une ligne
      </button>
    </div>
  )
}

// ─── Main BlockRenderer ───────────────────────────────────────────────────────

export function BlockRenderer({
  block, color: co, entityName: en, pageId,
  onUpdateTable, onUpdateContent, onUpdateChart, onUpdateImage,
  dragHandleProps, fontBody, fontTitle, blockStyles,
}: Props) {
  const { type } = block

  const dragHandle = (
    <div {...dragHandleProps} className="pdf-hidden block-drag-handle" title="Déplacer le bloc"
      style={{ position: 'absolute', left: -28, top: '50%', transform: 'translateY(-50%)', width: 20, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', opacity: 0, transition: 'opacity .15s', color: '#bbb' }}>
      <GripVertical size={13} />
    </div>
  )

  const wrap = (children: React.ReactNode, label?: string) => (
    <div style={{ position: 'relative' }}>
      {dragHandle}
      <SafeBlock label={label || type}>{children}</SafeBlock>
    </div>
  )

  if (type === 'h1') return wrap(<H1Block block={block} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'H1')
  if (type === 'h2') return wrap(<H2Block block={block} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'H2')
  if (type === 'h3') return wrap(<H3Block block={block} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'H3')
  if (type === 'h4') return wrap(<H4Block block={block} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'H4')
  if (type === 'bullet-list')   return wrap(<BulletListBlock block={block} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'Bullet List')
  if (type === 'numbered-list') return wrap(<NumberedListBlock block={block} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'Numbered List')
  if (type === 'section') return wrap(<SectionBlock block={block} co={co} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'Section')
  if (type === 'text')    return wrap(<TextBlock block={block} onUpdateContent={onUpdateContent} fontFamily={fontBody || 'Times New Roman, serif'} blockStyles={blockStyles} />, 'Text')
  if (type === 'quote')   return wrap(<QuoteBlock block={block} co={co} entityName={en} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'Quote')
  if (type === 'table')   return wrap(<InteractiveTable block={block} co={co} onUpdateTable={onUpdateTable} blockStyles={blockStyles} />, 'Table')
  if (type === 'kpi')     return wrap(<KpiBlock block={block} co={co} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'KPI')
  if (type === 'clause')  return wrap(<ClauseBlock block={block} co={co} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'Clause')
  if (type === 'checklist') return wrap(<ChecklistBlock block={block} onUpdateContent={onUpdateContent} blockStyles={blockStyles} />, 'Checklist')

  if (type === 'image') return wrap(
    <ImageBlock blockId={block.id} initialSrc={block.imageData?.src || block.content || ''} initialCaption={block.imageData?.caption || ''} initialAlign={block.imageData?.align || 'center'} initialSize={block.imageData?.size || 'lg'} onUpdate={data => onUpdateImage?.(block.id, data as ImageBlockData)} />, 'Image'
  )

  if (type === 'chart') return wrap(
    <ChartBlock blockId={block.id} initialType={block.chartData?.type || 'bar'} initialData={block.chartData?.data} initialTitle={block.chartData?.title || 'Graphique'} accentColor={blockStyles?.color || co} onUpdate={data => onUpdateChart?.(block.id, data)} />, 'Chart'
  )

  if (type === 'sign') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 16, paddingTop: 16 }}>
      {['Émetteur', 'Destinataire'].map(role => (
        <div key={role}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bbb', marginBottom: 24 }}>{role}</div>
          <div style={{ borderBottom: '1px solid #333', height: 40, marginBottom: 8 }} />
          <div contentEditable suppressContentEditableWarning style={{ fontSize: 11, color: '#888', outline: 'none', cursor: 'text' }}>
            {role === 'Émetteur' ? (en || 'Émetteur — Titre') : 'Nom, Titre'}
          </div>
          <div style={{ fontSize: 10, color: '#bbb', marginTop: 3 }}>Date : ___/___/2026</div>
        </div>
      ))}
    </div>
  )

  if (type === 'divider') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: blockStyles?.color || co, opacity: .4 }} />
      <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
    </div>
  )

  return null
}