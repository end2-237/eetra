'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, FileText,
  Palette, Layout, Type, Layers, Settings, ChevronDown, ChevronUp,
  Check, X, Tag, Sparkles, Move
} from 'lucide-react'
import { useCustomTemplates, type CustomTemplate, type CoverLayout, type CoverStyle, DEFAULT_COVER_STYLE } from '@/contexts/CustomTemplateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { STYLE_PRESETS, FONT_TITLE_OPTIONS, FONT_BODY_OPTIONS, type DocumentStyle, type BlockType } from '@/types'
import { PALETTE, TEMPLATES } from '@/lib/templates'

type StudioTab = 'blocks' | 'style' | 'cover' | 'meta'

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: 'section',   label: 'Titre de Section',    icon: '§',  desc: 'Titre de section avec barre colorée' },
  { type: 'text',      label: 'Paragraphe',           icon: '¶',  desc: 'Bloc de texte éditorial' },
  { type: 'quote',     label: 'Citation Exécutive',   icon: '"',  desc: 'Citation stylisée avec bordure' },
  { type: 'table',     label: 'Tableau de Données',   icon: '⊞',  desc: 'Tableau avec entêtes et lignes' },
  { type: 'kpi',       label: 'KPIs / Chiffres Clés', icon: '◈',  desc: 'Grille de métriques visuelles' },
  { type: 'clause',    label: 'Clause Juridique',     icon: '⚖',  desc: 'Clause avec titre et corps' },
  { type: 'sign',      label: 'Zone Signature',       icon: '✒',  desc: 'Zones de signature émetteur/dest.' },
  { type: 'divider',   label: 'Séparateur',           icon: '—',  desc: 'Ligne de séparation décorative' },
  { type: 'checklist', label: 'Liste de Contrôle',    icon: '☑',  desc: 'Liste de vérification interactive' },
  { type: 'image',     label: 'Image / Illustration', icon: '🖼',  desc: 'Espace pour image ou logo' },
]

