'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Grid, Plus, Search, Star, ArrowLeft, FileText, Trash2, Copy,
  Edit3, Eye, Check, ChevronRight, Sparkles, Filter, Tag, X
} from 'lucide-react'
import { useCustomTemplates, type CustomTemplate } from '@/contexts/CustomTemplateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useDocument } from '@/contexts/DocumentContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { TEMPLATES } from '@/lib/templates'
import { generateId } from '@/lib/utils'
import type { DocBlock } from '@/types'

const STORAGE_DRAFT = 'eetra-document-draft'

const BUILTIN_CATEGORIES = ['Tous', 'Stratégie', 'Finance', 'Juridique', 'Commercial', 'Interne', 'Mes Templates']

const BUILTIN_ICONS: Record<string, string> = {
  bp: '📊', ao: '📄', audit: '🔍', memo: '📝', contrat: '✍️', devis: '💰'
}

const BUILTIN_CATEGORIES_MAP: Record<string, string> = {
  bp: 'Stratégie', ao: 'Commercial', audit: 'Finance',
  memo: 'Interne', contrat: 'Juridique', devis: 'Commercial',
}

interface TemplateCardProps {
  id: string
  icon: string
  name: string
  desc: string
  tags: string[]
  blocksCount: number
  category: string
  isCustom?: boolean
  usageCount?: number
  onUse: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onPreview: () => void
}

