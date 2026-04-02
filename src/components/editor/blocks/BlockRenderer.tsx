'use client'

import { useState, useCallback, useRef, useLayoutEffect } from 'react'
import { DocBlock, TableData, ChartBlockData, ImageBlockData } from '@/types'
import { Plus, Trash2, GripVertical, Sparkles, Loader2, Check, X, Lock } from 'lucide-react'
import { usePlan } from '@/contexts/PlanContext'
import { SafeBlock } from '@/components/ErrorBoundary'
import { sanitizeContent } from '@/lib/sanitize'
import { ImageBlock } from './ImageBlock'
import { ChartBlock } from './ChartBlock'
import { TextContextMenu } from './TextContextMenu'

interface Props {
  block: DocBlock
  color: string
  entityName: string
  pageId: string
  onUpdateTable?: (blockId: string, tableData: TableData) => void
  onUpdateContent?: (blockId: string, content: string) => void
  onUpdateChart?: (blockId: string, chartData: ChartBlockData) => void
  onUpdateImage?: (blockId: string, imageData: ImageBlockData) => void
  onUpdateStyle?: (blockId: string, styles: any) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  /** Whether to force Times New Roman on all text (set via docStyle.fontBody) */
  fontBody?: string
  fontTitle?: string
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

// Helper function to apply block styles
function applyBlockStyles(block: DocBlock): React.CSSProperties {
  const styles = block.styles || {}
  return {
    textAlign: (styles.align as any) || 'left',
    color: styles.color || 'inherit',
    fontSize: styles.fontSize ? `${styles.fontSize}px` : 'inherit',
    fontFamily: styles.fontFamily || 'inherit',
    fontWeight: styles.textStyles?.bold ? 700 : 'inherit',
    fontStyle: styles.textStyles?.italic ? 'italic' : 'inherit',
    textDecoration: styles.textStyles?.underline ? 'underline' : 'inherit',
  }
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SectionBlock({ block, co, onUpdateContent }: { block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const ref = useEditableRef(block.content || `SECTION // ${block.id.toUpperCase()}`, block.id)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 4, height: 16, background: co, borderRadius: 2, flexShrink: 0 }} />
      <h2 ref={ref} contentEditable suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={{ fontFamily: 'inherit', fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#111', margin: 0, outline: 'none', cursor: 'text' }} />
    </div>
  )
}

// ─── Text with AI Assist ──────────────────────────────────────────────────────

function TextBlock({ block, onUpdateContent, onUpdateStyle, fontFamily }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent']; onUpdateStyle?: Props['onUpdateStyle']; fontFamily?: string }) {
  const placeholder = 'Commencez à écrire votre paragraphe ici. Double-cliquez pour éditer ce texte et remplacez-le par votre contenu.'
  const ref = useEditableRef(block.content || '', block.id)
  const { planId, requestUpgrade } = usePlan()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  
  const canUseAI = planId !== 'starter'
  
  const handleAIAssist = async () => {
    const currentText = ref.current?.textContent?.trim() || ''
    if (!currentText || currentText.length < 5) {
      setError('Écrivez au moins 5 caractères')
      setTimeout(() => setError(null), 3000)
      return
    }
    
    if (!canUseAI) {
      requestUpgrade('L\'assistance IA à l\'édition n\'est pas disponible sur le plan Gratuit. Passez au plan Étudiant ou supérieur.', 'document')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setSuggestion(null)
    
    try {
      const res = await fetch('/api/ai/edit-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, action: 'improve' }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        if (data.needsUpgrade) {
          requestUpgrade(data.error, 'document')
        } else {
          setError(data.error || 'Erreur lors de l\'amélioration')
        }
        return
      }
      
      setSuggestion(data.text)
      if (data.remaining !== null) {
        setRemaining(data.remaining)
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }
  
  const acceptSuggestion = () => {
    if (suggestion && ref.current) {
      ref.current.textContent = suggestion
      onUpdateContent?.(block.id, suggestion)
      setSuggestion(null)
    }
  }
  
  const rejectSuggestion = () => {
    setSuggestion(null)
  }
  
  const getLimitLabel = () => {
    if (planId === 'starter') return 'Non disponible'
    if (planId === 'student') return '3/jour'
    if (planId === 'pro') return '10/jour'
    return 'Illimité'
  }
  
  return (
    <div style={{ position: 'relative' }}>
      {/* AI Assist Button */}
      <div className="pdf-hidden" style={{ position: 'absolute', top: -8, right: 0, zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleAIAssist}
            disabled={isLoading}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 6,
              border: canUseAI ? '1px solid #E0E7FF' : '1px solid #E5E7EB',
              background: canUseAI ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : '#F9FAFB',
              color: canUseAI ? '#4F46E5' : '#9CA3AF',
              fontSize: 10, fontWeight: 600,
              cursor: isLoading ? 'wait' : canUseAI ? 'pointer' : 'not-allowed',
              transition: 'all .15s',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            ) : canUseAI ? (
              <Sparkles size={12} />
            ) : (
              <Lock size={10} />
            )}
            <span>{isLoading ? 'Amélioration...' : 'Améliorer'}</span>
          </button>
          
          {/* Tooltip */}
          {showTooltip && !isLoading && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              padding: '6px 10px', borderRadius: 6,
              background: '#1F2937', color: '#fff',
              fontSize: 10, whiteSpace: 'nowrap', zIndex: 20,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Assistance IA à l&apos;édition</div>
              <div style={{ color: '#9CA3AF' }}>Clarté • Fautes • Cohérence • Style</div>
              <div style={{ color: canUseAI ? '#10B981' : '#F59E0B', marginTop: 4 }}>
                {canUseAI ? `Limite: ${getLimitLabel()}` : 'Passez à Étudiant+'}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="pdf-hidden" style={{
          position: 'absolute', top: -28, left: 0, right: 60,
          padding: '4px 8px', borderRadius: 4,
          background: '#FEF2F2', color: '#DC2626',
          fontSize: 10, fontWeight: 500,
        }}>
          {error}
        </div>
      )}
      
      {/* Suggestion Preview */}
      {suggestion && (
        <div className="pdf-hidden" style={{
          marginBottom: 8, padding: 12, borderRadius: 8,
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: '1px solid #86EFAC',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={12} /> Suggestion IA
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={acceptSuggestion}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '3px 8px', borderRadius: 4,
                  background: '#059669', color: '#fff',
                  border: 'none', fontSize: 10, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Check size={10} /> Accepter
              </button>
              <button
                onClick={rejectSuggestion}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '3px 8px', borderRadius: 4,
                  background: '#fff', color: '#666',
                  border: '1px solid #E5E7EB', fontSize: 10, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <X size={10} /> Rejeter
              </button>
            </div>
          </div>
          <p style={{
            fontFamily: fontFamily || 'inherit',
            fontSize: 12, lineHeight: 1.85, color: '#166534', margin: 0,
            textAlign: 'justify', whiteSpace: 'pre-wrap',
          }}>
            {suggestion}
          </p>
          {remaining !== null && (
            <div style={{ marginTop: 8, fontSize: 9, color: '#6B7280' }}>
              {remaining} utilisation{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''} aujourd&apos;hui
            </div>
          )}
        </div>
      )}
      
      {/* Original Text */}
      <p ref={ref} contentEditable suppressContentEditableWarning
        data-placeholder={placeholder}
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        onContextMenu={(e) => {
          e.preventDefault()
          setContextMenu({ x: e.clientX, y: e.clientY })
        }}
        style={{
          fontFamily: fontFamily || 'inherit',
          fontSize: 12, lineHeight: 1.85, color: '#444', margin: 0,
          outline: 'none', whiteSpace: 'pre-wrap',
          cursor: 'text', minHeight: 20,
          opacity: suggestion ? 0.5 : 1,
          transition: 'opacity .2s',
          ...applyBlockStyles(block),
        }} />

      {/* Context Menu */}
      {contextMenu && (
        <TextContextMenu
          block={block}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onUpdateStyle={(styles) => onUpdateStyle?.(block.id, styles)}
          onUpdateContent={(content) => onUpdateContent?.(block.id, content)}
        />
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ─── Headings H1–H4 ───────────────────────────────────────────────────────────

function H1Block({ block, onUpdateContent, autoNumber, ordinal }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; autoNumber?: boolean; ordinal?: number
}) {
  const defaultText = block.content || 'Titre de niveau 1'
  const ref = useEditableRef(defaultText, block.id)
  const prefix = autoNumber && ordinal !== undefined ? `${ordinal + 1}. ` : ''
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      {prefix && (
        <span style={{ fontFamily: 'Times New Roman, serif', fontSize: 20, fontWeight: 900, color: '#111', flexShrink: 0 }}>
          {prefix}
        </span>
      )}
      <h1 ref={ref} contentEditable suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={{
          fontFamily: 'Times New Roman, serif', fontSize: 20, fontWeight: 900,
          color: '#111', margin: 0, outline: 'none', cursor: 'text',
          letterSpacing: '-.01em', lineHeight: 1.15, flex: 1,
        }} />
    </div>
  )
}

function H2Block({ block, onUpdateContent, autoNumber, h1Ordinal, ordinal }: {
  block: DocBlock; onUpdateContent?: Props['onUpdateContent']; autoNumber?: boolean; h1Ordinal?: number; ordinal?: number
}) {
  const defaultText = block.content || 'Titre de niveau 2'
  const ref = useEditableRef(defaultText, block.id)
  const prefix = autoNumber && h1Ordinal !== undefined && ordinal !== undefined
    ? `${h1Ordinal + 1}.${ordinal + 1} ` : ''
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      {prefix && (
        <span style={{ fontFamily: 'Times New Roman, serif', fontSize: 16, fontWeight: 800, color: '#222', flexShrink: 0 }}>
          {prefix}
        </span>
      )}
      <h2 ref={ref} contentEditable suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={{
          fontFamily: 'Times New Roman, serif', fontSize: 16, fontWeight: 800,
          color: '#222', margin: 0, outline: 'none', cursor: 'text',
          lineHeight: 1.25, flex: 1,
        }} />
    </div>
  )
}

function H3Block({ block, onUpdateContent }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultText = block.content || 'Titre de niveau 3'
  const ref = useEditableRef(defaultText, block.id)
  return (
    <h3 ref={ref} contentEditable suppressContentEditableWarning
      onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
      style={{
        fontFamily: 'Times New Roman, serif', fontSize: 14, fontWeight: 700,
        color: '#333', margin: 0, outline: 'none', cursor: 'text', lineHeight: 1.3,
      }} />
  )
}

function H4Block({ block, onUpdateContent }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultText = block.content || 'Titre de niveau 4'
  const ref = useEditableRef(defaultText, block.id)
  return (
    <h4 ref={ref} contentEditable suppressContentEditableWarning
      onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
      style={{
        fontFamily: 'Times New Roman, serif', fontSize: 13, fontWeight: 700,
        fontStyle: 'italic', color: '#444', margin: 0, outline: 'none',
        cursor: 'text', lineHeight: 1.35,
      }} />
  )
}

// ─── Bullet List ──────────────────────────────────────────────────────────────

function BulletListBlock({ block, onUpdateContent }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultItems = ['Premier élément', 'Deuxième élément', 'Troisième élément']
  const getItems = () => block.content ? block.content.split('\n').filter(Boolean) : defaultItems
  const [items, setItems] = useState<string[]>(getItems)

  const updateItems = (next: string[]) => {
    setItems(next)
    onUpdateContent?.(block.id, next.join('\n'))
  }

  const addItem = () => updateItems([...items, 'Nouvel élément'])

  const updateItem = (i: number, val: string) => {
    const sanitized = sanitizeContent(val)
    updateItems(items.map((item, idx) => idx === i ? sanitized : item))
  }

  const removeItem = (i: number) => {
    if (items.length > 1) updateItems(items.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <ul style={{ listStyle: 'disc', paddingLeft: 22, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 5, fontFamily: 'Times New Roman, serif', fontSize: 12, color: '#444', lineHeight: 1.7 }}>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateItem(i, e.currentTarget.textContent || '')}
              style={{ outline: 'none', cursor: 'text', display: 'inline' }}
            >
              {item}
            </span>
            {items.length > 1 && (
              <button
                className="pdf-hidden"
                onClick={() => removeItem(i)}
                style={{ marginLeft: 6, fontSize: 9, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            )}
          </li>
        ))}
      </ul>
      <button
        className="pdf-hidden"
        onClick={addItem}
        style={{
          marginTop: 5, marginLeft: 22, fontSize: 10, color: '#aaa',
          background: 'none', border: '1px dashed #e0e0e0', borderRadius: 4,
          padding: '2px 10px', cursor: 'pointer', display: 'block',
        }}
      >
        + Ajouter un élément
      </button>
    </div>
  )
}

// ─── Numbered List ────────────────────────────────────────────────────────────

function NumberedListBlock({ block, onUpdateContent }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultItems = ['Premier élément numéroté', 'Deuxième élément numéroté', 'Troisième élément numéroté']
  const getItems = () => block.content ? block.content.split('\n').filter(Boolean) : defaultItems
  const [items, setItems] = useState<string[]>(getItems)

  const updateItems = (next: string[]) => {
    setItems(next)
    onUpdateContent?.(block.id, next.join('\n'))
  }

  const addItem = () => updateItems([...items, 'Nouvel élément'])

  const updateItem = (i: number, val: string) => {
    const sanitized = sanitizeContent(val)
    updateItems(items.map((item, idx) => idx === i ? sanitized : item))
  }

  const removeItem = (i: number) => {
    if (items.length > 1) updateItems(items.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <ol style={{ listStyleType: 'decimal', paddingLeft: 22, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 5, fontFamily: 'Times New Roman, serif', fontSize: 12, color: '#444', lineHeight: 1.7 }}>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateItem(i, e.currentTarget.textContent || '')}
              style={{ outline: 'none', cursor: 'text', display: 'inline' }}
            >
              {item}
            </span>
            {items.length > 1 && (
              <button
                className="pdf-hidden"
                onClick={() => removeItem(i)}
                style={{ marginLeft: 6, fontSize: 9, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            )}
          </li>
        ))}
      </ol>
      <button
        className="pdf-hidden"
        onClick={addItem}
        style={{
          marginTop: 5, marginLeft: 22, fontSize: 10, color: '#aaa',
          background: 'none', border: '1px dashed #e0e0e0', borderRadius: 4,
          padding: '2px 10px', cursor: 'pointer', display: 'block',
        }}
      >
        + Ajouter un élément
      </button>
    </div>
  )
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function QuoteBlock({ block, co, entityName, onUpdateContent }: { block: DocBlock; co: string; entityName: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const textRef = useEditableRef(block.content?.split('\n')[0] || '"L\'excellence opérationnelle est le fondement de toute croissance durable."', block.id)
  return (
    <div style={{ borderLeft: `3px solid ${co}`, padding: '14px 18px', background: '#fafafa' }}>
      <p ref={textRef} contentEditable suppressContentEditableWarning
        onBlur={e => onUpdateContent?.(block.id, readAndSanitize(e.currentTarget))}
        style={{ fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 16, fontStyle: 'italic', color: '#222', margin: '0 0 8px', outline: 'none', cursor: 'text' }} />
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#999' }}>
        Direction Générale — {entityName}
      </span>
    </div>
  )
}

// ─── KPI ──────────────────────────────────────────────────────────────────────

function KpiBlock({ block, co, onUpdateContent }: { block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultKpis = [
    { val: '12M FCFA', label: 'Revenus Cible' },
    { val: '21%', label: 'Marge Nette' },
    { val: '+38%', label: 'Croissance' },
    { val: '47', label: 'Effectifs 2026' },
  ]
  const getKpis = () => {
    try { if (block.content) return JSON.parse(block.content) } catch {}
    return defaultKpis
  }
  const [kpis, setKpis] = useState(getKpis)
  const updateKpi = (idx: number, field: 'val' | 'label', value: string) => {
    const sanitized = sanitizeContent(value)
    const next = kpis.map((k: any, i: number) => i === idx ? { ...k, [field]: sanitized } : k)
    setKpis(next)
    onUpdateContent?.(block.id, JSON.stringify(next))
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {kpis.map((kpi: any, i: number) => (
        <div key={i} style={{ background: '#F5F7FA', borderTop: `3px solid ${co}`, borderRadius: '0 0 8px 8px', padding: '14px 10px', textAlign: 'center' }}>
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

function ClauseBlock({ block, co, onUpdateContent }: { block: DocBlock; co: string; onUpdateContent?: Props['onUpdateContent'] }) {
  const titleRef = useEditableRef(block.content?.split('\n')[0] || 'Article — Disposition Contractuelle', block.id)
  const bodyRef = useEditableRef(block.content?.split('\n').slice(1).join('\n') || 'Les parties s\'engagent à respecter l\'ensemble des termes et obligations stipulés dans le présent accord.', block.id)
  const syncContent = (e: React.FocusEvent<HTMLElement>) => {
    const title = sanitizeContent(titleRef.current?.textContent || '')
    const body = sanitizeContent(bodyRef.current?.textContent || '')
    onUpdateContent?.(block.id, `${title}\n${body}`)
  }
  return (
    <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 7, padding: 16 }}>
      <div ref={titleRef} contentEditable suppressContentEditableWarning onBlur={syncContent}
        style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: co, marginBottom: 8, outline: 'none', cursor: 'text' }} />
      <p ref={bodyRef} contentEditable suppressContentEditableWarning onBlur={syncContent}
        style={{ fontFamily: 'Libre Caslon Text, Georgia, serif', fontSize: 12, lineHeight: 1.8, color: '#555', margin: 0, outline: 'none', whiteSpace: 'pre-wrap', cursor: 'text' }} />
    </div>
  )
}

// ─── Checklist ────────────────────────────────────────────────────────────────

function ChecklistBlock({ block, onUpdateContent }: { block: DocBlock; onUpdateContent?: Props['onUpdateContent'] }) {
  const defaultItems = ['Item à compléter 1', 'Item à compléter 2', 'Item à compléter 3']
  const getItems = () => {
    if (block.content) return block.content.split('\n').filter(Boolean)
    return defaultItems
  }
  const [items, setItems] = useState(getItems)
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false))
  const updateItem = (idx: number, val: string) => {
    const sanitized = sanitizeContent(val)
    const next = items.map((item, i) => i === idx ? sanitized : item)
    setItems(next)
    onUpdateContent?.(block.id, next.join('\n'))
  }
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
            style={{ fontSize: 12, color: checked[i] ? '#999' : '#555', outline: 'none', cursor: 'text', textDecoration: checked[i] ? 'line-through' : 'none' }}>
            {item}
          </span>
        </label>
      ))}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

function InteractiveTable({ block, co, onUpdateTable }: { block: DocBlock; co: string; onUpdateTable?: (blockId: string, tableData: TableData) => void }) {
  const defaultData: TableData = block.tableData || {
    headers: ['Indicateur', 'Réf. 2025', 'Cible 2026', 'Variation'],
    rows: [
      ["Chiffre d'Affaires", "9 200 000 FCFA", "12 000 000 FCFA", "+30%"],
      ["Marge Opérationnelle", "16%", "21%", "+5pt"],
      ["Effectifs", "34", "47", "+38%"],
    ],
  }
  const [data, setData] = useState<TableData>(defaultData)
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
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${co}` }}>
            {data.headers.map((h, ci) => (
              <th key={ci} style={{ textAlign: 'left', padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span contentEditable suppressContentEditableWarning onBlur={e => updateHeader(ci, e.currentTarget.textContent || '')}
                    style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#111', outline: 'none', flex: 1, cursor: 'text' }}>{h}</span>
                  {data.headers.length > 1 && (
                    <button onClick={() => removeCol(ci)} className="pdf-hidden"
                      style={{ width: 14, height: 14, borderRadius: 3, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#DC2626', padding: 0 }}>×</button>
                  )}
                </div>
              </th>
            ))}
            <th style={{ width: 28, padding: '4px' }} className="pdf-hidden">
              <button onClick={addCol} style={{ width: 22, height: 22, borderRadius: 4, background: `${co}18`, border: `1px dashed ${co}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: co, padding: 0 }}>
                <Plus size={10} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #f0f0f0', background: ri % 2 ? '#fafafa' : '#fff' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '9px 10px' }}>
                  <span contentEditable suppressContentEditableWarning onBlur={e => updateCell(ri, ci, e.currentTarget.textContent || '')}
                    style={{ color: '#555', outline: 'none', display: 'block', minWidth: 40, cursor: 'text' }}>{cell}</span>
                </td>
              ))}
              <td style={{ padding: '4px', width: 28 }} className="pdf-hidden">
                <button onClick={() => removeRow(ri)} style={{ width: 22, height: 22, borderRadius: 4, background: '#FEE2E2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', padding: 0 }}>
                  <Trash2 size={9} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="pdf-hidden" style={{ marginTop: 6, width: '100%', padding: '6px', borderRadius: 5, background: `${co}10`, border: `1px dashed ${co}50`, cursor: 'pointer', color: co, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Plus size={10} /> Ajouter une ligne
      </button>
    </div>
  )
}

