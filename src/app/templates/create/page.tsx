'use client'
export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  Palette, Layout, Type, Layers, Settings, ChevronDown, ChevronUp,
  Check, X, Sparkles, PenTool,
} from 'lucide-react'
import { useCustomTemplates, type CoverLayout, type CoverStyle, DEFAULT_COVER_STYLE } from '@/contexts/CustomTemplateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { STYLE_PRESETS, FONT_TITLE_OPTIONS, type DocumentStyle, type BlockType } from '@/types'
import { PALETTE, TEMPLATES } from '@/lib/templates'
import { CoverPageEditor, type CoverBlock } from '@/components/editor/cover/CoverPageEditor'

type StudioTab = 'blocks' | 'style' | 'cover' | 'cover-editor' | 'meta'

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: 'section',   label: 'Titre de Section',    icon: '§',  desc: 'Titre avec barre colorée' },
  { type: 'text',      label: 'Paragraphe',           icon: '¶',  desc: 'Bloc de texte éditorial' },
  { type: 'quote',     label: 'Citation Exécutive',   icon: '"',  desc: 'Citation avec bordure' },
  { type: 'table',     label: 'Tableau de Données',   icon: '⊞',  desc: 'Tableau avec entêtes' },
  { type: 'kpi',       label: 'KPIs / Chiffres Clés', icon: '◈',  desc: 'Grille de métriques' },
  { type: 'clause',    label: 'Clause Juridique',     icon: '⚖',  desc: 'Clause avec titre et corps' },
  { type: 'sign',      label: 'Zone Signature',       icon: '✒',  desc: 'Zones de signature' },
  { type: 'divider',   label: 'Séparateur',           icon: '—',  desc: 'Ligne décorative' },
  { type: 'checklist', label: 'Liste de Contrôle',    icon: '☑',  desc: 'Liste de vérification' },
  { type: 'image',     label: 'Image / Illustration', icon: '🖼',  desc: 'Espace pour image' },
]

const COVER_LAYOUTS: { id: CoverLayout; label: string; desc: string }[] = [
  { id: 'classic',  label: 'Classic',  desc: 'Bande latérale + titre' },
  { id: 'bold',     label: 'Bold',     desc: 'Fond coloré + texte blanc' },
  { id: 'minimal',  label: 'Minimal',  desc: 'Épuré, ligne de bas' },
  { id: 'split',    label: 'Split',    desc: 'Moitié colorée / blanche' },
]

const TEMPLATE_CATEGORIES = ['Stratégie', 'Finance', 'Juridique', 'Commercial', 'Interne', 'Autre']
const EMOJI_OPTIONS = ['📊', '📄', '🔍', '📝', '✍️', '💰', '📋', '📈', '🏛️', '⚡', '🎯', '🌟', '💼', '🔧', '📦', '🤝']

interface BlockItem {
  id: string; type: BlockType; label: string; icon: string; defaultContent?: string
}

// ── Sidebar tabs config ───────────────────────────────────────────────────────

const TABS: { id: StudioTab; icon: React.ReactNode; label: string; highlight?: boolean }[] = [
  { id: 'blocks',       icon: <Layers size={16} />,   label: 'Blocs' },
  { id: 'style',        icon: <Type size={16} />,     label: 'Style typo' },
  { id: 'cover',        icon: <Layout size={16} />,   label: 'Couverture' },
  { id: 'cover-editor', icon: <PenTool size={16} />,  label: 'Éditeur Couv.', highlight: true },
  { id: 'meta',         icon: <Settings size={16} />, label: 'Infos template' },
]

// ── Pure cover background (no context hooks) ─────────────────────────────────

function CoverBg({ layout, accent }: { layout: string; accent: string }) {
  if (layout === 'bold') return (
    <div style={{ position: 'absolute', inset: 0, background: accent }}>
      <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
      <div style={{ position: 'absolute', right: 40, bottom: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
    </div>
  )
  if (layout === 'minimal') return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: accent }} />
    </div>
  )
  if (layout === 'split') return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      <div style={{ width: '45%', background: accent }} />
      <div style={{ flex: 1, background: '#fff' }} />
    </div>
  )
  // classic
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: accent }} />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

function TemplateCreatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const fromId = searchParams.get('from')

  const { createTemplate, updateTemplate, getTemplate } = useCustomTemplates()
  const { profile } = useProfile()
  const { toast, showToast } = useToast()

  const [activeTab, setActiveTab] = useState<StudioTab>('blocks')
  const [templateName, setTemplateName] = useState('Mon Nouveau Template')
  const [templateDesc, setTemplateDesc] = useState('Description de ce template')
  const [templateCategory, setTemplateCategory] = useState('Stratégie')
  const [templateIcon, setTemplateIcon] = useState('📊')
  const [templateTags, setTemplateTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const [docStyle, setDocStyle] = useState<DocumentStyle>(STYLE_PRESETS.classic)
  const [coverStyle, setCoverStyle] = useState<CoverStyle>(DEFAULT_COVER_STYLE)
  const [coverBlocks, setCoverBlocks] = useState<CoverBlock[]>([])

  const [blocks, setBlocks] = useState<BlockItem[]>([
    { id: '1', type: 'section', label: 'Titre de Section', icon: '§', defaultContent: 'SECTION 01 // TITRE' },
    { id: '2', type: 'text',    label: 'Paragraphe',       icon: '¶', defaultContent: 'Insérez votre contenu ici.' },
  ])

  const [dragId, setDragId] = useState<string | null>(null)

  // ── Load existing template ─────────────────────────────────────────────────

  useEffect(() => {
    if (editId) {
      const tpl = getTemplate(editId)
      if (tpl) {
        setTemplateName(tpl.name)
        setTemplateDesc(tpl.description)
        setTemplateCategory(tpl.category)
        setTemplateIcon(tpl.icon)
        setTemplateTags(tpl.tags)
        setIsPublic(tpl.isPublic)
        setDocStyle(tpl.docStyle)
        const cs = tpl.coverStyle
        setCoverStyle(cs)
        setCoverBlocks(cs.coverBlocks || [])
        setBlocks(tpl.blocks.map((b, i) => ({
          id: String(i + 1), type: b.type,
          label: BLOCK_TYPES.find(bt => bt.type === b.type)?.label || b.type,
          icon:  BLOCK_TYPES.find(bt => bt.type === b.type)?.icon  || '?',
          defaultContent: b.content,
        })))
      }
    } else if (fromId) {
      const src = TEMPLATES.find(t => t.id === fromId)
      if (src) {
        setTemplateName(`${src.name} (copie)`)
        if (src.coverStyle) { setCoverStyle(src.coverStyle); setCoverBlocks(src.coverStyle.coverBlocks || []) }
        setBlocks(src.blocks.map((b, i) => ({
          id: String(i + 1), type: b.type,
          label: BLOCK_TYPES.find(bt => bt.type === b.type)?.label || b.type,
          icon:  BLOCK_TYPES.find(bt => bt.type === b.type)?.icon  || '?',
          defaultContent: b.content,
        })))
      }
    }
  }, [editId, fromId, getTemplate])

  const addBlock = useCallback((type: BlockType) => {
    const meta = BLOCK_TYPES.find(b => b.type === type)
    if (!meta) return
    setBlocks(prev => [...prev, { id: Date.now().toString(), type, label: meta.label, icon: meta.icon }])
  }, [])

  const removeBlock = useCallback((id: string) => setBlocks(prev => prev.filter(b => b.id !== id)), [])

  const moveBlock = useCallback((fromIdx: number, toIdx: number) => {
    setBlocks(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  const handleSave = () => {
    if (!templateName.trim()) { showToast('Le nom du template est requis', 'err'); return }
    if (blocks.length === 0) { showToast('Ajoutez au moins un bloc de contenu', 'err'); return }

    const finalCoverStyle: CoverStyle = { ...coverStyle, coverBlocks }

    const payload = {
      name: templateName, description: templateDesc, category: templateCategory,
      icon: templateIcon, tags: templateTags,
      blocks: blocks.map(b => ({ type: b.type, content: b.defaultContent })),
      docStyle, coverStyle: finalCoverStyle, isPublic,
    }

    if (editId) { updateTemplate(editId, payload); showToast('Template mis à jour', 'ok') }
    else        { createTemplate(payload);           showToast('Template créé avec succès', 'ok') }
    setTimeout(() => router.push('/templates'), 800)
  }

  const inp  = { className: "w-full rounded-xl px-3.5 py-2.5 text-[13px] border outline-none font-sans", style: { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' } as React.CSSProperties }
  const lbl  = "block text-[10px] font-bold uppercase tracking-widest mb-2"

  // Active accent from cover style
  const accent = coverStyle.accentColor || profile.color || '#1B4FD8'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-6 flex-shrink-0"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/templates')}
            className="flex items-center gap-1.5 text-[12px] cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text4)' }}>
            <ArrowLeft size={14} /> Templates
          </button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <Sparkles size={14} color="var(--accent)" />
          <span className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
            {editId ? 'Modifier le template' : 'Créer un template'}
          </span>
          {/* Indicators */}
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest"
            style={{ background: 'var(--accentS)', color: 'var(--accent)' }}>
            {blocks.length} bloc{blocks.length > 1 ? 's' : ''} • couv. {coverStyle.layout}
          </span>
          {coverBlocks.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest"
              style={{ background: 'rgba(124,58,237,.1)', color: '#7C3AED' }}>
              ✏️ {coverBlocks.length} élément{coverBlocks.length > 1 ? 's' : ''} sur couverture
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save size={12} /> {editId ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Left tab rail */}
        <div className="w-12 border-r flex flex-col items-center py-4 gap-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all"
              style={activeTab === tab.id
                ? { background: tab.highlight ? 'rgba(124,58,237,.15)' : 'var(--accentS)', color: tab.highlight ? '#7C3AED' : 'var(--accent)' }
                : { background: 'transparent', color: tab.highlight ? '#9066e0' : 'var(--text4)' }
              }>
              {tab.icon}
            </button>
          ))}
        </div>

        {/* When cover-editor is active — full width canvas, no side panel */}
        {activeTab === 'cover-editor' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Cover editor toolbar */}
            <div style={{ height: 40, flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>
                Éditeur de couverture
              </span>
              <span style={{ fontSize: 10, color: 'var(--text4)' }}>
                Ajoutez librement textes, formes et images sur votre page de garde
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Layout selector quick-access */}
                <span style={{ fontSize: 10, color: 'var(--text4)' }}>Fond :</span>
                {COVER_LAYOUTS.map(l => (
                  <button key={l.id} onClick={() => setCoverStyle(s => ({ ...s, layout: l.id }))}
                    style={{ padding: '3px 9px', borderRadius: 6, border: '1px solid', fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all .12s',
                      borderColor: coverStyle.layout === l.id ? accent : 'var(--border)',
                      background: coverStyle.layout === l.id ? `${accent}18` : 'var(--bg2)',
                      color: coverStyle.layout === l.id ? accent : 'var(--text4)',
                    }}>
                    {l.label}
                  </button>
                ))}
                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                <span style={{ fontSize: 10, color: 'var(--text4)' }}>Couleur :</span>
                {PALETTE.slice(0, 6).map(c => (
                  <button key={c} onClick={() => setCoverStyle(s => ({ ...s, accentColor: c }))}
                    style={{ width: 18, height: 18, borderRadius: 4, background: c, border: `2px solid ${coverStyle.accentColor === c ? '#fff' : 'transparent'}`, cursor: 'pointer', outline: coverStyle.accentColor === c ? `2px solid ${c}` : 'none', outlineOffset: 1 }} />
                ))}
                <input type="color" value={coverStyle.accentColor || '#1B4FD8'}
                  onChange={e => setCoverStyle(s => ({ ...s, accentColor: e.target.value }))}
                  style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', padding: 1, cursor: 'pointer' }} />
              </div>
            </div>

            {/* CoverPageEditor fills remaining space */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <CoverPageEditor
                blocks={coverBlocks}
                onChange={setCoverBlocks}
                accentColor={accent}
                baseLayoutBg={
                  <CoverBg layout={coverStyle.layout} accent={accent} />
                }
              />
            </div>
          </div>
        ) : (
          <>
            {/* Settings panel (left) */}
            <div className="w-[280px] border-r overflow-y-auto" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="p-4">

                {/* BLOCKS TAB */}
                {activeTab === 'blocks' && (
                  <>
                    <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>Ajouter des Blocs</div>
                    <div className="flex flex-col gap-1.5">
                      {BLOCK_TYPES.map(bt => (
                        <button key={bt.type} onClick={() => addBlock(bt.type)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer text-left transition-all"
                          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.background = `${accent}12` }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}>
                          <span className="w-6 text-center text-[14px] flex-shrink-0" style={{ opacity: .7 }}>{bt.icon}</span>
                          <div className="flex-1">
                            <div className="text-[12px] font-bold">{bt.label}</div>
                            <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{bt.desc}</div>
                          </div>
                          <Plus size={12} style={{ color: accent, flexShrink: 0 }} />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* STYLE TAB */}
                {activeTab === 'style' && (
                  <>
                    <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>Style Typographique</div>
                    <label className={lbl} style={{ color: 'var(--text3)' }}>Preset</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[{ k:'classic',label:'Classic',icon:'🏛️'},{k:'modern',label:'Modern',icon:'⬡'},{k:'editorial',label:'Éditorial',icon:'📰'},{k:'minimal',label:'Minimal',icon:'◻'}].map(({k,label,icon}) => (
                        <button key={k} onClick={() => setDocStyle(STYLE_PRESETS[k])}
                          className="p-3 rounded-xl border cursor-pointer text-left transition-all"
                          style={{ background: docStyle.preset === k ? `${accent}18` : 'var(--surface)', borderColor: docStyle.preset === k ? accent : 'var(--border)' }}>
                          <div className="text-xl mb-1">{icon}</div>
                          <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{label}</div>
                        </button>
                      ))}
                    </div>
                    <label className={lbl} style={{ color: 'var(--text3)' }}>Police Titres</label>
                    <div className="flex flex-col gap-1.5 mb-4">
                      {FONT_TITLE_OPTIONS.map(f => (
                        <button key={f.value} onClick={() => setDocStyle(d => ({ ...d, fontTitle: f.value }))}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-left"
                          style={{ background: docStyle.fontTitle === f.value ? `${accent}18` : 'var(--surface)', borderColor: docStyle.fontTitle === f.value ? accent : 'var(--border)' }}>
                          <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 18, fontWeight: 700 }}>Aa</span>
                          <span className="text-[11px] font-bold" style={{ color: 'var(--text3)' }}>{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* COVER TAB */}
                {activeTab === 'cover' && (
                  <>
                    <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>Design de la Couverture</div>

                    {/* CTA toward cover editor */}
                    <div className="p-3 rounded-xl border mb-4 flex items-center gap-3 cursor-pointer"
                      style={{ background: 'rgba(124,58,237,.08)', borderColor: 'rgba(124,58,237,.3)' }}
                      onClick={() => setActiveTab('cover-editor')}>
                      <PenTool size={16} color="#7C3AED" />
                      <div>
                        <div className="text-[12px] font-bold" style={{ color: '#7C3AED' }}>Éditeur de couverture</div>
                        <div className="text-[10px]" style={{ color: '#9066e0' }}>Ajoutez textes, formes, images librement</div>
                      </div>
                      {coverBlocks.length > 0 && (
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#7C3AED', color: '#fff' }}>
                          {coverBlocks.length}
                        </span>
                      )}
                    </div>

                    <label className={lbl} style={{ color: 'var(--text3)' }}>Mise en Page de Base</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {COVER_LAYOUTS.map(layout => (
                        <button key={layout.id} onClick={() => setCoverStyle(s => ({ ...s, layout: layout.id }))}
                          className="p-3 rounded-xl border-2 cursor-pointer text-left transition-all"
                          style={{ borderColor: coverStyle.layout === layout.id ? accent : 'var(--border)', background: coverStyle.layout === layout.id ? `${accent}18` : 'var(--surface)' }}>
                          <div className="text-[11px] font-bold" style={{ color: coverStyle.layout === layout.id ? accent : 'var(--text)' }}>{layout.label}</div>
                          <div className="text-[9px]" style={{ color: 'var(--text4)', marginTop: 2 }}>{layout.desc}</div>
                        </button>
                      ))}
                    </div>

                    <label className={lbl} style={{ color: 'var(--text3)' }}>Couleur de la Couverture</label>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {PALETTE.map(c => (
                        <button key={c} onClick={() => setCoverStyle(s => ({ ...s, accentColor: c }))}
                          style={{ width: 26, height: 26, borderRadius: 6, background: c, cursor: 'pointer', border: `2px solid ${coverStyle.accentColor === c ? 'var(--text)' : 'transparent'}` }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <input type="color" value={coverStyle.accentColor || '#1B4FD8'}
                        onChange={e => setCoverStyle(s => ({ ...s, accentColor: e.target.value }))}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{ borderColor: 'var(--border)' }} />
                      <span className="text-[11px] font-mono" style={{ color: accent }}>{coverStyle.accentColor || '#1B4FD8'}</span>
                    </div>

                    <label className={lbl} style={{ color: 'var(--text3)' }}>Taille du Titre</label>
                    <div className="flex gap-2 mb-5">
                      {(['sm','md','lg','xl'] as const).map(s => (
                        <button key={s} onClick={() => setCoverStyle(cs => ({ ...cs, titleSize: s }))}
                          className="flex-1 py-2 rounded-lg border text-[10px] font-bold uppercase cursor-pointer transition-all"
                          style={{ borderColor: coverStyle.titleSize === s ? accent : 'var(--border)', background: coverStyle.titleSize === s ? `${accent}18` : 'transparent', color: coverStyle.titleSize === s ? accent : 'var(--text4)' }}>
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3">
                      {[{ k:'showLogo', l:'Afficher le logo' }, { k:'showQr', l:"QR code d'authenticité" }, { k:'showGrid', l:'Grille de fond' }].map(({ k, l }) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{l}</span>
                          <div onClick={() => setCoverStyle(s => ({ ...s, [k]: !s[k as keyof CoverStyle] }))}
                            className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
                            style={coverStyle[k as keyof CoverStyle] ? { background: accent, borderColor: accent } : { background: 'transparent', borderColor: 'var(--border2)' }}>
                            {coverStyle[k as keyof CoverStyle] && <Check size={11} color="#fff" strokeWidth={3} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* META TAB */}
                {activeTab === 'meta' && (
                  <>
                    <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>Informations Template</div>
                    <div className="mb-4">
                      <label className={lbl} style={{ color: 'var(--text3)' }}>Icône</label>
                      <div className="flex items-center gap-3 mb-2">
                        <div onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl cursor-pointer"
                          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                          {templateIcon}
                        </div>
                      </div>
                      {showEmojiPicker && (
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                          {EMOJI_OPTIONS.map(e => (
                            <button key={e} onClick={() => { setTemplateIcon(e); setShowEmojiPicker(false) }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer border-none text-xl"
                              style={{ background: e === templateIcon ? `${accent}18` : 'transparent' }}>
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className={lbl} style={{ color: 'var(--text3)' }}>Nom</label>
                      <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Nom du template" {...inp}
                        onFocus={e => { e.target.style.borderColor = accent; e.target.style.background = 'var(--surface)' }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg2)' }} />
                    </div>
                    <div className="mb-4">
                      <label className={lbl} style={{ color: 'var(--text3)' }}>Description</label>
                      <textarea className={inp.className} style={{ ...inp.style, height: 72, resize: 'vertical' }}
                        value={templateDesc} onChange={e => setTemplateDesc(e.target.value)}
                        onFocus={e => { e.target.style.borderColor = accent; e.target.style.background = 'var(--surface)' }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg2)' }} />
                    </div>
                    <div className="mb-4">
                      <label className={lbl} style={{ color: 'var(--text3)' }}>Catégorie</label>
                      <select className={inp.className} style={inp.style} value={templateCategory} onChange={e => setTemplateCategory(e.target.value)}>
                        {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className={lbl} style={{ color: 'var(--text3)' }}>Tags</label>
                      <div className="flex gap-2 mb-2">
                        <input className={`${inp.className} flex-1`} style={inp.style} value={newTag}
                          onChange={e => setNewTag(e.target.value)} placeholder="Ajouter un tag..."
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newTag.trim()) { setTemplateTags(p => [...p, newTag.trim()]); setNewTag('') } } }}
                          onFocus={e => { e.target.style.borderColor = accent; e.target.style.background = 'var(--surface)' }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg2)' }} />
                        <Button variant="ghost" size="sm" onClick={() => { if (newTag.trim()) { setTemplateTags(p => [...p, newTag.trim()]); setNewTag('') } }}><Plus size={12} /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {templateTags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer"
                            style={{ background: `${accent}18`, color: accent }}
                            onClick={() => setTemplateTags(p => p.filter(t => t !== tag))}>
                            {tag} <X size={9} />
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div>
                        <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>Template public</div>
                        <div className="text-[10px]" style={{ color: 'var(--text4)' }}>Visible par l'équipe</div>
                      </div>
                      <div onClick={() => setIsPublic(!isPublic)}
                        className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer"
                        style={isPublic ? { background: accent, borderColor: accent } : { background: 'transparent', borderColor: 'var(--border2)' }}>
                        {isPublic && <Check size={11} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Main content area — block list */}
            <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg3)' }}>
              <div className="max-w-[560px] mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                    Blocs de contenu
                    <span className="ml-2 text-[12px] font-normal" style={{ color: 'var(--text4)' }}>
                      {blocks.length} bloc{blocks.length > 1 ? 's' : ''}
                    </span>
                  </h2>
                  {coverBlocks.length > 0 && (
                    <button onClick={() => setActiveTab('cover-editor')}
                      className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer border"
                      style={{ borderColor: 'rgba(124,58,237,.3)', background: 'rgba(124,58,237,.08)', color: '#7C3AED' }}>
                      <PenTool size={11} /> Voir couverture ({coverBlocks.length})
                    </button>
                  )}
                </div>

                {blocks.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border2)' }}>
                    <Layers size={32} style={{ color: 'var(--text4)', margin: '0 auto 12px' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text4)' }}>Ajoutez des blocs depuis le panneau gauche</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {blocks.map((block, idx) => (
                      <div key={block.id}
                        className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                        draggable
                        onDragStart={() => setDragId(block.id)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => { if (!dragId || dragId === block.id) return; moveBlock(blocks.findIndex(b => b.id === dragId), idx); setDragId(null) }}
                        onDragEnd={() => setDragId(null)}
                      >
                        <div style={{ cursor: 'grab', color: 'var(--text4)' }}><GripVertical size={14} /></div>
                        <span className="w-6 text-center text-[16px]">{block.icon}</span>
                        <div className="flex-1">
                          <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{block.label}</div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>{idx + 1}</span>
                        <div className="flex gap-1">
                          <button onClick={() => idx > 0 && moveBlock(idx, idx - 1)} disabled={idx === 0}
                            className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none"
                            style={{ background: 'transparent', color: idx === 0 ? 'var(--border2)' : 'var(--text4)' }}>
                            <ChevronUp size={11} />
                          </button>
                          <button onClick={() => idx < blocks.length - 1 && moveBlock(idx, idx + 1)} disabled={idx === blocks.length - 1}
                            className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none"
                            style={{ background: 'transparent', color: idx === blocks.length - 1 ? 'var(--border2)' : 'var(--text4)' }}>
                            <ChevronDown size={11} />
                          </button>
                          <button onClick={() => removeBlock(block.id)}
                            className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none transition-all"
                            style={{ background: 'transparent', color: 'var(--text4)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DC2626'; (e.currentTarget as HTMLElement).style.background = '#FEE2E2' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text4)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Toast {...toast} />
    </div>
  )
}

export default function TemplateCreatorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <TemplateCreatorContent />
    </Suspense>
  )
}