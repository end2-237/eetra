'use client'

import { useEffect, useState, useCallback } from 'react'
import { Grid, Layout, Globe, Star, Search, Crown, Lock } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePlan } from '@/contexts/PlanContext'
import { useCustomTemplates } from '@/contexts/CustomTemplateContext'
import { Button } from '@/components/ui/Button'
import { TemplatePreview } from './TemplatePreview'
import { UpgradeTemplateModal } from '@/components/ui/UpgradeTemplateModal'
import { TEMPLATES } from '@/lib/templates'
import { generateId } from '@/lib/utils'
import { DocBlock } from '@/types'
import type { CoverStyle, CustomTemplate } from '@/contexts/CustomTemplateContext'
import { CoverMini } from '@/components/ui/CoverMini'

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }



const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  bp:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v4H3V3z" fill="currentColor" opacity=".15"/><path d="M3 3h18v4H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 9h11v2H3V9z" fill="currentColor" opacity=".3"/><path d="M16 11l2 3 3-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="16" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
  ao:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  audit:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  memo:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 2H4a1 1 0 00-1 1v16l4-2h13a1 1 0 001-1V3a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M7 8h10M7 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  contrat: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  devis:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 9h20M6 14h4M14 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
}

type TabId = 'smart' | 'mine' | 'community'

function LockedCommunityOverlay({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onUpgrade() }}
      style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'rgba(10,15,30,.75)',
        backdropFilter: 'blur(3px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 5, cursor: 'pointer', zIndex: 10,
        transition: 'all .15s',
      }}
    >
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(124,58,237,.2)', border: '1.5px solid rgba(124,58,237,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lock size={11} color="#a78bfa" />
      </div>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#a78bfa', letterSpacing: '.1em', textTransform: 'uppercase' }}>
        Pro requis
      </div>
    </div>
  )
}