const COVER_LAYOUTS: { id: CoverLayout; label: string; desc: string; preview: React.ReactNode }[] = [
  {
    id: 'classic',
    label: 'Classic',
    desc: 'Bande latérale + titre centré',
    preview: (
      <div style={{ width: '100%', height: 80, background: '#fff', position: 'relative', border: '1px solid #e8e8e8', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: 'var(--accent)' }} />
        <div style={{ padding: '12px 10px 12px 14px' }}>
          <div style={{ height: 4, background: '#e8e8e8', borderRadius: 2, marginBottom: 6, width: '70%' }} />
          <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, marginBottom: 4, width: '45%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, marginTop: 8 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 10, background: '#f5f7fa', borderRadius: 2 }} />)}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'bold',
    label: 'Bold',
    desc: 'Fond coloré + texte blanc inversé',
    preview: (
      <div style={{ width: '100%', height: 80, background: 'var(--accent)', position: 'relative', border: '1px solid #e8e8e8', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '12px 10px' }}>
          <div style={{ height: 5, background: 'rgba(255,255,255,.4)', borderRadius: 2, marginBottom: 6, width: '60%' }} />
          <div style={{ height: 3, background: 'rgba(255,255,255,.25)', borderRadius: 2, width: '40%' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimal',
    desc: 'Épuré avec fine bordure basse',
    preview: (
      <div style={{ width: '100%', height: 80, background: '#fff', position: 'relative', border: '1px solid #e8e8e8', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'var(--accent)' }} />
        <div style={{ padding: '16px 12px' }}>
          <div style={{ height: 5, background: '#0D1117', borderRadius: 2, marginBottom: 8, width: '80%' }} />
          <div style={{ height: 2, background: '#e8e8e8', borderRadius: 2, width: '50%' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'split',
    label: 'Split',
    desc: 'Moitié colorée / moitié blanche',
    preview: (
      <div style={{ width: '100%', height: 80, position: 'relative', border: '1px solid #e8e8e8', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
        <div style={{ flex: 1, background: 'var(--accent)', padding: '12px 8px' }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,.4)', borderRadius: 2, marginBottom: 5 }} />
          <div style={{ height: 3, background: 'rgba(255,255,255,.25)', borderRadius: 2 }} />
        </div>
        <div style={{ flex: 1, background: '#fff', padding: '12px 8px' }}>
          <div style={{ height: 3, background: '#e8e8e8', borderRadius: 2, marginBottom: 5 }} />
          <div style={{ height: 2, background: '#f0f0f0', borderRadius: 2 }} />
        </div>
      </div>
    ),
  },
]

const PRESET_INFO: Record<string, { label: string; icon: string }> = {
  classic:   { label: 'Classic',    icon: '🏛️' },
  modern:    { label: 'Modern',     icon: '⬡' },
  editorial: { label: 'Éditorial',  icon: '📰' },
  minimal:   { label: 'Minimal',    icon: '◻' },
}

const TEMPLATE_CATEGORIES = ['Stratégie', 'Finance', 'Juridique', 'Commercial', 'Interne', 'Autre']

const EMOJI_OPTIONS = ['📊', '📄', '🔍', '📝', '✍️', '💰', '📋', '📈', '🏛️', '⚡', '🎯', '🌟', '💼', '🔧', '📦', '🤝']

interface BlockItem {
  id: string
  type: BlockType
  label: string
  icon: string
  defaultContent?: string
}

export default function TemplateCreatorPage() {
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

  const [docStyle, setDocStyle] = useState<DocumentStyle>(STYLE_PRESETS.classic)
  const [coverStyle, setCoverStyle] = useState<CoverStyle>(DEFAULT_COVER_STYLE)

  const [blocks, setBlocks] = useState<BlockItem[]>([
    { id: '1', type: 'section', label: 'Titre de Section', icon: '§', defaultContent: 'SECTION 01 // TITRE' },
    { id: '2', type: 'text', label: 'Paragraphe', icon: '¶', defaultContent: 'Insérez votre contenu ici.' },
  ])

  const [dragId, setDragId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Load existing template for edit
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
        setCoverStyle(tpl.coverStyle)
        setBlocks(tpl.blocks.map((b, i) => ({
          id: String(i + 1),
          type: b.type,
          label: BLOCK_TYPES.find(bt => bt.type === b.type)?.label || b.type,
          icon: BLOCK_TYPES.find(bt => bt.type === b.type)?.icon || '?',
          defaultContent: b.content,
        })))
      }
    } else if (fromId) {
      const src = TEMPLATES.find(t => t.id === fromId)
      if (src) {
        setTemplateName(`${src.name} (copie)`)
        setBlocks(src.blocks.map((b, i) => ({
          id: String(i + 1),
          type: b.type,
          label: BLOCK_TYPES.find(bt => bt.type === b.type)?.label || b.type,
          icon: BLOCK_TYPES.find(bt => bt.type === b.type)?.icon || '?',
          defaultContent: b.content,
        })))
      }
    }
  }, [editId, fromId, getTemplate])

  const addBlock = useCallback((type: BlockType) => {
    const meta = BLOCK_TYPES.find(b => b.type === type)
    if (!meta) return
    const id = Date.now().toString()
    setBlocks(prev => [...prev, { id, type, label: meta.label, icon: meta.icon }])
  }, [])

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }, [])

  const moveBlock = useCallback((fromIdx: number, toIdx: number) => {
    setBlocks(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  const addTag = () => {
    if (newTag.trim() && !templateTags.includes(newTag.trim())) {
      setTemplateTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => setTemplateTags(prev => prev.filter(t => t !== tag))

  const handleSave = () => {
    if (!templateName.trim()) { showToast('Le nom du template est requis', 'err'); return }
    if (blocks.length === 0) { showToast('Ajoutez au moins un bloc', 'err'); return }

    const payload = {
      name: templateName,
      description: templateDesc,
      category: templateCategory,
      icon: templateIcon,
      tags: templateTags,
      blocks: blocks.map(b => ({ type: b.type, content: b.defaultContent })),
      docStyle,
      coverStyle,
      isPublic,
    }

    if (editId) {
      updateTemplate(editId, payload)
      showToast('Template mis à jour', 'ok')
    } else {
      createTemplate(payload)
      showToast('Template créé avec succès', 'ok')
    }
    setTimeout(() => router.push('/templates'), 800)
  }

  const lbl = "block text-[10px] font-bold uppercase tracking-widest mb-2"
  const inputStyle = { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }
  const inputClass = "w-full rounded-xl px-3.5 py-2.5 text-[13px] border outline-none font-sans"

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
          <div className="flex items-center gap-2">
            <Sparkles size={14} color="var(--accent)" />
            <span className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
              {editId ? 'Modifier le template' : 'Créer un template'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save size={12} /> {editId ? 'Mettre à jour' : 'Enregistrer le template'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left tabs */}
        <div className="w-12 border-r flex flex-col items-center py-4 gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {([
            { id: 'blocks', icon: <Layers size={16} />, label: 'Blocs' },
            { id: 'style', icon: <Type size={16} />, label: 'Style' },
            { id: 'cover', icon: <Layout size={16} />, label: 'Couverture' },
            { id: 'meta', icon: <Settings size={16} />, label: 'Infos' },
          ] as { id: StudioTab; icon: React.ReactNode; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all"
              style={activeTab === tab.id
                ? { background: 'var(--accentS)', color: 'var(--accent)' }
                : { background: 'transparent', color: 'var(--text4)' }
              }
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div className="w-[300px] border-r overflow-y-auto" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="p-4">

            {/* BLOCKS TAB */}
            {activeTab === 'blocks' && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>
                  Ajouter des Blocs
                </div>
                <div className="flex flex-col gap-1.5 mb-6">
                  {BLOCK_TYPES.map(bt => (
                    <button
                      key={bt.type}
                      onClick={() => addBlock(bt.type)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer text-left transition-all"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                    >
                      <span className="w-6 text-center text-[14px] flex-shrink-0" style={{ opacity: .7 }}>{bt.icon}</span>
                      <div className="flex-1">
                        <div className="text-[12px] font-bold">{bt.label}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{bt.desc}</div>
                      </div>
                      <Plus size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STYLE TAB */}
            {activeTab === 'style' && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>
                  Style Typographique
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Preset</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PRESET_INFO).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => setDocStyle(STYLE_PRESETS[key])}
                        className="p-3 rounded-xl border cursor-pointer text-left transition-all"
                        style={{
                          background: docStyle.preset === key ? 'var(--accentS)' : 'var(--surface)',
                          borderColor: docStyle.preset === key ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        <div className="text-xl mb-1">{info.icon}</div>
                        <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{info.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Police Titres</label>
                  <div className="flex flex-col gap-1.5">
                    {FONT_TITLE_OPTIONS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setDocStyle(d => ({ ...d, fontTitle: f.value }))}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-left"
                        style={{
                          background: docStyle.fontTitle === f.value ? 'var(--accentS)' : 'var(--surface)',
                          borderColor: docStyle.fontTitle === f.value ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 18, fontWeight: 700 }}>Aa</span>
                        <span className="text-[11px] font-bold" style={{ color: 'var(--text3)' }}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Police Corps</label>
                  <div className="flex flex-col gap-1.5">
                    {FONT_BODY_OPTIONS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setDocStyle(d => ({ ...d, fontBody: f.value }))}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-left"
                        style={{
                          background: docStyle.fontBody === f.value ? 'var(--accentS)' : 'var(--surface)',
                          borderColor: docStyle.fontBody === f.value ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        <span style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: 12 }}>{f.preview}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text4)' }}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Couleur d'Accent</label>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {PALETTE.map(c => (
                      <button key={c} onClick={() => setDocStyle(d => ({ ...d, accentColor: c }))}
                        style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: 'pointer', border: `2px solid ${docStyle.accentColor === c ? 'var(--text)' : 'transparent'}`, transition: 'all .15s' }} />
                    ))}
                  </div>
                  <input type="color" value={docStyle.accentColor} onChange={e => setDocStyle(d => ({ ...d, accentColor: e.target.value }))}
                    className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{ borderColor: 'var(--border)' }} />
                </div>
              </div>
            )}

            {/* COVER TAB */}
            {activeTab === 'cover' && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>
                  Page de Couverture
                </div>

                <div className="mb-5">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Mise en Page</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COVER_LAYOUTS.map(layout => (
                      <div
                        key={layout.id}
                        onClick={() => setCoverStyle(s => ({ ...s, layout: layout.id }))}
                        className="cursor-pointer rounded-xl border-2 overflow-hidden transition-all"
                        style={{ borderColor: coverStyle.layout === layout.id ? 'var(--accent)' : 'var(--border)' }}
                      >
                        <div className="p-1.5" style={{ background: 'var(--bg3)' }}>
                          {layout.preview}
                        </div>
                        <div className="px-2 py-1.5 text-center">
                          <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{layout.label}</div>
                          <div className="text-[9px]" style={{ color: 'var(--text4)' }}>{layout.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Couleur de Couverture</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {PALETTE.map(c => (
                      <button key={c} onClick={() => setCoverStyle(s => ({ ...s, accentColor: c }))}
                        style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: 'pointer', border: `2px solid ${coverStyle.accentColor === c ? 'var(--text)' : 'transparent'}` }} />
                    ))}
                  </div>
                  <input type="color" value={coverStyle.accentColor} onChange={e => setCoverStyle(s => ({ ...s, accentColor: e.target.value }))}
                    className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" style={{ borderColor: 'var(--border)' }} />
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Taille du Titre</label>
                  <div className="flex gap-2">
                    {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                      <button key={sz} onClick={() => setCoverStyle(s => ({ ...s, titleSize: sz }))}
                        className="flex-1 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all"
                        style={{
                          background: coverStyle.titleSize === sz ? 'var(--accentS)' : 'var(--surface)',
                          borderColor: coverStyle.titleSize === sz ? 'var(--accent)' : 'var(--border)',
                          color: coverStyle.titleSize === sz ? 'var(--accent)' : 'var(--text3)',
                        }}>
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { key: 'showLogo', label: 'Afficher le logo' },
                    { key: 'showQr', label: 'QR code d\'authenticité' },
                    { key: 'showGrid', label: 'Fond avec grille subtile' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{label}</span>
                      <div
                        onClick={() => setCoverStyle(s => ({ ...s, [key]: !s[key as keyof CoverStyle] }))}
                        className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
                        style={coverStyle[key as keyof CoverStyle]
                          ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                          : { background: 'transparent', borderColor: 'var(--border2)' }
                        }>
                        {coverStyle[key as keyof CoverStyle] && <Check size={11} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* META TAB */}
            {activeTab === 'meta' && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>
                  Informations Template
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Icône</label>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl cursor-pointer transition-all"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      {templateIcon}
                    </div>
                    <span className="text-[11px]" style={{ color: 'var(--text4)' }}>Cliquer pour changer</span>
                  </div>
                  {showEmojiPicker && (
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} onClick={() => { setTemplateIcon(e); setShowEmojiPicker(false) }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer border-none text-xl transition-all"
                          style={{ background: e === templateIcon ? 'var(--accentS)' : 'transparent' }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Nom du Template</label>
                  <input className={inputClass} style={inputStyle} value={templateName}
                    onChange={e => setTemplateName(e.target.value)} placeholder="Nom du template"
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg2)'; }} />
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Description</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    style={{ ...inputStyle, height: 72 }}
                    value={templateDesc}
                    onChange={e => setTemplateDesc(e.target.value)}
                    placeholder="Description courte du template"
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg2)'; }}
                  />
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Catégorie</label>
                  <select className={inputClass} style={inputStyle} value={templateCategory}
                    onChange={e => setTemplateCategory(e.target.value)}>
                    {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className={lbl} style={{ color: 'var(--text3)' }}>Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input className={`${inputClass} flex-1`} style={inputStyle} value={newTag}
                      onChange={e => setNewTag(e.target.value)} placeholder="Ajouter un tag..."
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg2)'; }} />
                    <Button variant="ghost" size="sm" onClick={addTag}><Plus size={12} /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {templateTags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer"
                        style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}
                        onClick={() => removeTag(tag)}>
                        {tag} <X size={9} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div>
                    <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>Template public</div>
                    <div className="text-[10px]" style={{ color: 'var(--text4)' }}>Visible par l'équipe</div>
                  </div>
                  <div onClick={() => setIsPublic(!isPublic)}
                    className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer"
                    style={isPublic ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : { background: 'transparent', borderColor: 'var(--border2)' }}>
                    {isPublic && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main area - block list */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg3)' }}>
          <div className="max-w-[680px] mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                Structure du Template
                <span className="ml-2 text-[12px] font-normal" style={{ color: 'var(--text4)' }}>
                  {blocks.length} bloc{blocks.length > 1 ? 's' : ''}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-[11px] px-2.5 py-1 rounded-xl font-bold" style={{ background: coverStyle.accentColor, color: '#fff' }}>
                  {templateIcon} {templateName}
                </div>
              </div>
            </div>

            {/* Cover preview mini */}
            <div className="rounded-2xl border overflow-hidden mb-5" style={{ background: '#fff', borderColor: 'var(--border)' }}>
              <div style={{
                height: 80,
                background: coverStyle.layout === 'bold' ? coverStyle.accentColor : '#fff',
                borderLeft: coverStyle.layout === 'classic' ? `4px solid ${coverStyle.accentColor}` : 'none',
                borderBottom: coverStyle.layout === 'minimal' ? `2px solid ${coverStyle.accentColor}` : 'none',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {coverStyle.layout === 'split' && (
                  <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: coverStyle.accentColor }} />
                )}
                <div style={{ padding: '0 20px', position: 'relative' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', opacity: .6, marginBottom: 4,
                    color: coverStyle.layout === 'bold' ? '#fff' : '#aaa' }}>
                    Aperçu Couverture
                  </div>
                  <div style={{ fontFamily: `'${docStyle.fontTitle}', sans-serif`, fontWeight: 900,
                    fontSize: { sm: 16, md: 20, lg: 24, xl: 28 }[coverStyle.titleSize],
                    color: coverStyle.layout === 'bold' ? '#fff' : '#111' }}>
                    {templateName.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Block list */}
            {blocks.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border2)' }}>
                <Layers size={32} style={{ color: 'var(--text4)', margin: '0 auto 12px' }} />
                <p className="text-[13px]" style={{ color: 'var(--text4)' }}>Ajoutez des blocs depuis le panneau gauche</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    draggable
                    onDragStart={() => setDragId(block.id)}
                    onDragOver={e => { e.preventDefault() }}
                    onDrop={() => {
                      if (!dragId || dragId === block.id) return
                      const fromIdx = blocks.findIndex(b => b.id === dragId)
                      moveBlock(fromIdx, idx)
                      setDragId(null)
                    }}
                    onDragEnd={() => setDragId(null)}
                  >
                    <div style={{ cursor: 'grab', color: 'var(--text4)' }}><GripVertical size={14} /></div>
                    <span className="w-6 text-center text-[16px]">{block.icon}</span>
                    <div className="flex-1">
                      <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{block.label}</div>
                      {block.defaultContent && (
                        <div className="text-[10px] truncate max-w-[300px]" style={{ color: 'var(--text4)' }}>
                          {block.defaultContent}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                      {idx + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => idx > 0 && moveBlock(idx, idx - 1)}
                        disabled={idx === 0}
                        className="w-6 h-6 flex items-center justify-center rounded border cursor-pointer border-none"
                        style={{ background: 'transparent', color: idx === 0 ? 'var(--border2)' : 'var(--text4)' }}>
                        <ChevronUp size={11} />
                      </button>
                      <button
                        onClick={() => idx < blocks.length - 1 && moveBlock(idx, idx + 1)}
                        disabled={idx === blocks.length - 1}
                        className="w-6 h-6 flex items-center justify-center rounded border cursor-pointer border-none"
                        style={{ background: 'transparent', color: idx === blocks.length - 1 ? 'var(--border2)' : 'var(--text4)' }}>
                        <ChevronDown size={11} />
                      </button>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none transition-all"
                        style={{ background: 'transparent', color: 'var(--text4)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DC2626'; (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Style preview */}
            {blocks.length > 0 && (
              <div className="mt-6 rounded-2xl overflow-hidden border" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
                  <div style={{ fontFamily: `'${docStyle.fontTitle}', sans-serif`, fontWeight: 900, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#111' }}>
                    Aperçu Typographie
                  </div>
                </div>
                <div className="p-5">
                  <div style={{ fontFamily: `'${docStyle.fontTitle}', sans-serif`, fontWeight: 900, fontSize: 22, color: '#111', letterSpacing: '-.02em', marginBottom: 4 }}>
                    Titre du Document
                  </div>
                  <div style={{ fontFamily: `'${docStyle.fontBody}', sans-serif`, fontSize: 13, color: '#555', lineHeight: 1.7 }}>
                    Corps de texte — Ce document a été créé avec EETRA. La mise en page utilise les polices {docStyle.fontTitle} pour les titres et {docStyle.fontBody} pour le texte.
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 14, background: docStyle.accentColor, borderRadius: 2 }} />
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#aaa' }}>Section titre exemple</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast {...toast} />
    </div>
  )
}
