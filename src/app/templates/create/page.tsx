'use client'
export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  Palette, Layout, Type, Layers, Settings, ChevronDown, ChevronUp,
  Check, X, Sparkles, PenTool, Globe, Lock, Eye, EyeOff,
  ZoomIn, ZoomOut, Undo2, Redo2,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useCustomTemplates, type CoverLayout, type CoverStyle, DEFAULT_COVER_STYLE } from '@/contexts/CustomTemplateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePlan } from '@/contexts/PlanContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { STYLE_PRESETS, FONT_TITLE_OPTIONS, type DocumentStyle, type BlockType } from '@/types'
import { PALETTE, TEMPLATES } from '@/lib/templates'
import { DocumentProvider, useDocument, STORAGE_DRAFT } from '@/contexts/DocumentContext'
import { EditableCoverPage } from '@/components/editor/document/EditableCoverPage'
import { CoverAnalyzerButton } from '@/components/templates/CoverAnalyzerButton'

type StudioTab = 'blocks' | 'style' | 'cover' | 'cover-editor' | 'meta' | 'publish'

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

const COVER_LAYOUTS: { id: CoverLayout; label: string; desc: string; preview: React.ReactNode }[] = [
  { id: 'classic',  label: 'Classic',  desc: 'Bande latérale + titre centré',   preview: <ClassicPreview /> },
  { id: 'bold',     label: 'Bold',     desc: 'Fond coloré + texte blanc',        preview: <BoldPreview /> },
  { id: 'minimal',  label: 'Minimal',  desc: 'Épuré, ligne de bas',              preview: <MinimalPreview /> },
  { id: 'split',    label: 'Split',    desc: 'Moitié colorée / blanche',         preview: <SplitPreview /> },
]

const TEMPLATE_CATEGORIES = ['Stratégie', 'Finance', 'Juridique', 'Commercial', 'Interne', 'Gouvernance', 'Ressources Humaines', 'Autre']
const EMOJI_OPTIONS = ['📊', '📄', '🔍', '📝', '✍️', '💰', '📋', '📈', '🏛️', '⚡', '🎯', '🌟', '💼', '🔧', '📦', '🤝', '🚀', '🌱', '👥', '⚖️']

const ZOOM_LEVELS = [0.40, 0.52, 0.62, 0.75, 0.90, 1.0]

interface BlockItem {
  id: string; type: BlockType; label: string; icon: string; defaultContent?: string
}

// ── Mini cover previews ───────────────────────────────────────────────────────

function ClassicPreview() {
  return (
    <svg viewBox="0 0 60 85" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="85" fill="white"/>
      <rect x="0" y="0" width="3" height="85" fill="currentColor"/>
      <rect x="8" y="32" width="44" height="6" rx="2" fill="currentColor" opacity=".9"/>
      <rect x="8" y="42" width="32" height="5" rx="2" fill="currentColor" opacity=".7"/>
    </svg>
  )
}

function BoldPreview() {
  return (
    <svg viewBox="0 0 60 85" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="85" fill="currentColor"/>
      <rect x="8" y="42" width="44" height="7" rx="2" fill="white" opacity=".95"/>
      <rect x="8" y="53" width="32" height="5" rx="2" fill="white" opacity=".7"/>
      <rect x="0" y="72" width="60" height="13" fill="white" opacity=".12"/>
    </svg>
  )
}

function MinimalPreview() {
  return (
    <svg viewBox="0 0 60 85" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="85" fill="white"/>
      <rect x="0" y="82" width="60" height="3" fill="currentColor"/>
      <rect x="8" y="42" width="44" height="7" rx="2" fill="#0D1117" opacity=".9"/>
      <rect x="8" y="53" width="28" height="5" rx="2" fill="#0D1117" opacity=".6"/>
    </svg>
  )
}

function SplitPreview() {
  return (
    <svg viewBox="0 0 60 85" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="85" fill="white"/>
      <rect x="0" y="0" width="26" height="85" fill="currentColor"/>
      <rect x="5" y="42" width="16" height="5" rx="2" fill="white" opacity=".9"/>
    </svg>
  )
}