function TemplateCard({
  id, icon, name, desc, tags, blocksCount, category,
  isCustom, usageCount, onUse, onEdit, onDuplicate, onDelete, onPreview
}: TemplateCardProps) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all cursor-pointer"
      style={{
        background: 'var(--surface)',
        borderColor: hover ? 'var(--accent)' : 'var(--border)',
        transform: hover ? 'translateY(-2px)' : '',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onPreview}
    >
      {/* Header strip */}
      <div className="h-20 flex items-center justify-center text-4xl relative" style={{ background: 'var(--bg2)' }}>
        {icon}
        {isCustom && (
          <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
            Perso.
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{name}</div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
            {blocksCount} blocs
          </span>
        </div>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text4)' }}>{desc}</p>

        <div className="flex gap-1 flex-wrap mb-4">
          {tags.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
              {t}
            </span>
          ))}
        </div>

        {usageCount !== undefined && (
          <div className="text-[10px] mb-3" style={{ color: 'var(--text4)' }}>
            Utilisé {usageCount} fois
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="primary" size="sm" fullWidth onClick={e => { e.stopPropagation(); onUse() }}>
            Utiliser →
          </Button>
          {isCustom && onEdit && (
            <button onClick={e => { e.stopPropagation(); onEdit() }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border cursor-pointer flex-shrink-0 transition-all"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}>
              <Edit3 size={11} />
            </button>
          )}
          {onDuplicate && (
            <button onClick={e => { e.stopPropagation(); onDuplicate() }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border cursor-pointer flex-shrink-0 transition-all"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text3)' }}>
              <Copy size={11} />
            </button>
          )}
          {isCustom && onDelete && (
            <button onClick={e => { e.stopPropagation(); if (window.confirm('Supprimer ce template ?')) onDelete() }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border cursor-pointer flex-shrink-0 transition-all"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; (e.currentTarget as HTMLElement).style.color = '#DC2626'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}>
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const { templates: customTemplates, deleteTemplate, duplicateTemplate, incrementUsage } = useCustomTemplates()
  const { profile } = useProfile()
  const { toast, showToast } = useToast()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [previewTemplate, setPreviewTemplate] = useState<{ name: string; blocks: number; desc: string; icon: string } | null>(null)

  const handleUseBuiltin = useCallback((tplId: string) => {
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    try { sessionStorage.setItem('eetra-pending-template', tplId) } catch {}
    router.push('/editor')
  }, [router])

  const handleUseCustom = useCallback((tpl: CustomTemplate) => {
    incrementUsage(tpl.id)
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    try { sessionStorage.setItem('eetra-pending-custom-template', tpl.id) } catch {}
    router.push('/editor')
  }, [router, incrementUsage])

  const allBuiltin = TEMPLATES.map(t => ({
    id: t.id,
    icon: BUILTIN_ICONS[t.icon] || '📄',
    name: t.name,
    desc: t.desc || 'Template professionnel EETRA',
    tags: t.tags,
    blocksCount: t.blocks.length,
    category: BUILTIN_CATEGORIES_MAP[t.id] || 'Stratégie',
    isCustom: false,
  }))

  const filteredBuiltin = allBuiltin.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchCat = activeCategory === 'Tous' || activeCategory === 'Mes Templates' ? false : t.category === activeCategory
    return matchSearch && (activeCategory === 'Tous' || matchCat)
  })

  const filteredCustom = customTemplates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'Tous' || activeCategory === 'Mes Templates' || t.category === activeCategory
    return matchSearch && matchCat
  })

  const showBuiltin = activeCategory !== 'Mes Templates'
  const showCustom = activeCategory === 'Tous' || activeCategory === 'Mes Templates'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 h-14 border-b flex items-center justify-between px-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-[12px] cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text4)' }}>
            <ArrowLeft size={14} /> Tableau de bord
          </button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-2">
            <Grid size={15} color="var(--accent)" />
            <span className="text-[15px] font-black tracking-tight" style={{ color: 'var(--text)' }}>Templates</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="primary" size="sm" onClick={() => router.push('/templates/create')}>
            <Plus size={13} /> Créer un template
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-8 py-8">

          {/* Hero */}
          <div className="rounded-2xl p-8 mb-8 relative overflow-hidden" style={{ background: 'var(--accent)' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: 100, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2">Bibliothèque EETRA</div>
              <h1 className="text-[26px] font-black tracking-tight text-white mb-2">
                Templates Professionnels
              </h1>
              <p className="text-[13px] text-white/70 max-w-lg mb-4">
                {allBuiltin.length + customTemplates.length} templates disponibles — professionnels inclus + vos créations personnalisées.
              </p>
              <Button variant="ghost" size="sm" onClick={() => router.push('/templates/create')}
                style={{ background: 'rgba(255,255,255,.2)', borderColor: 'transparent', color: '#fff' }}>
                <Sparkles size={12} /> Créer un template personnalisé →
              </Button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un template..."
                className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-[13px] border outline-none font-sans"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap mb-8">
            {BUILTIN_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer border transition-all"
                style={activeCategory === cat
                  ? { background: 'var(--accent)', color: '#fff', borderColor: 'transparent' }
                  : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }
                }
              >
                {cat}
                {cat === 'Mes Templates' && customTemplates.length > 0 && (
                  <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ background: activeCategory === cat ? 'rgba(255,255,255,.25)' : 'var(--accentS2)', color: activeCategory === cat ? '#fff' : 'var(--accent)' }}>
                    {customTemplates.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mes Templates section */}
          {showCustom && customTemplates.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} color="var(--accent)" />
                <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>Mes Templates Personnalisés</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
                  {filteredCustom.length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {filteredCustom.map(tpl => (
                  <TemplateCard
                    key={tpl.id}
                    id={tpl.id}
                    icon={tpl.icon}
                    name={tpl.name}
                    desc={tpl.description}
                    tags={tpl.tags}
                    blocksCount={tpl.blocks.length}
                    category={tpl.category}
                    isCustom
                    usageCount={tpl.usageCount}
                    onUse={() => handleUseCustom(tpl)}
                    onEdit={() => router.push(`/templates/create?edit=${tpl.id}`)}
                    onDuplicate={() => { duplicateTemplate(tpl.id); showToast('Template dupliqué', 'ok') }}
                    onDelete={() => deleteTemplate(tpl.id)}
                    onPreview={() => setPreviewTemplate({ name: tpl.name, blocks: tpl.blocks.length, desc: tpl.description, icon: tpl.icon })}
                  />
                ))}
                {/* Create new card */}
                <div
                  onClick={() => router.push('/templates/create')}
                  className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all"
                  style={{ borderColor: 'var(--border2)', minHeight: 220 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--accentS)' }}>
                    <Plus size={20} color="var(--accent)" />
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>Nouveau Template</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty custom templates */}
          {showCustom && customTemplates.length === 0 && activeCategory === 'Mes Templates' && (
            <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <Grid size={40} style={{ color: 'var(--text4)', margin: '0 auto 16px' }} />
              <div className="text-[16px] font-bold mb-2" style={{ color: 'var(--text2)' }}>Aucun template personnalisé</div>
              <p className="text-[13px] mb-6" style={{ color: 'var(--text4)' }}>
                Créez vos propres templates avec mise en page, couleurs et blocs prédéfinis.
              </p>
              <Button variant="primary" onClick={() => router.push('/templates/create')}>
                <Plus size={13} /> Créer mon premier template
              </Button>
            </div>
          )}

          {/* Builtin templates */}
          {showBuiltin && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={14} color="var(--accent)" />
                <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>Templates EETRA</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
                  {filteredBuiltin.length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {filteredBuiltin.map(tpl => (
                  <TemplateCard
                    key={tpl.id}
                    id={tpl.id}
                    icon={tpl.icon}
                    name={tpl.name}
                    desc={tpl.desc}
                    tags={tpl.tags}
                    blocksCount={tpl.blocksCount}
                    category={tpl.category}
                    onUse={() => handleUseBuiltin(tpl.id)}
                    onDuplicate={() => {
                      const source = TEMPLATES.find(t => t.id === tpl.id)
                      if (source) router.push(`/templates/create?from=${tpl.id}`)
                    }}
                    onPreview={() => setPreviewTemplate({ name: tpl.name, blocks: tpl.blocksCount, desc: tpl.desc, icon: tpl.icon })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setPreviewTemplate(null)}
        >
          <div style={{ background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 480, border: '1px solid var(--border)', padding: 32 }}
            onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">{previewTemplate.icon}</div>
            <h3 className="text-[22px] font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>{previewTemplate.name}</h3>
            <p className="text-[14px] mb-4" style={{ color: 'var(--text3)' }}>{previewTemplate.desc}</p>
            <div className="text-[12px] mb-6" style={{ color: 'var(--text4)' }}>{previewTemplate.blocks} blocs de contenu inclus</div>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setPreviewTemplate(null)}>Fermer</Button>
              <Button variant="primary" fullWidth onClick={() => setPreviewTemplate(null)}>
                <Check size={13} /> Utiliser ce template
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast {...toast} />
    </div>
  )
}