// ─── Main BlockRenderer ──────────────────────────────���────────────────────────

export function BlockRenderer({
  block, color: co, entityName: en, pageId,
  onUpdateTable, onUpdateContent, onUpdateChart, onUpdateImage,
  dragHandleProps, fontBody, fontTitle,
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

  // ─��� Headings ────────────────────────────────────────────────────────────────
  if (type === 'h1') return wrap(<H1Block block={block} onUpdateContent={onUpdateContent} />, 'H1')
  if (type === 'h2') return wrap(<H2Block block={block} onUpdateContent={onUpdateContent} />, 'H2')
  if (type === 'h3') return wrap(<H3Block block={block} onUpdateContent={onUpdateContent} />, 'H3')
  if (type === 'h4') return wrap(<H4Block block={block} onUpdateContent={onUpdateContent} />, 'H4')

  // ── Lists ───────────────────────────────────────────────────────────────────
  if (type === 'bullet-list')   return wrap(<BulletListBlock block={block} onUpdateContent={onUpdateContent} />, 'Bullet List')
  if (type === 'numbered-list') return wrap(<NumberedListBlock block={block} onUpdateContent={onUpdateContent} />, 'Numbered List')

  // ── Classic blocks ──────────────────────────────────────────────────────────
  if (type === 'section') return wrap(<SectionBlock block={block} co={co} onUpdateContent={onUpdateContent} />, 'Section')
  if (type === 'text')    return wrap(<TextBlock block={block} onUpdateContent={onUpdateContent} fontFamily={fontBody || 'Times New Roman, serif'} />, 'Text')
  if (type === 'quote')   return wrap(<QuoteBlock block={block} co={co} entityName={en} onUpdateContent={onUpdateContent} />, 'Quote')
  if (type === 'table')   return wrap(<InteractiveTable block={block} co={co} onUpdateTable={onUpdateTable} />, 'Table')
  if (type === 'kpi')     return wrap(<KpiBlock block={block} co={co} onUpdateContent={onUpdateContent} />, 'KPI')
  if (type === 'clause')  return wrap(<ClauseBlock block={block} co={co} onUpdateContent={onUpdateContent} />, 'Clause')
  if (type === 'checklist') return wrap(<ChecklistBlock block={block} onUpdateContent={onUpdateContent} />, 'Checklist')

  if (type === 'image') return wrap(
    <ImageBlock
      blockId={block.id}
      initialSrc={block.imageData?.src || block.content || ''}
      initialCaption={block.imageData?.caption || ''}
      initialAlign={block.imageData?.align || 'center'}
      initialSize={block.imageData?.size || 'lg'}
      onUpdate={data => onUpdateImage?.(block.id, data as ImageBlockData)}
    />, 'Image'
  )

  if (type === 'chart') return wrap(
    <ChartBlock
      blockId={block.id}
      initialType={block.chartData?.type || 'bar'}
      initialData={block.chartData?.data}
      initialTitle={block.chartData?.title || 'Graphique'}
      accentColor={co}
      onUpdate={data => onUpdateChart?.(block.id, data)}
    />, 'Chart'
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

  if (type === 'divider') {
    // Check if this divider contains shape data
    let shapeData: any = null
    try {
      if (block.content) shapeData = JSON.parse(block.content)
    } catch {}

    // If it's a shape, render it
    if (shapeData?.shapeType) {
      const size = shapeData.size || 'md'
      const sizeMap = { sm: 24, md: 40, lg: 64 }
      const dims = sizeMap[size] || 40
      const color = shapeData.color || co

      const shapes: { [key: string]: JSX.Element } = {
        circle: (
          <svg viewBox="0 0 100 100" style={{ width: dims, height: dims }}>
            <circle cx="50" cy="50" r="48" fill={color} />
          </svg>
        ),
        rectangle: (
          <svg viewBox="0 0 100 100" style={{ width: dims, height: dims }}>
            <rect x="4" y="4" width="92" height="92" fill={color} />
          </svg>
        ),
        line: (
          <svg viewBox="0 0 100 100" style={{ width: dims, height: dims }}>
            <line x1="5" y1="50" x2="95" y2="50" stroke={color} strokeWidth="4" />
          </svg>
        ),
        triangle: (
          <svg viewBox="0 0 100 100" style={{ width: dims, height: dims }}>
            <polygon points="50,5 95,95 5,95" fill={color} />
          </svg>
        ),
        heart: (
          <svg viewBox="0 0 100 100" style={{ width: dims, height: dims }}>
            <path d="M50 90 C20 70, 5 60, 5 45 C5 30, 15 20, 25 20 C35 20, 45 28, 50 38 C55 28, 65 20, 75 20 C85 20, 95 30, 95 45 C95 60, 80 70, 50 90 Z" fill={color} />
          </svg>
        ),
        star: (
          <svg viewBox="0 0 100 100" style={{ width: dims, height: dims }}>
            <polygon points="50,10 61,39 90,39 68,57 79,86 50,68 21,86 32,57 10,39 39,39" fill={color} />
          </svg>
        ),
      }

      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }} className="pdf-hidden">
          {shapes[shapeData.shapeType] || <div style={{ width: dims, height: dims, background: color, borderRadius: 4 }} />}
        </div>
      )
    }

    // Regular divider (when no shape data)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: co, opacity: .4 }} />
        <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
      </div>
    )
  }

  return null
}
