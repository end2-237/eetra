'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Sparkles, Plus, ChevronDown, ChevronUp, RotateCcw,
  CheckCircle2, Loader2, BookOpen, FileText, GraduationCap,
  Wand2, AlignLeft, ArrowRight, Download, Layers,
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { generateId } from '@/lib/utils'
import type { DocBlock } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { id: 'rapport-stage',  label: 'Rapport de Stage',  icon: '🏢', short: 'Stage' },
  { id: 'memoire',        label: 'Mémoire / TFE',      icon: '🎓', short: 'Mémoire' },
  { id: 'these',          label: 'Thèse de Doctorat',  icon: '📚', short: 'Thèse' },
  { id: 'rapport-projet', label: 'Rapport de Projet',  icon: '📋', short: 'Projet' },
  { id: 'expose',         label: 'Exposé Académique',  icon: '🎤', short: 'Exposé' },
]

const NIVEAUX = [
  'BTS / DUT', 'Licence', 'Master 1', 'Master 2', 'Ingénieur', 'Doctorat',
]

const SECTION_TYPE_COLORS: Record<string, { bg: string; accent: string }> = {
  introduction: { bg: 'rgba(27,79,216,.08)',   accent: '#1B4FD8' },
  chapter:      { bg: 'rgba(5,150,105,.07)',   accent: '#059669' },
  conclusion:   { bg: 'rgba(124,58,237,.07)',  accent: '#7C3AED' },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GeneratedBlock { type: string; content: string }

interface GeneratedSection {
  id: string
  type: 'introduction' | 'chapter' | 'conclusion'
  chapterNum?: number
  title: string
  emoji: string
  preview?: string
  blocks: GeneratedBlock[]
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RadarPanel() {
  const {
    title, pages, currentPageIndex,
    addPage, setPageBlocks, addBlock, setCurrentPageIndex,
  } = useDocument()
  const { profile } = useProfile()
  const accent = profile.color || '#1B4FD8'

  // Form state
  const [theme, setTheme]               = useState(title || '')
  const [docType, setDocType]           = useState('rapport-stage')
  const [niveau, setNiveau]             = useState('Licence')
  const [chapterCount, setChapterCount] = useState(4)

  // UI state
  const [status, setStatus]                 = useState<'idle' | 'loading' | 'results'>('idle')
  const [sections, setSections]             = useState<GeneratedSection[]>([])
  const [error, setError]                   = useState('')
  const [inserted, setInserted]             = useState<Set<string>>(new Set())
  const [expanded, setExpanded]             = useState<string | null>(null)
  const [insertingAll, setInsertingAll]     = useState(false)
  const [successMsg, setSuccessMsg]         = useState('')

  // Sync theme with document title
  useEffect(() => {
    if (title && !theme) setTheme(title)
  }, [title])

  // Pending insert ref (for page-add flow)
  const pendingRef         = useRef<{ sectionId: string; blocks: DocBlock[] } | null>(null)
  const prevPagesLenRef    = useRef(pages.length)
  const insertQueueRef     = useRef<{ sectionId: string; blocks: DocBlock[] }[]>([])

  // Effect: detects when a new page was added and inserts pending blocks
  useEffect(() => {
    if (pages.length <= prevPagesLenRef.current) {
      prevPagesLenRef.current = pages.length
      return
    }
    prevPagesLenRef.current = pages.length

    const lastPage = pages[pages.length - 1]
    if (!lastPage) return

    // Single section pending
    if (pendingRef.current) {
      setPageBlocks(lastPage.id, pendingRef.current.blocks)
      setInserted(prev => new Set([...prev, pendingRef.current!.sectionId]))
      showSuccess(`Section insérée sur la page ${pages.length}`)
      pendingRef.current = null
      setCurrentPageIndex(pages.length - 1)
    }

    // Queue mode (insert all)
    if (insertQueueRef.current.length > 0) {
      const next = insertQueueRef.current.shift()!
      setPageBlocks(lastPage.id, next.blocks)
      setInserted(prev => new Set([...prev, next.sectionId]))
      setCurrentPageIndex(pages.length - 1)

      if (insertQueueRef.current.length > 0) {
        // Trigger next page
        setTimeout(() => addPage(), 80)
      } else {
        setInsertingAll(false)
        showSuccess('Tout le document a été inséré 🎉')
      }
    }
  }, [pages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Convert generated blocks to DocBlocks
  const toDocBlocks = (rawBlocks: GeneratedBlock[]): DocBlock[] =>
    rawBlocks.map(b => ({
      id: generateId(),
      type: b.type as DocBlock['type'],
      content: b.content,
    }))

  // Insert a single section
  const insertSection = useCallback((section: GeneratedSection) => {
    if (inserted.has(section.id)) return
    const blocks = toDocBlocks(section.blocks)

    // Find an existing empty page first
    const emptyPage = pages.find(p => p.blocks.length === 0)
    if (emptyPage) {
      setPageBlocks(emptyPage.id, blocks)
      setInserted(prev => new Set([...prev, section.id]))
      const idx = pages.findIndex(p => p.id === emptyPage.id)
      if (idx !== -1) setCurrentPageIndex(idx)
      showSuccess(`Section insérée sur la page ${idx + 2}`)
      return
    }

    // No empty page → create one
    pendingRef.current = { sectionId: section.id, blocks }
    addPage()
  }, [pages, inserted, setPageBlocks, addPage, setCurrentPageIndex])

  // Insert all sections
  const insertAll = useCallback(() => {
    if (sections.length === 0 || insertingAll) return
    const remaining = sections.filter(s => !inserted.has(s.id))
    if (remaining.length === 0) return

    setInsertingAll(true)

    const queue = remaining.map(s => ({
      sectionId: s.id,
      blocks: toDocBlocks(s.blocks),
    }))

    // Find empty pages first, use them
    const emptyPages = pages.filter(p => p.blocks.length === 0)
    let queueIdx = 0

    for (const ep of emptyPages) {
      if (queueIdx >= queue.length) break
      const item = queue[queueIdx++]
      setPageBlocks(ep.id, item.blocks)
      setInserted(prev => new Set([...prev, item.sectionId]))
      const idx = pages.findIndex(p => p.id === ep.id)
      if (idx !== -1) setCurrentPageIndex(idx)
    }

    // Remaining sections need new pages
    if (queueIdx < queue.length) {
      insertQueueRef.current = queue.slice(queueIdx)
      addPage()
    } else {
      setInsertingAll(false)
      showSuccess('Tout le document a été inséré 🎉')
    }
  }, [sections, inserted, insertingAll, pages, setPageBlocks, addPage, setCurrentPageIndex])

  // Generate document structure
  const generate = useCallback(async () => {
    if (!theme.trim() || theme.trim().length < 5) {
      setError('Entrez un thème (au moins 5 caractères)')
      return
    }
    setError('')
    setStatus('loading')

    try {
      const res = await fetch('/api/ai/document-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim(), docType, niveau, chapterCount }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la génération')
        setStatus('idle')
        return
      }

      if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
        setSections(data.sections)
        setInserted(new Set())
        setExpanded(null)
        setStatus('results')
      } else {
        setError('Réponse invalide. Réessayez.')
        setStatus('idle')
      }
    } catch {
      setError('Erreur de connexion réseau.')
      setStatus('idle')
    }
  }, [theme, docType, niveau, chapterCount])

  const reset = () => {
    setStatus('idle')
    setSections([])
    setInserted(new Set())
    setExpanded(null)
    setError('')
    setInsertingAll(false)
    insertQueueRef.current = []
    pendingRef.current = null
  }

  const toggleExpand = (id: string) => setExpanded(prev => prev === id ? null : id)

  // ── STYLES ────────────────────────────────────────────────────────────────

  const S = {
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      background: 'var(--bg2)',
      overflowY: 'auto' as const,
    } as React.CSSProperties,

    header: {
      padding: '14px 14px 10px',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    } as React.CSSProperties,

    body: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '12px 14px 24px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 10,
    } as React.CSSProperties,

    label: {
      fontSize: 9,
      fontWeight: 800 as const,
      letterSpacing: '.14em',
      textTransform: 'uppercase' as const,
      color: 'var(--text4)',
      display: 'block' as const,
      marginBottom: 5,
    } as React.CSSProperties,

    input: {
      width: '100%',
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontSize: 12,
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box' as const,
      lineHeight: 1.4,
    } as React.CSSProperties,
  }

  // ── RENDER: IDLE ──────────────────────────────────────────────────────────

  if (status === 'idle') return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <Wand2 size={14} color={accent} />
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
            Assistant Rédactionnel
          </span>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text4)', margin: 0, lineHeight: 1.5 }}>
          Génère le plan complet de ton document — introduction, chapitres, conclusion — et insère-le en un clic.
        </p>
      </div>

      <div style={S.body}>

        {/* Theme input */}
        <div>
          <label style={S.label}>Thème / Titre du document</label>
          <textarea
            value={theme}
            onChange={e => setTheme(e.target.value)}
            placeholder="Ex: La digitalisation des PME au Cameroun et ses impacts sur la performance financière"
            rows={3}
            style={{ ...S.input, resize: 'vertical', minHeight: 64, lineHeight: 1.5 }}
            onFocus={e => { e.target.style.borderColor = accent }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>

        {/* Doc type */}
        <div>
          <label style={S.label}>Type de document</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {DOC_TYPES.map(dt => (
              <button key={dt.id} onClick={() => setDocType(dt.id)}
                style={{
                  padding: '8px 8px',
                  borderRadius: 8,
                  border: '1.5px solid',
                  borderColor: docType === dt.id ? accent : 'var(--border)',
                  background: docType === dt.id ? `${accent}12` : 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  textAlign: 'left' as const,
                  transition: 'all .12s',
                }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{dt.icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: docType === dt.id ? accent : 'var(--text3)',
                  lineHeight: 1.3,
                }}>
                  {dt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Niveau */}
        <div>
          <label style={S.label}>Niveau académique</label>
          <select
            value={niveau}
            onChange={e => setNiveau(e.target.value)}
            style={{ ...S.input }}
            onFocus={e => { e.target.style.borderColor = accent }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          >
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Chapter count */}
        <div>
          <label style={S.label}>Nombre de chapitres — {chapterCount}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="range"
              min={2}
              max={7}
              value={chapterCount}
              onChange={e => setChapterCount(Number(e.target.value))}
              style={{ flex: 1, accentColor: accent }}
            />
            <div style={{ display: 'flex', gap: 2 }}>
              {[2, 3, 4, 5, 6, 7].map(n => (
                <button key={n} onClick={() => setChapterCount(n)}
                  style={{
                    width: 24, height: 24, borderRadius: 5, border: '1px solid',
                    cursor: 'pointer', fontSize: 10, fontWeight: 700,
                    borderColor: chapterCount === n ? accent : 'var(--border)',
                    background: chapterCount === n ? `${accent}18` : 'transparent',
                    color: chapterCount === n ? accent : 'var(--text4)',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '9px 12px',
            borderRadius: 8,
            background: 'rgba(220,38,38,.08)',
            border: '1px solid rgba(220,38,38,.2)',
            color: '#DC2626',
            fontSize: 11,
          }}>
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={generate}
          style={{
            padding: '11px',
            borderRadius: 10,
            border: 'none',
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            boxShadow: `0 4px 16px ${accent}33`,
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '.88' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          <Sparkles size={14} />
          Générer le plan complet
        </button>

        {/* Info */}
        <div style={{
          padding: '10px 12px',
          borderRadius: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          fontSize: 10,
          color: 'var(--text4)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text3)' }}>💡 Comment ça marche :</strong><br />
          1. Entre ton thème<br />
          2. Choisis le type et le niveau<br />
          3. Clique "Générer"<br />
          4. Insère chaque section dans ton document en un clic
        </div>
      </div>
    </div>
  )

  // ── RENDER: LOADING ───────────────────────────────────────────────────────

  if (status === 'loading') return (
    <div style={{ ...S.root, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: `${accent}18`,
        border: `2px solid ${accent}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 2s infinite',
      }}>
        <Sparkles size={22} color={accent} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
          Génération en cours...
        </div>
        <div style={{ fontSize: 11, color: 'var(--text4)', lineHeight: 1.6 }}>
          L'IA analyse ton thème et rédige<br />
          l'introduction, les chapitres et la conclusion
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 220 }}>
        {['Analyse du thème...', 'Structure académique...', 'Rédaction du contenu...'].map((step, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 10px',
            borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: 10,
            color: 'var(--text4)',
            animation: `fadeIn .5s ease ${i * 0.4}s both`,
          }}>
            <Loader2 size={10} color={accent} style={{ animation: 'spin 1s linear infinite' }} />
            {step}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.05)} }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )

  // ── RENDER: RESULTS ───────────────────────────────────────────────────────

  const allInserted = sections.length > 0 && sections.every(s => inserted.has(s.id))
  const insertedCount = inserted.size

  return (
    <div style={S.root}>

      {/* Results header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>
            Plan généré ✨
          </div>
          <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>
            {sections.length} sections · {insertedCount} insérée{insertedCount > 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={reset} title="Nouveau plan"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 9px', borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'var(--bg2)', cursor: 'pointer',
            fontSize: 10, fontWeight: 700, color: 'var(--text4)',
          }}>
          <RotateCcw size={10} /> Nouveau
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div style={{
          margin: '8px 14px 0',
          padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(5,150,105,.1)',
          border: '1px solid rgba(5,150,105,.3)',
          color: '#059669',
          fontSize: 11,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
          animation: 'fadeIn .3s ease',
        }}>
          <CheckCircle2 size={13} />
          {successMsg}
        </div>
      )}

      {/* Insert all button */}
      {!allInserted && sections.length > 0 && (
        <div style={{ padding: '10px 14px 0', flexShrink: 0 }}>
          <button
            onClick={insertAll}
            disabled={insertingAll}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 9,
              border: `1.5px solid ${accent}`,
              background: insertingAll ? 'var(--bg2)' : `${accent}12`,
              color: accent,
              cursor: insertingAll ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              opacity: insertingAll ? .6 : 1,
              transition: 'all .15s',
            }}>
            {insertingAll
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Insertion en cours...</>
              : <><Layers size={13} /> Tout insérer dans le document</>
            }
          </button>
        </div>
      )}

      {/* Sections list */}
      <div style={S.body}>
        {sections.map((section, idx) => {
          const colors = SECTION_TYPE_COLORS[section.type] || SECTION_TYPE_COLORS.chapter
          const isInserted = inserted.has(section.id)
          const isExpanded = expanded === section.id
          const blockCount = section.blocks.length

          return (
            <div key={section.id} style={{
              borderRadius: 10,
              border: `1.5px solid ${isInserted ? 'rgba(5,150,105,.3)' : 'var(--border)'}`,
              background: isInserted ? 'rgba(5,150,105,.05)' : 'var(--surface)',
              overflow: 'hidden',
              transition: 'all .15s',
            }}>
              {/* Section header */}
              <div style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                {/* Icon */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isInserted ? 'rgba(5,150,105,.12)' : colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}>
                  {isInserted ? '✅' : section.emoji}
                </div>

                {/* Title + preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: isInserted ? '#059669' : 'var(--text)',
                    lineHeight: 1.3,
                    marginBottom: 3,
                  }}>
                    {section.type === 'chapter' && section.chapterNum
                      ? `Ch. ${section.chapterNum} — `
                      : ''
                    }
                    {section.title}
                  </div>
                  {section.preview && (
                    <div style={{
                      fontSize: 10,
                      color: 'var(--text4)',
                      lineHeight: 1.4,
                    }}>
                      {section.preview}
                    </div>
                  )}
                  <div style={{
                    marginTop: 4,
                    fontSize: 9,
                    color: 'var(--text4)',
                  }}>
                    {blockCount} blocs · {section.type === 'introduction' ? 'Introduction' : section.type === 'conclusion' ? 'Conclusion' : 'Chapitre'}
                  </div>
                </div>
              </div>

              {/* Expand/collapse content preview */}
              {section.blocks.length > 0 && (
                <>
                  <button
                    onClick={() => toggleExpand(section.id)}
                    style={{
                      width: '100%',
                      padding: '4px 12px',
                      borderTop: '1px solid var(--border)',
                      background: 'var(--bg3)',
                      border: 'none',
                      borderTopColor: 'var(--border)',
                      borderTopStyle: 'solid',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 10,
                      color: 'var(--text4)',
                    }}>
                    <span>Aperçu du contenu</span>
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      padding: '8px 12px',
                      borderTop: '1px solid var(--border)',
                      maxHeight: 200,
                      overflowY: 'auto',
                      background: 'var(--bg)',
                    }}>
                      {section.blocks.map((block, bi) => {
                        if (block.type === 'section') return (
                          <div key={bi} style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: '.15em',
                            textTransform: 'uppercase',
                            color: colors.accent,
                            marginBottom: 6,
                            marginTop: bi > 0 ? 8 : 0,
                          }}>
                            {block.content}
                          </div>
                        )
                        if (block.type === 'h2') return (
                          <div key={bi} style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--text)',
                            marginBottom: 4,
                            marginTop: bi > 0 ? 8 : 0,
                          }}>
                            {block.content}
                          </div>
                        )
                        if (block.type === 'h3') return (
                          <div key={bi} style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'var(--text2)',
                            marginBottom: 3,
                            marginTop: 6,
                          }}>
                            {block.content}
                          </div>
                        )
                        return (
                          <p key={bi} style={{
                            fontSize: 10,
                            color: 'var(--text4)',
                            lineHeight: 1.6,
                            margin: '0 0 6px',
                          }}>
                            {block.content?.slice(0, 180)}{block.content?.length > 180 ? '...' : ''}
                          </p>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Insert button */}
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 6,
              }}>
                {isInserted ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '7px',
                    borderRadius: 7,
                    background: 'rgba(5,150,105,.1)',
                    color: '#059669',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    <CheckCircle2 size={13} />
                    Inséré dans le document
                  </div>
                ) : (
                  <button
                    onClick={() => insertSection(section)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 7,
                      border: 'none',
                      background: colors.accent,
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      transition: 'opacity .15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '.85' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                  >
                    <Plus size={12} />
                    Insérer sur une nouvelle page
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Bottom info */}
        {allInserted && (
          <div style={{
            padding: '12px',
            borderRadius: 10,
            background: 'rgba(5,150,105,.08)',
            border: '1px solid rgba(5,150,105,.2)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 4 }}>
              Tout le plan est inséré !
            </div>
            <div style={{ fontSize: 10, color: 'var(--text4)', lineHeight: 1.5 }}>
              Clique sur chaque page dans l'éditeur<br />
              pour compléter et personnaliser ton document.
            </div>
          </div>
        )}

        {!allInserted && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: 10,
            color: 'var(--text4)',
            lineHeight: 1.6,
          }}>
            💡 Chaque section sera insérée sur sa propre page. Tu pourras ensuite éditer le contenu directement dans l'éditeur.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  )
}