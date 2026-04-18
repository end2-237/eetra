'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Wand2, Sparkles, RotateCcw, Loader2,
  CheckCircle2, Plus, ChevronDown, ChevronUp,
  Layers, FileText, GraduationCap, BookOpen,
  ClipboardList, Presentation, Target, ArrowRight,
  CheckCheck,
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { generateId } from '@/lib/utils'
import type { DocBlock } from '@/types'

const DOC_TYPES = [
  { id: 'rapport-stage',  label: 'Rapport de Stage',  Icon: ClipboardList,  short: 'Stage' },
  { id: 'memoire',        label: 'Mémoire / TFE',      Icon: BookOpen,       short: 'Mémoire' },
  { id: 'these',          label: 'Thèse de Doctorat',  Icon: GraduationCap,  short: 'Thèse' },
  { id: 'rapport-projet', label: 'Rapport de Projet',  Icon: FileText,       short: 'Projet' },
  { id: 'expose',         label: 'Exposé Académique',  Icon: Presentation,   short: 'Exposé' },
]

const NIVEAUX = ['BTS / DUT', 'Licence', 'Master 1', 'Master 2', 'Ingénieur', 'Doctorat']

const SECTION_TYPE_CONFIG: Record<string, { color: string; bg: string; Icon: React.ComponentType<any> }> = {
  introduction: { color: '#1B4FD8', bg: 'rgba(27,79,216,.08)',  Icon: FileText },
  chapter:      { color: '#059669', bg: 'rgba(5,150,105,.07)',  Icon: BookOpen },
  conclusion:   { color: '#7C3AED', bg: 'rgba(124,58,237,.07)', Icon: Target },
}

interface GeneratedBlock { type: string; content: string }
interface GeneratedSection {
  id: string; type: 'introduction' | 'chapter' | 'conclusion'
  chapterNum?: number; title: string; emoji?: string; preview?: string; blocks: GeneratedBlock[]
}