export function TemplatesPanel({ showToast }: Props) {
  const { selectedTemplate, setSelectedTemplate, pages, currentPageIndex, setPageBlocks, setCoverStyle } = useDocument()
  const { profile } = useProfile()
  const { planId, canUseCommunityTemplates, canUseCustomTemplates, requestUpgrade } = usePlan()
  const { templates: myTemplates, incrementUsage, communityTemplates } = useCustomTemplates()

  const [activeTab, setActiveTab] = useState<TabId>('smart')
  const [search, setSearch] = useState('')
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeCtx, setUpgradeCtx] = useState<'template' | 'community'>('community')

  function triggerUpgrade(ctx: 'template' | 'community' = 'community') {
    setUpgradeCtx(ctx)
    setShowUpgrade(true)
  }

  // Smart templates are FREE for everyone — no lock
  function applySmartTemplate() {
    const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
    if (!tpl) return
    const page = pages[currentPageIndex]
    if (!page) { showToast('Ajoutez d\'abord une page', 'err'); return }
    if (tpl.coverStyle) setCoverStyle(tpl.coverStyle)
    const en = profile.name || '[Entité]'
    const nb: DocBlock[] = tpl.blocks.map(b => ({
      id: generateId(), type: b.type,
      content: b.content?.replace(/\[Entité\]/g, en),
      tableData: b.tableData,
    }))
    setPageBlocks(page.id, nb)
    showToast(`"${tpl.name}" appliqué`, 'ok')
  }

  function applyCustomTemplate(tpl: CustomTemplate) {
    const isMyTemplate = myTemplates.find(m => m.id === tpl.id)
    const isCommunityTemplate = communityTemplates.find(m => m.id === tpl.id)

    if (isCommunityTemplate && !isMyTemplate && !canUseCommunityTemplates()) {
      triggerUpgrade('community'); return
    }
    if (!canUseCustomTemplates() && !isMyTemplate) {
      triggerUpgrade('template'); return
    }

    const page = pages[currentPageIndex]
    if (!page) { showToast('Ajoutez d\'abord une page', 'err'); return }
    if (tpl.coverStyle) {
      const cs: CoverStyle = typeof tpl.coverStyle === 'string' ? JSON.parse(tpl.coverStyle) : tpl.coverStyle
      setCoverStyle(cs)
    }
    if (tpl.blocks?.length > 0) {
      const bl = typeof tpl.blocks === 'string' ? JSON.parse(tpl.blocks) : tpl.blocks
      setPageBlocks(page.id, bl.map((b: any) => ({ id: generateId(), type: b.type, content: b.content, tableData: b.tableData })))
    }
    if (tpl.id && isMyTemplate) incrementUsage(tpl.id)
    showToast(`"${tpl.name}" appliqué`, 'ok')
    setSelectedCustomId(null)
  }

  const q = search.toLowerCase()
  const filteredSmart = TEMPLATES.filter(t =>
    !search || t.name.toLowerCase().includes(q) || t.tags.some(g => g.toLowerCase().includes(q))
  )
  const filteredMine = myTemplates.filter(t => !search || t.name.toLowerCase().includes(q))
  const filteredCommunity = communityTemplates.filter(t =>
    !search || t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
  )

  const smartSelected  = activeTab === 'smart' && !!selectedTemplate
  const customSelected = (activeTab === 'mine' || activeTab === 'community') && !!selectedCustomId

  const TABS = [
    { id: 'smart' as TabId,     icon: <Star size={11} />,  label: 'Smart',       count: TEMPLATES.length, free: true },
    { id: 'mine' as TabId,      icon: <Lock size={11} />,  label: 'Mes modèles', count: myTemplates.length, free: false },
    { id: 'community' as TabId, icon: <Globe size={11} />, label: 'Communauté',  count: communityTemplates.length, free: false },
  ]

  return (
    <>
      {showUpgrade && (
        <UpgradeTemplateModal
          context={upgradeCtx}
          onClose={() => setShowUpgrade(false)}
        />
      )}

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Grid size={13} color="var(--accent)" strokeWidth={2} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Templates</span>
            {/* Smart templates badge — free */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 99, background: 'rgba(5,150,105,.1)', border: '1px solid rgba(5,150,105,.2)' }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#059669' }}>✓ Smart gratuits</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: 8 }}>
            <Search size={11} color="var(--text4)" />
            <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: 'var(--text)', width: '100%' }} />
          </div>

          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 8, padding: 2, gap: 1 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 4px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, background: activeTab === tab.id ? 'var(--surface)' : 'transparent', color: activeTab === tab.id ? 'var(--accent)' : 'var(--text4)', transition: 'all .12s' }}>
                {tab.icon}{tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{ fontSize: 9, padding: '0 4px', borderRadius: 4, background: activeTab === tab.id ? 'var(--accentS)' : 'var(--bg3)', color: activeTab === tab.id ? 'var(--accent)' : 'var(--text4)' }}>{tab.count}</span>
                )}
                {tab.free && <span style={{ fontSize: 7, color: '#059669', fontWeight: 800 }}>FREE</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>

          {/* ── SMART — free for everyone ── */}
          {activeTab === 'smart' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8, background: 'rgba(5,150,105,.06)', border: '1px solid rgba(5,150,105,.2)', marginBottom: 4 }}>
                <span style={{ fontSize: 11 }}>✅</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>Templates smart — accessibles à tous les plans</span>
              </div>
              {filteredSmart.map(tpl => (
                <div key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id === selectedTemplate ? null : tpl.id)}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid', borderColor: selectedTemplate === tpl.id ? 'var(--accent)' : 'var(--border)', background: selectedTemplate === tpl.id ? 'var(--accentS)' : 'var(--surface)', cursor: 'pointer', transition: 'all .12s' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: selectedTemplate === tpl.id ? 'var(--accentS2)' : 'var(--bg3)', color: selectedTemplate === tpl.id ? 'var(--accent)' : 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {TEMPLATE_ICONS[tpl.id] || TEMPLATE_ICONS['memo']}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{tpl.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'var(--bg3)', color: 'var(--text4)' }}>{tpl.blocks.length} blocs</span>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text4)', margin: '0 0 6px 36px', lineHeight: 1.4 }}>{tpl.desc}</p>
                  {tpl.coverStyle && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 36 }}>
                      <Layout size={9} color="var(--text4)" />
                      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Cover {tpl.coverStyle.layout}</span>
                      {tpl.coverStyle.accentColor && <div style={{ width: 8, height: 8, borderRadius: '50%', background: tpl.coverStyle.accentColor }} />}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6, marginLeft: 36 }}>
                    {tpl.tags.map(tag => <span key={tag} style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '1px 6px', borderRadius: 99, background: 'var(--accentS2)', color: 'var(--accent)' }}>{tag}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MES MODÈLES ── */}
          {activeTab === 'mine' && (
            myTemplates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                <Grid size={28} color="var(--text4)" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>Aucun template personnel</p>
                <p style={{ fontSize: 11, color: 'var(--text4)', lineHeight: 1.5 }}>Créez un modèle depuis la page Templates.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredMine.map(tpl => {
                  const locked = !canUseCustomTemplates()
                  return (
                    <div key={tpl.id}
                      onClick={() => {
                        if (locked) { triggerUpgrade('template'); return }
                        setSelectedCustomId(selectedCustomId === tpl.id ? null : tpl.id)
                      }}
                      style={{ borderRadius: 10, border: '1.5px solid', borderColor: selectedCustomId === tpl.id ? 'var(--accent)' : 'var(--border)', background: selectedCustomId === tpl.id ? 'var(--accentS)' : 'var(--surface)', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                      {locked && <LockedCommunityOverlay onUpgrade={() => triggerUpgrade('template')} />}
                      <div style={{ display: 'flex', gap: 10, padding: '10px 12px' }}>
                        <div style={{ width: 40, aspectRatio: '.707', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                          <CoverMini coverStyle={tpl.coverStyle} name={tpl.name} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{tpl.name}</div>
                          <p style={{ fontSize: 10, color: 'var(--text4)', margin: 0, lineHeight: 1.35 }}>{tpl.description || tpl.category}</p>
                          <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 4 }}>{tpl.blocks.length} blocs · {tpl.usageCount} utilisations</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* ── COMMUNAUTÉ — visible but locked for non-pro ── */}
          {activeTab === 'community' && (
            <>
              {!canUseCommunityTemplates() && (
                <div onClick={() => triggerUpgrade('community')}
                  style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 9, background: 'linear-gradient(135deg,rgba(124,58,237,.1),rgba(27,79,216,.06))', border: '1px solid rgba(124,58,237,.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Crown size={12} color="#a78bfa" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa' }}>Réservé aux plans Pro & Business</div>
                    <div style={{ fontSize: 9, color: 'rgba(167,139,250,.6)' }}>Visible en aperçu — passez au Pro pour utiliser</div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#a78bfa', background: 'rgba(124,58,237,.2)', padding: '2px 7px', borderRadius: 4 }}>Upgrader →</div>
                </div>
              )}

              {communityTemplates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                  <Globe size={28} color="var(--text4)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>Galerie communautaire vide</p>
                  <p style={{ fontSize: 11, color: 'var(--text4)', lineHeight: 1.5 }}>Publiez vos templates depuis "Mes modèles" pour les partager.</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>
                    {filteredCommunity.length} modèle{filteredCommunity.length > 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {filteredCommunity.map(tpl => {
                      const isSel = selectedCustomId === tpl.id
                      const locked = !canUseCommunityTemplates()
                      return (
                        <div key={tpl.id}
                          onClick={() => {
                            if (locked) { triggerUpgrade('community'); return }
                            setSelectedCustomId(isSel ? null : tpl.id)
                          }}
                          style={{ borderRadius: 10, border: '2px solid', borderColor: isSel ? 'var(--accent)' : 'var(--border)', background: isSel ? 'var(--accentS)' : 'var(--surface)', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                          {locked && <LockedCommunityOverlay onUpgrade={() => triggerUpgrade('community')} />}
                          <div style={{ aspectRatio: '.707', background: 'var(--bg3)', overflow: 'hidden', position: 'relative' }}>
                            <CoverMini coverStyle={tpl.coverStyle} name={tpl.name} />
                            {tpl.usageCount > 0 && (
                              <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(0,0,0,.5)', color: '#fff' }}>×{tpl.usageCount}</div>
                            )}
                          </div>
                          <div style={{ padding: '7px 8px' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{tpl.name}</div>
                            <div style={{ fontSize: 9, color: 'var(--text4)' }}>{tpl.author || 'Communauté'} · {tpl.blocks?.length || 0} blocs</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer — apply button */}
        <div style={{ flexShrink: 0, padding: '10px 10px 12px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          {smartSelected && (() => {
            const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
            return tpl ? (
              <>
                <div style={{ marginBottom: '10px', maxHeight: '240px', overflow: 'hidden' }}>
                  <TemplatePreview
                    blocks={tpl.blocks || []}
                    coverStyle={tpl.coverStyle}
                    name={tpl.name}
                    accentColor={tpl.coverStyle?.accentColor || '#1B4FD8'}
                  />
                </div>
                <Button variant="primary" fullWidth onClick={applySmartTemplate} size="sm">
                  Appliquer ce modèle →
                </Button>
              </>
            ) : null
          })()}
          {customSelected && (() => {
            const tpl = activeTab === 'mine'
              ? myTemplates.find(t => t.id === selectedCustomId)
              : communityTemplates.find(t => t.id === selectedCustomId)
            return tpl ? (
              <>
                <div style={{ marginBottom: '10px', maxHeight: '240px', overflow: 'hidden' }}>
                  <TemplatePreview
                    blocks={typeof tpl.blocks === 'string' ? JSON.parse(tpl.blocks) : (tpl.blocks || [])}
                    coverStyle={tpl.coverStyle}
                    name={tpl.name}
                    accentColor={tpl.coverStyle?.accentColor || '#1B4FD8'}
                  />
                </div>
                <Button variant="primary" fullWidth onClick={() => applyCustomTemplate(tpl)} size="sm">
                  Appliquer "{tpl.name}" →
                </Button>
              </>
            ) : null
          })()}
          {!smartSelected && !customSelected && (
            <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text4)', margin: 0 }}>
              Sélectionnez un modèle ci-dessus
            </p>
          )}
        </div>
      </div>
    </>
  )
}