// ── Sidebar tabs ──────────────────────────────────────────────────────────────

const TABS: { id: StudioTab; icon: React.ReactNode; label: string; highlight?: boolean }[] = [
  { id: 'blocks',       icon: <Layers size={16} />,   label: 'Blocs' },
  { id: 'style',        icon: <Type size={16} />,     label: 'Style' },
  { id: 'cover',        icon: <Layout size={16} />,   label: 'Couverture' },
  { id: 'cover-editor', icon: <PenTool size={16} />,  label: 'Éditeur', highlight: true },
  { id: 'meta',         icon: <Settings size={16} />, label: 'Infos' },
  { id: 'publish',      icon: <Globe size={16} />,    label: 'Publier' },
]

// ── Pure cover background ─────────────────────────────────────────────────────

function CoverBg({ layout, accent }: { layout: string; accent: string }) {
  if (layout === 'bold') return (
    <div style={{ position: 'absolute', inset: 0, background: accent }}>
      <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
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
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: accent }} />
    </div>
  )
}

// ── Cover Editor Bridge ───────────────────────────────────────────────────────

function CoverEditorBridge({
  initialCoverStyle,
  onCoverStyleChange,
  zoom,
}: {
  initialCoverStyle: CoverStyle
  onCoverStyleChange: (cs: CoverStyle) => void
  zoom: number
}) {
  const { coverStyle, setCoverStyle } = useDocument()
  const pushedRef   = useRef(false)
  const prevJsonRef = useRef('')

  useEffect(() => {
    if (pushedRef.current) return
    const t = setTimeout(() => {
      pushedRef.current = true
      setCoverStyle(initialCoverStyle)
    }, 60)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pushedRef.current) return
    const json = JSON.stringify(coverStyle)
    if (json !== prevJsonRef.current) {
      prevJsonRef.current = json
      onCoverStyleChange(coverStyle)
    }
  }, [coverStyle]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 48px' }}>
      <EditableCoverPage zoom={zoom} />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

function TemplateCreatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const fromId = searchParams.get('from')

  const { createTemplate, updateTemplate, getTemplate, publishTemplate, unpublishTemplate } = useCustomTemplates()
  const { profile } = useProfile()
  const { planId } = usePlan()
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

  const [showLogoOption, setShowLogoOption] = useState(true)
  const [showQrOption, setShowQrOption] = useState(true)
  const [showGridOption, setShowGridOption] = useState(false)
  const [titleSize, setTitleSize] = useState<'sm'|'md'|'lg'|'xl'>('lg')
  const [accentColor, setAccentColor] = useState('#1B4FD8')
  const [selectedLayout, setSelectedLayout] = useState<CoverLayout>('classic')

  const [blocks, setBlocks] = useState<BlockItem[]>([
    { id: '1', type: 'section', label: 'Titre de Section', icon: '§', defaultContent: 'SECTION 01 // TITRE' },
    { id: '2', type: 'text',    label: 'Paragraphe',       icon: '¶', defaultContent: 'Insérez votre contenu ici.' },
  ])

  const [dragId, setDragId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(editId)

  // Loading states
  const [saving,     setSaving]     = useState(false)
  const [publishing, setPublishing] = useState(false)

  // ── Cover-editor zoom & undo/redo ──────────────────────────────────────────
  const [coverEditorZoom, setCoverEditorZoom] = useState(0.62)
  const coverHistoryRef  = useRef<CoverStyle[]>([])
  const coverHistoryIdx  = useRef(-1)
  const [coverCanUndo, setCoverCanUndo] = useState(false)
  const [coverCanRedo, setCoverCanRedo] = useState(false)

  const syncCoverFlags = () => {
    setCoverCanUndo(coverHistoryIdx.current > 0)
    setCoverCanRedo(coverHistoryIdx.current < coverHistoryRef.current.length - 1)
  }

  const pushCoverHistory = useCallback((cs: CoverStyle) => {
    // trim any redo tail
    if (coverHistoryIdx.current < coverHistoryRef.current.length - 1) {
      coverHistoryRef.current = coverHistoryRef.current.slice(0, coverHistoryIdx.current + 1)
    }
    coverHistoryRef.current.push(cs)
    if (coverHistoryRef.current.length > 40) coverHistoryRef.current.shift()
    coverHistoryIdx.current = coverHistoryRef.current.length - 1
    syncCoverFlags()
  }, [])

  const handleCoverStyleChange = useCallback((cs: CoverStyle) => {
    pushCoverHistory(cs)
    setCoverStyle(cs)
    // keep simple-mode controls in sync
    setSelectedLayout(cs.layout)
    setAccentColor(cs.accentColor || '#1B4FD8')
    setShowLogoOption(cs.showLogo)
    setShowQrOption(cs.showQr)
    setShowGridOption(cs.showGrid)
    setTitleSize(cs.titleSize)
  }, [pushCoverHistory])

  const handleApplyGeneratedCover = useCallback((style: CoverStyle, newTitle?: string) => {
    handleCoverStyleChange(style)
    if (newTitle) {
      setTemplateName(newTitle)
    }
    showToast('Style de couverture appliqué', 'ok')
  }, [handleCoverStyleChange, showToast])

  const coverUndo = useCallback(() => {
    if (coverHistoryIdx.current <= 0) return
    coverHistoryIdx.current -= 1
    const prev = coverHistoryRef.current[coverHistoryIdx.current]
    setCoverStyle(prev)
    syncCoverFlags()
  }, [])

  const coverRedo = useCallback(() => {
    if (coverHistoryIdx.current >= coverHistoryRef.current.length - 1) return
    coverHistoryIdx.current += 1
    const next = coverHistoryRef.current[coverHistoryIdx.current]
    setCoverStyle(next)
    syncCoverFlags()
  }, [])

  const zoomIn  = () => setCoverEditorZoom(z => Math.min(1.0, parseFloat((z + 0.1).toFixed(2))))
  const zoomOut = () => setCoverEditorZoom(z => Math.max(0.30, parseFloat((z - 0.1).toFixed(2))))

  // ── Keyboard shortcuts for cover-editor ─────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'cover-editor') return
    const kd = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); coverUndo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); coverRedo() }
    }
    document.addEventListener('keydown', kd)
    return () => document.removeEventListener('keydown', kd)
  }, [activeTab, coverUndo, coverRedo])

  const savedDraftRef = useRef<string | null>(null)

  useEffect(() => {
    if (activeTab === 'cover-editor') {
      try { savedDraftRef.current = localStorage.getItem(STORAGE_DRAFT) } catch {}
    } else if (savedDraftRef.current !== undefined) {
      const snap = savedDraftRef.current
      const t = setTimeout(() => {
        try {
          if (snap) localStorage.setItem(STORAGE_DRAFT, snap)
          else localStorage.removeItem(STORAGE_DRAFT)
        } catch {}
      }, 200)
      return () => clearTimeout(t)
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'cover-editor') return
    setCoverStyle(prev => ({
      ...prev,
      layout: selectedLayout,
      accentColor,
      showLogo: showLogoOption,
      showQr: showQrOption,
      showGrid: showGridOption,
      titleSize,
    }))
  }, [selectedLayout, accentColor, showLogoOption, showQrOption, showGridOption, titleSize, activeTab])

  // Load existing template
  useEffect(() => {
    const id = editId || fromId
    if (!id) return
    const tpl = getTemplate(id)
    if (!tpl) return

    if (editId) {
      setTemplateName(tpl.name)
      setTemplateDesc(tpl.description)
      setTemplateCategory(tpl.category)
      setTemplateIcon(tpl.icon)
      setTemplateTags(tpl.tags)
      setIsPublic(tpl.isPublic)
      setDocStyle(tpl.docStyle)
    } else {
      setTemplateName(`${tpl.name} (copie)`)
    }

    const cs = tpl.coverStyle
    setCoverStyle(cs)
    setSelectedLayout(cs.layout)
    setAccentColor(cs.accentColor || '#1B4FD8')
    setShowLogoOption(cs.showLogo)
    setShowQrOption(cs.showQr)
    setShowGridOption(cs.showGrid)
    setTitleSize(cs.titleSize)

    if (tpl.blocks?.length > 0) {
      setBlocks(tpl.blocks.map((b, i) => ({
        id: String(i + 1),
        type: b.type,
        label: BLOCK_TYPES.find(bt => bt.type === b.type)?.label || b.type,
        icon:  BLOCK_TYPES.find(bt => bt.type === b.type)?.icon  || '▪',
        defaultContent: b.content,
      })))
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

  const buildPayload = () => ({
    name:        templateName,
    description: templateDesc,
    category:    templateCategory,
    icon:        templateIcon,
    tags:        templateTags,
    blocks:      blocks.map(b => ({ type: b.type, content: b.defaultContent })),
    docStyle,
    coverStyle,
    isPublic,
    author:       profile.name || 'EETRA User',
    authorAvatar: '👤',
    likes:        0,
  })

  const handleSave = async () => {
    if (!templateName.trim()) { showToast('Le nom du template est requis', 'err'); return }
    if (blocks.length === 0)  { showToast('Ajoutez au moins un bloc de contenu', 'err'); return }

    setSaving(true)
    try {
      const payload = buildPayload()

      if (editId) {
        await updateTemplate(editId, payload)
        showToast('Template mis à jour', 'ok')
        setSavedId(editId)
      } else {
        const created = await createTemplate(payload)
        showToast('Template créé avec succès', 'ok')
        setSavedId(created.id)
      }
      setTimeout(() => router.push('/templates'), 800)
    } catch {
      showToast('Erreur lors de la sauvegarde', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!savedId && !editId) { showToast("Sauvegardez d'abord le template", 'err'); return }
    const id = savedId || editId!
    setPublishing(true)
    try {
      await publishTemplate(id)
      setIsPublic(true)
      showToast('Template publié dans la communauté', 'ok')
    } catch {
      showToast('Erreur lors de la publication', 'err')
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    const id = savedId || editId
    if (!id) return
    setPublishing(true)
    try {
      await unpublishTemplate(id)
      setIsPublic(false)
      showToast('Template retiré de la communauté', 'ok')
    } catch {
      showToast('Erreur lors du retrait', 'err')
    } finally {
      setPublishing(false)
    }
  }

  const accent = accentColor || profile.color || '#1B4FD8'

  const inp = {
    className: "w-full rounded-xl px-3.5 py-2.5 text-[13px] border outline-none font-sans",
    style: { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' } as React.CSSProperties
  }
  const lbl = "block text-[10px] font-bold uppercase tracking-widest mb-2"

  // ── Cover settings panel ──────────────────────────────────────────────────

  const CoverSettingsPanel = () => (
    <>
      <div className="p-3 rounded-xl border mb-4 flex items-center gap-3 cursor-pointer"
        style={{ background: 'rgba(124,58,237,.08)', borderColor: 'rgba(124,58,237,.3)' }}
        onClick={() => setActiveTab('cover-editor')}>
        <PenTool size={16} color="#7C3AED" />
        <div>
          <div className="text-[12px] font-bold" style={{ color: '#7C3AED' }}>Éditeur de couverture avancé</div>
          <div className="text-[10px]" style={{ color: '#9066e0' }}>Formes, textes, effets, dégradés, calques</div>
        </div>
        {(coverStyle.coverBlocks?.length || 0) > 0 && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#7C3AED', color: '#fff' }}>
            {coverStyle.coverBlocks!.length}
          </span>
        )}
      </div>

      <label className={lbl} style={{ color: 'var(--text3)' }}>Mise en page</label>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {COVER_LAYOUTS.map(layout => (
          <button key={layout.id}
            onClick={() => setSelectedLayout(layout.id)}
            className="p-3 rounded-xl border-2 cursor-pointer text-left transition-all overflow-hidden"
            style={{
              borderColor: selectedLayout === layout.id ? accent : 'var(--border)',
              background:  selectedLayout === layout.id ? `${accent}18` : 'var(--surface)',
            }}>
            <div className="h-12 rounded-lg overflow-hidden mb-2 flex items-center justify-center"
              style={{ background: 'var(--bg3)', color: accent }}>
              {layout.preview}
            </div>
            <div className="text-[11px] font-bold" style={{ color: selectedLayout === layout.id ? accent : 'var(--text)' }}>{layout.label}</div>
            <div className="text-[9px]" style={{ color: 'var(--text4)', marginTop: 2 }}>{layout.desc}</div>
          </button>
        ))}
      </div>

      <label className={lbl} style={{ color: 'var(--text3)' }}>Couleur principale</label>
      <div className="flex gap-2 flex-wrap mb-3">
        {PALETTE.map(c => (
          <button key={c} onClick={() => setAccentColor(c)}
            style={{ width: 26, height: 26, borderRadius: 6, background: c, cursor: 'pointer',
              border: `2.5px solid ${accentColor === c ? 'var(--text)' : 'transparent'}`,
              transform: accentColor === c ? 'scale(1.2)' : 'scale(1)', transition: 'all .15s' }} />
        ))}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <input type="color" value={accentColor}
          onChange={e => setAccentColor(e.target.value)}
          className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{ borderColor: 'var(--border)' }} />
        <span className="text-[11px] font-mono" style={{ color: accent }}>{accentColor}</span>
      </div>

      <label className={lbl} style={{ color: 'var(--text3)' }}>Taille du titre</label>
      <div className="flex gap-2 mb-5">
        {(['sm','md','lg','xl'] as const).map(s => (
          <button key={s} onClick={() => setTitleSize(s)}
            className="flex-1 py-2 rounded-lg border text-[10px] font-bold uppercase cursor-pointer transition-all"
            style={{
              borderColor: titleSize === s ? accent : 'var(--border)',
              background:  titleSize === s ? `${accent}18` : 'transparent',
              color:       titleSize === s ? accent : 'var(--text4)',
            }}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <label className={lbl} style={{ color: 'var(--text3)' }}>Options</label>
      <div className="flex flex-col gap-3">
        {[
          { key: 'logo', label: 'Afficher le logo',     val: showLogoOption, set: setShowLogoOption },
          { key: 'qr',   label: 'QR code authenticité', val: showQrOption,   set: setShowQrOption   },
          { key: 'grid', label: 'Grille de fond',        val: showGridOption, set: setShowGridOption  },
        ].map(({ key, label, val, set }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{label}</span>
            <div onClick={() => set(!val)}
              className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
              style={val ? { background: accent, borderColor: accent } : { background: 'transparent', borderColor: 'var(--border2)' }}>
              {val && <Check size={11} color="#fff" strokeWidth={3} />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', aspectRatio: '.707', position: 'relative', background: '#fff' }}>
        <CoverBg layout={selectedLayout} accent={accent} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, zIndex: 2 }}>
          <div style={{ fontSize: titleSize === 'xl' ? 20 : titleSize === 'lg' ? 17 : titleSize === 'md' ? 14 : 11,
            fontWeight: 900, color: selectedLayout === 'bold' ? '#fff' : '#0D1117', letterSpacing: '-.02em', lineHeight: 1 }}>
            {templateName || 'Titre du document'}
          </div>
        </div>
      </div>
    </>
  )

  // ── Publish panel ─────────────────────────────────────────────────────────

  const PublishPanel = () => (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-xl border"
        style={{ background: isPublic ? 'rgba(5,150,105,.06)' : 'var(--bg2)', borderColor: isPublic ? 'rgba(5,150,105,.3)' : 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-2">
          {isPublic ? <Globe size={16} color="#059669" /> : <Lock size={16} color="var(--text4)" />}
          <span className="text-[13px] font-bold" style={{ color: isPublic ? '#059669' : 'var(--text)' }}>
            {isPublic ? 'Publié dans la communauté' : 'Privé — visible uniquement par vous'}
          </span>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text4)' }}>
          {isPublic
            ? 'Votre template est accessible à tous les utilisateurs EETRA depuis la galerie.'
            : 'Publiez votre template pour le rendre accessible à la communauté EETRA.'}
        </p>
      </div>

      <div>
        <label className={lbl} style={{ color: 'var(--text3)' }}>Présenté comme</label>
        <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
          <div>
            <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{profile.name || 'Votre nom'}</div>
            <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{profile.sector || 'Votre secteur'}</div>
          </div>
        </div>
      </div>

      <div>
        <label className={lbl} style={{ color: 'var(--text3)' }}>Avant de publier</label>
        <div className="flex flex-col gap-2">
          {[
            { ok: templateName.length > 3,  text: 'Nom du template (min. 4 caractères)' },
            { ok: templateDesc.length > 10, text: 'Description informative' },
            { ok: blocks.length >= 2,        text: 'Au moins 2 blocs de contenu' },
            { ok: templateTags.length > 0,   text: 'Au moins 1 tag de recherche' },
            { ok: templateCategory !== '',   text: 'Catégorie définie' },
            { ok: !!(savedId || editId),     text: 'Template sauvegardé en BD' },
          ].map(({ ok, text }) => (
            <div key={text} className="flex items-center gap-2">
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: ok ? 'rgba(5,150,105,.12)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {ok ? <Check size={9} color="#059669" strokeWidth={3} /> : <span style={{ fontSize: 8, color: 'var(--text4)' }}>–</span>}
              </div>
              <span className="text-[11px]" style={{ color: ok ? 'var(--text)' : 'var(--text4)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!isPublic ? (
          <button onClick={handlePublish}
            disabled={publishing || (!savedId && !editId)}
            className="w-full p-3 rounded-xl border-none cursor-pointer font-bold text-[13px] flex items-center justify-center gap-2"
            style={{ background: '#059669', color: '#fff', opacity: publishing || (!savedId && !editId) ? .6 : 1 }}>
      {publishing ? <LoadingSpinner size={14} className="text-current" /> : <Globe size={14} />}
      {publishing ? 'Publication…' : 'Publier dans la communauté'}
          </button>
        ) : (
          <button onClick={handleUnpublish}
            disabled={publishing}
            className="w-full p-3 rounded-xl cursor-pointer font-bold text-[12px] flex items-center justify-center gap-2"
            style={{ background: 'transparent', border: '1px solid rgba(220,38,38,.3)', color: '#DC2626', opacity: publishing ? .6 : 1 }}>
      {publishing ? <LoadingSpinner size={13} className="text-current" /> : <EyeOff size={13} />}
      {publishing ? 'Retrait…' : 'Retirer de la communauté'}
          </button>
        )}
      </div>

      {isPublic && (
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(5,150,105,.06)', border: '1px solid rgba(5,150,105,.2)' }}>
          <div className="text-[11px] font-bold" style={{ color: '#059669', marginBottom: 3 }}>✓ Visible par tous les utilisateurs EETRA</div>
          <div className="text-[10px]" style={{ color: 'var(--text4)' }}>Synchronisé en temps réel avec la base de données</div>
        </div>
      )}
    </div>
  )

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
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest"
            style={{ background: 'var(--accentS)', color: 'var(--accent)' }}>
            {blocks.length} bloc{blocks.length > 1 ? 's' : ''} · couv. {selectedLayout}
          </span>
          {(coverStyle.coverBlocks?.length || 0) > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest"
              style={{ background: 'rgba(124,58,237,.1)', color: '#7C3AED' }}>
              {coverStyle.coverBlocks!.length} élément{coverStyle.coverBlocks!.length > 1 ? 's' : ''}
            </span>
          )}
          {isPublic && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1"
              style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>
              <Globe size={10} /> Publié
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('publish')}>
            <Globe size={12} /> {isPublic ? 'Gérer' : 'Publier'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
  {saving
    ? <><LoadingSpinner size={12} className="text-current" /> Sauvegarde…</>
    : <><Save size={12} /> {editId ? 'Mettre à jour' : 'Enregistrer'}</>
  }
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Left tab rail */}
        <div className="w-12 border-r flex flex-col items-center py-4 gap-2"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all relative"
              style={activeTab === tab.id
                ? { background: tab.highlight ? 'rgba(124,58,237,.15)' : tab.id === 'publish' ? 'rgba(5,150,105,.15)' : 'var(--accentS)', color: tab.highlight ? '#7C3AED' : tab.id === 'publish' ? '#059669' : 'var(--accent)' }
                : { background: 'transparent', color: tab.highlight ? '#9066e0' : tab.id === 'publish' ? '#059669' : 'var(--text4)' }
              }>
              {tab.icon}
              {tab.id === 'publish' && isPublic && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#059669', border: '1px solid var(--surface)' }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Cover-editor: full width ── */}
        {activeTab === 'cover-editor' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Cover-editor toolbar */}
            <div style={{
              height: 44, flexShrink: 0,
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
              display: 'flex', alignItems: 'center',
              padding: '0 16px', gap: 8,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Éditeur de couverture</span>
              <span style={{ fontSize: 10, color: 'var(--text4)' }}>Formes · textes · effets · calques</span>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Undo / Redo */}
              <button
                onClick={coverUndo}
                disabled={!coverCanUndo}
                title="Annuler (Ctrl+Z)"
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'transparent', cursor: coverCanUndo ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: coverCanUndo ? 'var(--text3)' : 'var(--border2)',
                  opacity: coverCanUndo ? 1 : 0.4,
                }}
              >
                <Undo2 size={13} />
              </button>
              <button
                onClick={coverRedo}
                disabled={!coverCanRedo}
                title="Rétablir (Ctrl+Y)"
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'transparent', cursor: coverCanRedo ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: coverCanRedo ? 'var(--text3)' : 'var(--border2)',
                  opacity: coverCanRedo ? 1 : 0.4,
                }}
              >
                <Redo2 size={13} />
              </button>

              <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />

              {/* Zoom controls */}
              <button
                onClick={zoomOut}
                title="Zoom arrière"
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}
              >
                <ZoomOut size={13} />
              </button>

              {/* Zoom level selector */}
              <select
                value={coverEditorZoom}
                onChange={e => setCoverEditorZoom(parseFloat(e.target.value))}
                style={{ height: 28, padding: '0 6px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)', cursor: 'pointer', outline: 'none' }}
              >
                {ZOOM_LEVELS.map(z => (
                  <option key={z} value={z}>{Math.round(z * 100)}%</option>
                ))}
              </select>

              <button
                onClick={zoomIn}
                title="Zoom avant"
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}
              >
                <ZoomIn size={13} />
              </button>

              <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />

              <button
                onClick={() => setActiveTab('cover')}
                style={{ fontSize: 10, fontWeight: 700, color: 'var(--text4)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
              >
                ← Mode simple
              </button>
            </div>

            {/* Cover editor canvas — scrollable */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <DocumentProvider>
                <CoverEditorBridge
                  initialCoverStyle={coverStyle}
                  onCoverStyleChange={handleCoverStyleChange}
                  zoom={coverEditorZoom}
                />
              </DocumentProvider>
            </div>
          </div>
        ) : (
          <>
            {/* Settings panel */}
            <div className="w-[280px] border-r overflow-y-auto"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="p-4">

                {/* BLOCKS */}
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

                {/* STYLE */}
                {activeTab === 'style' && (
                  <>
                    <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>Style Typographique</div>
                    <label className={lbl} style={{ color: 'var(--text3)' }}>Preset</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[{k:'classic',label:'Classic',icon:'🏛️'},{k:'modern',label:'Modern',icon:'⬡'},{k:'editorial',label:'Éditorial',icon:'📰'},{k:'minimal',label:'Minimal',icon:'◻'}].map(({k,label,icon}) => (
                        <button key={k} onClick={() => setDocStyle(STYLE_PRESETS[k])}
                          className="p-3 rounded-xl border cursor-pointer text-left transition-all"
                          style={{ background: docStyle.preset === k ? `${accent}18` : 'var(--surface)', borderColor: docStyle.preset === k ? accent : 'var(--border)' }}>
                          <div className="text-xl mb-1">{icon}</div>
                          <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{label}</div>
                        </button>
                      ))}
                    </div>
                    <label className={lbl} style={{ color: 'var(--text3)' }}>Police Titres</label>
                    <div className="flex flex-col gap-1.5">
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

                {activeTab === 'cover' && <CoverSettingsPanel />}

                {/* META */}
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
                      <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Nom du template" {...inp} />
                    </div>
                    <div className="mb-4">
                      <label className={lbl} style={{ color: 'var(--text3)' }}>Description</label>
                      <textarea className={inp.className} style={{ ...inp.style, height: 72, resize: 'vertical' }}
                        value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} />
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
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newTag.trim()) { setTemplateTags(p => [...p, newTag.trim()]); setNewTag('') } } }} />
                        <Button variant="ghost" size="sm" onClick={() => { if (newTag.trim()) { setTemplateTags(p => [...p, newTag.trim()]); setNewTag('') } }}>
                          <Plus size={12} />
                        </Button>
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
                  </>
                )}

                {activeTab === 'publish' && <PublishPanel />}
              </div>
            </div>

            {/* Main — block list */}
            <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg3)' }}>
              <div className="max-w-[560px] mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                    Blocs de contenu
                    <span className="ml-2 text-[12px] font-normal" style={{ color: 'var(--text4)' }}>
                      {blocks.length} bloc{blocks.length > 1 ? 's' : ''}
                    </span>
                  </h2>
                  <div className="flex gap-2">
                    {(coverStyle.coverBlocks?.length || 0) > 0 && (
                      <button onClick={() => setActiveTab('cover-editor')}
                        className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer border"
                        style={{ borderColor: 'rgba(124,58,237,.3)', background: 'rgba(124,58,237,.08)', color: '#7C3AED' }}>
                        <PenTool size={11} /> Couverture ({coverStyle.coverBlocks!.length})
                      </button>
                    )}
                    <button onClick={() => setActiveTab('cover')}
                      className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer border"
                      style={{ borderColor: `${accent}40`, background: `${accent}10`, color: accent }}>
                      <Layout size={11} /> Cover: {selectedLayout}
                    </button>
                  </div>
                </div>

                {/* Cover mini preview */}
                <div className="mb-6 p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>Aperçu couverture</div>
                    <CoverAnalyzerButton
                      isPro={planId === 'pro' || planId === 'business'}
                      currentTitle={templateName}
                      onApplyCover={handleApplyGeneratedCover}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div style={{ width: 80, aspectRatio: '.707', position: 'relative', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,.15)', flexShrink: 0 }}>
                      <CoverBg layout={selectedLayout} accent={accent} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 8, zIndex: 2 }}>
                        <div style={{ fontSize: 7, fontWeight: 900, color: selectedLayout === 'bold' ? '#fff' : '#0D1117', letterSpacing: '-.01em', lineHeight: 1.2 }}>
                          {templateName || 'Titre'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] font-bold mb-1" style={{ color: 'var(--text)' }}>
                        Design {selectedLayout.charAt(0).toUpperCase() + selectedLayout.slice(1)}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${accent}14`, color: accent }}>{selectedLayout}</span>
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--bg3)', color: 'var(--text4)' }}>titre {titleSize}</span>
                        {(coverStyle.coverBlocks?.length || 0) > 0 && (
                          <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(124,58,237,.1)', color: '#7C3AED' }}>{coverStyle.coverBlocks!.length} éléments</span>
                        )}
                        {(savedId || editId) && (
                          <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(5,150,105,.1)', color: '#059669' }}>✓ sauvegardé</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('cover-editor')} className="ml-auto cursor-pointer border-none bg-transparent"
                      style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED' }}>
                      Éditer →
                    </button>
                  </div>
                </div>

                {blocks.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border2)' }}>
                    <Layers size={32} style={{ color: 'var(--text4)', margin: '0 auto 12px' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text4)' }}>Ajoutez des blocs depuis le panneau de gauche</p>
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
                          {block.defaultContent && (
                            <div className="text-[10px] truncate" style={{ color: 'var(--text4)', maxWidth: 200 }}>{block.defaultContent}</div>
                          )}
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