export function RadarPanel() {
  const { title, pages, currentPageIndex, addPage, setPageBlocks, setCurrentPageIndex } = useDocument()
  const { profile } = useProfile()
  const accent = profile.color || '#1B4FD8'

  const [theme, setTheme] = useState(title || '')
  const [docType, setDocType] = useState('rapport-stage')
  const [niveau, setNiveau] = useState('Licence')
  const [chapterCount, setChapterCount] = useState(4)
  const [status, setStatus] = useState<'idle' | 'loading' | 'results'>('idle')
  const [sections, setSections] = useState<GeneratedSection[]>([])
  const [error, setError] = useState('')
  const [inserted, setInserted] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [insertingAll, setInsertingAll] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => { if (title && !theme) setTheme(title) }, [title])

  const pendingRef = useRef<{ sectionId: string; blocks: DocBlock[] } | null>(null)
  const prevPagesLenRef = useRef(pages.length)
  const insertQueueRef = useRef<{ sectionId: string; blocks: DocBlock[] }[]>([])

  useEffect(() => {
    if (pages.length <= prevPagesLenRef.current) { prevPagesLenRef.current = pages.length; return }
    prevPagesLenRef.current = pages.length
    const lastPage = pages[pages.length - 1]
    if (!lastPage) return
    if (pendingRef.current) {
      setPageBlocks(lastPage.id, pendingRef.current.blocks)
      setInserted(prev => new Set([...prev, pendingRef.current!.sectionId]))
      showSuccess(`Section insérée sur la page ${pages.length}`)
      pendingRef.current = null
      setCurrentPageIndex(pages.length - 1)
    }
    if (insertQueueRef.current.length > 0) {
      const next = insertQueueRef.current.shift()!
      setPageBlocks(lastPage.id, next.blocks)
      setInserted(prev => new Set([...prev, next.sectionId]))
      setCurrentPageIndex(pages.length - 1)
      if (insertQueueRef.current.length > 0) setTimeout(() => addPage(), 80)
      else { setInsertingAll(false); showSuccess('Tout le document a été inséré') }
    }
  }, [pages.length])

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000) }

  const toDocBlocks = (rawBlocks: GeneratedBlock[]): DocBlock[] =>
    rawBlocks.map(b => ({ id: generateId(), type: b.type as DocBlock['type'], content: b.content }))

  const insertSection = useCallback((section: GeneratedSection) => {
    if (inserted.has(section.id)) return
    const blocks = toDocBlocks(section.blocks)
    const emptyPage = pages.find(p => p.blocks.length === 0)
    if (emptyPage) {
      setPageBlocks(emptyPage.id, blocks)
      setInserted(prev => new Set([...prev, section.id]))
      const idx = pages.findIndex(p => p.id === emptyPage.id)
      if (idx !== -1) setCurrentPageIndex(idx)
      showSuccess(`Section insérée sur la page ${idx + 2}`)
      return
    }
    pendingRef.current = { sectionId: section.id, blocks }
    addPage()
  }, [pages, inserted, setPageBlocks, addPage, setCurrentPageIndex])

  const insertAll = useCallback(() => {
    if (sections.length === 0 || insertingAll) return
    const remaining = sections.filter(s => !inserted.has(s.id))
    if (remaining.length === 0) return
    setInsertingAll(true)
    const queue = remaining.map(s => ({ sectionId: s.id, blocks: toDocBlocks(s.blocks) }))
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
    if (queueIdx < queue.length) { insertQueueRef.current = queue.slice(queueIdx); addPage() }
    else { setInsertingAll(false); showSuccess('Tout le document a été inséré') }
  }, [sections, inserted, insertingAll, pages, setPageBlocks, addPage, setCurrentPageIndex])

  const generate = useCallback(async () => {
    if (!theme.trim() || theme.trim().length < 5) { setError('Entrez un thème (au moins 5 caractères)'); return }
    setError(''); setStatus('loading')
    try {
      const res = await fetch('/api/document-assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim(), docType, niveau, chapterCount }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur lors de la génération'); setStatus('idle'); return }
      if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
        setSections(data.sections); setInserted(new Set()); setExpanded(null); setStatus('results')
      } else { setError('Réponse invalide. Réessayez.'); setStatus('idle') }
    } catch { setError('Erreur de connexion réseau.'); setStatus('idle') }
  }, [theme, docType, niveau, chapterCount])

  const reset = () => { setStatus('idle'); setSections([]); setInserted(new Set()); setExpanded(null); setError(''); setInsertingAll(false); insertQueueRef.current = []; pendingRef.current = null }
  const toggleExpand = (id: string) => setExpanded(prev => prev === id ? null : id)

  const S = {
    root: { height: '100%', display: 'flex', flexDirection: 'column' as const, background: 'var(--bg2)', overflowY: 'auto' as const, overflowX: 'hidden' as const, boxSizing: 'border-box' as const },
    header: { padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 },
    body: { flex: 1, overflowY: 'auto' as const, padding: '12px 14px 24px', display: 'flex', flexDirection: 'column' as const, gap: 10, boxSizing: 'border-box' as const },
    label: { fontSize: 9, fontWeight: 800 as const, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: 'var(--text4)', display: 'block' as const, marginBottom: 5 },
    input: { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.4 },
  }

  if (status === 'idle') return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <Wand2 size={14} color={accent} />
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Assistant Rédactionnel</span>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text4)', margin: 0, lineHeight: 1.5 }}>
          Génère le plan complet de ton document et insère-le en un clic.
        </p>
      </div>

      <div style={S.body}>
        <div>
          <label style={S.label}>Thème / Titre</label>
          <textarea value={theme} onChange={e => setTheme(e.target.value)}
            placeholder="Ex: La digitalisation des PME au Cameroun..." rows={3}
            style={{ ...S.input, resize: 'vertical', minHeight: 64, lineHeight: 1.5 }}
            onFocus={e => { e.target.style.borderColor = accent }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
        </div>

        <div>
          <label style={S.label}>Type de document</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {DOC_TYPES.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setDocType(id)} style={{
                padding: '8px', borderRadius: 8, border: '1.5px solid',
                borderColor: docType === id ? accent : 'var(--border)',
                background: docType === id ? `${accent}12` : 'var(--surface)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                textAlign: 'left' as const, transition: 'all .12s',
              }}>
                <Icon size={13} color={docType === id ? accent : 'var(--text4)'} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: docType === id ? accent : 'var(--text3)', lineHeight: 1.3 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={S.label}>Niveau académique</label>
          <select value={niveau} onChange={e => setNiveau(e.target.value)} style={S.input}
            onFocus={e => { e.target.style.borderColor = accent }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}>
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <label style={S.label}>Chapitres — {chapterCount}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="range" min={2} max={7} value={chapterCount}
              onChange={e => setChapterCount(Number(e.target.value))}
              style={{ flex: 1, accentColor: accent }} />
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              {[2, 3, 4, 5, 6, 7].map(n => (
                <button key={n} onClick={() => setChapterCount(n)} style={{
                  width: 24, height: 24, borderRadius: 5, border: '1px solid', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                  borderColor: chapterCount === n ? accent : 'var(--border)',
                  background: chapterCount === n ? `${accent}18` : 'transparent',
                  color: chapterCount === n ? accent : 'var(--text4)',
                }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', color: '#DC2626', fontSize: 11 }}>
            {error}
          </div>
        )}

        <button onClick={generate} style={{
          padding: '11px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          boxShadow: `0 4px 16px ${accent}33`,
        }}>
          <Sparkles size={14} /> Générer le plan complet
        </button>

        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { step: '1', text: 'Entre ton thème ou colle un titre existant' },
            { step: '2', text: 'Choisis le type de document et le niveau' },
            { step: '3', text: 'Clique "Générer" et patiente quelques secondes' },
            { step: '4', text: 'Insère chaque section sur une nouvelle page' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${accent}18`, border: `1.5px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: accent }}>{step}</span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text4)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (status === 'loading') return (
    <div style={{ ...S.root, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${accent}18`, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={22} color={accent} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Génération en cours...</div>
        <div style={{ fontSize: 11, color: 'var(--text4)', lineHeight: 1.6 }}>
          Rédaction de l'introduction,<br />des chapitres et de la conclusion
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 220 }}>
        {[{ label: 'Analyse du thème', Icon: Wand2 }, { label: 'Structure académique', Icon: Layers }, { label: 'Rédaction du contenu', Icon: FileText }].map(({ label, Icon }, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8,
            background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text4)',
          }}>
            <Loader2 size={10} color={accent} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  const allInserted = sections.length > 0 && sections.every(s => inserted.has(s.id))
  const insertedCount = inserted.size

  return (
    <div style={S.root}>
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={13} color="#059669" />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>Plan généré</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2 }}>
            {sections.length} sections · {insertedCount} insérée{insertedCount > 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: 'var(--text4)' }}>
          <RotateCcw size={10} /> Nouveau
        </button>
      </div>

      {successMsg && (
        <div style={{ margin: '8px 14px 0', padding: '8px 12px', borderRadius: 8, background: 'rgba(5,150,105,.1)', border: '1px solid rgba(5,150,105,.3)', color: '#059669', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <CheckCircle2 size={13} />{successMsg}
        </div>
      )}

      {!allInserted && sections.length > 0 && (
        <div style={{ padding: '10px 14px 0', flexShrink: 0 }}>
          <button onClick={insertAll} disabled={insertingAll} style={{
            width: '100%', padding: '10px', borderRadius: 9, border: `1.5px solid ${accent}`,
            background: insertingAll ? 'var(--bg2)' : `${accent}12`, color: accent,
            cursor: insertingAll ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            opacity: insertingAll ? .6 : 1,
          }}>
            {insertingAll ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Insertion...</>
              : <><Layers size={13} /> Tout insérer dans le document</>}
          </button>
        </div>
      )}

      <div style={S.body}>
        {sections.map((section) => {
          const cfg = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.chapter
          const SectionIcon = cfg.Icon
          const isInserted = inserted.has(section.id)
          const isExpanded = expanded === section.id
          return (
            <div key={section.id} style={{
              borderRadius: 10, border: `1.5px solid ${isInserted ? 'rgba(5,150,105,.3)' : 'var(--border)'}`,
              background: isInserted ? 'rgba(5,150,105,.05)' : 'var(--surface)', overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: isInserted ? 'rgba(5,150,105,.12)' : cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isInserted ? <CheckCheck size={15} color="#059669" /> : <SectionIcon size={15} color={cfg.color} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, lineHeight: 1.3, marginBottom: 3, color: isInserted ? '#059669' : 'var(--text)' }}>
                    {section.type === 'chapter' && section.chapterNum ? `Ch. ${section.chapterNum} — ` : ''}
                    {section.title}
                  </div>
                  {section.preview && <div style={{ fontSize: 10, color: 'var(--text4)', lineHeight: 1.4 }}>{section.preview}</div>}
                  <div style={{ marginTop: 4, fontSize: 9, color: 'var(--text4)' }}>
                    {section.blocks.length} blocs · {section.type === 'introduction' ? 'Introduction' : section.type === 'conclusion' ? 'Conclusion' : 'Chapitre'}
                  </div>
                </div>
              </div>

              {section.blocks.length > 0 && (
                <>
                  <button onClick={() => toggleExpand(section.id)} style={{
                    width: '100%', padding: '4px 12px', borderTop: '1px solid var(--border)',
                    background: 'var(--bg3)', border: 'none', borderTopColor: 'var(--border)', borderTopStyle: 'solid',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--text4)',
                  }}>
                    <span>Aperçu du contenu</span>
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                  {isExpanded && (
                    <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', maxHeight: 180, overflowY: 'auto', background: 'var(--bg)' }}>
                      {section.blocks.map((block, bi) => {
                        if (block.type === 'section') return <div key={bi} style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: cfg.color, marginBottom: 6, marginTop: bi > 0 ? 8 : 0 }}>{block.content}</div>
                        if (block.type === 'h2') return <div key={bi} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 4, marginTop: bi > 0 ? 8 : 0 }}>{block.content}</div>
                        if (block.type === 'h3') return <div key={bi} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)', marginBottom: 3, marginTop: 6 }}>{block.content}</div>
                        return <p key={bi} style={{ fontSize: 10, color: 'var(--text4)', lineHeight: 1.6, margin: '0 0 6px' }}>{block.content?.slice(0, 180)}{(block.content?.length ?? 0) > 180 ? '...' : ''}</p>
                      })}
                    </div>
                  )}
                </>
              )}

              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
                {isInserted ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px', borderRadius: 7, background: 'rgba(5,150,105,.1)', color: '#059669', fontSize: 11, fontWeight: 700 }}>
                    <CheckCircle2 size={13} /> Inséré
                  </div>
                ) : (
                  <button onClick={() => insertSection(section)} style={{
                    flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: cfg.color, color: '#fff', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    <Plus size={12} /> Insérer sur une nouvelle page
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {allInserted && (
          <div style={{ padding: '16px 12px', borderRadius: 10, background: 'rgba(5,150,105,.08)', border: '1px solid rgba(5,150,105,.2)', textAlign: 'center' }}>
            <CheckCheck size={28} color="#059669" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 4 }}>Tout le plan est inséré !</div>
            <div style={{ fontSize: 10, color: 'var(--text4)', lineHeight: 1.5 }}>Cliquez sur chaque page dans l'éditeur pour compléter votre document.</div>
          </div>
        )}

        {!allInserted && (
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text4)', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <ArrowRight size={12} color="var(--text4)" style={{ flexShrink: 0, marginTop: 1 }} />
            Chaque section sera insérée sur sa propre page.
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}