'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Plus, Clock, BarChart2, Zap, Grid, Users, BookOpen,
  ArrowRight, TrendingUp, Star, Eye, Download, Bell, Settings,
  FolderOpen, ChevronRight, Sparkles, Target
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { useLibrary } from '@/contexts/LibraryContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useTeam } from '@/contexts/TeamContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePlan } from '@/contexts/PlanContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { getInitials } from '@/lib/utils'

const STORAGE_DRAFT = 'eetra-document-draft'

const QUICK_TEMPLATES = [
  { id: 'bp', icon: '📊', name: 'Business Plan', desc: 'Plan stratégique 5 ans', color: '#1B4FD8' },
  { id: 'ao', icon: '📄', name: "Appel d'Offre", desc: 'Réponse structurée', color: '#059669' },
  { id: 'audit', icon: '🔍', name: "Rapport d'Audit", desc: 'Constatations & risques', color: '#7C3AED' },
  { id: 'devis', icon: '💰', name: 'Devis / Facture', desc: 'Proposition commerciale', color: '#D97706' },
  { id: 'contrat', icon: '✍️', name: 'Contrat OHADA', desc: 'Cadre contractuel', color: '#DC2626' },
  { id: 'memo', icon: '📝', name: 'Note de Direction', desc: 'Communication interne', color: '#0E7490' },
]

function StatCard({ icon, label, value, sub, color = 'var(--accent)' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
      </div>
      <div className="text-[28px] font-black tracking-tight" style={{ color: 'var(--text)' }}>{value}</div>
      <div className="text-[12px] font-bold mt-0.5" style={{ color: 'var(--text2)' }}>{label}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useProfile()
  const { documents } = useLibrary()
  const { entries } = useHistory()
  const { members } = useTeam()
  const { unreadCount } = useNotifications()
  const { plan, planId } = usePlan()
  const [showNotifs, setShowNotifs] = useState(false)
  const [greeting, setGreeting] = useState('Bonjour')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Bonjour')
    else if (h < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')
  }, [])

  const recentDocs = documents.slice(0, 4)
  const recentExports = entries.slice(0, 3)

  const handleNewDoc = () => {
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    router.push('/editor')
  }

  const handleOpenDoc = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return
    try {
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify({
        title: doc.title, subtitle: doc.subtitle, ref: doc.ref,
        destination: doc.destination, confidentiality: doc.confidentiality,
        pages: doc.pages, docStyle: doc.docStyle,
      }))
    } catch {}
    router.push('/editor')
  }

  const handleQuickTemplate = (templateId: string) => {
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    // Set pending template in sessionStorage for editor to pick up
    try { sessionStorage.setItem('eetra-pending-template', templateId) } catch {}
    router.push('/editor')
  }

  const PLAN_COLORS: Record<string, string> = {
    starter: '#6B7280', pro: '#1B4FD8', business: '#059669'
  }
  const planColor = PLAN_COLORS[planId] || '#1B4FD8'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 h-16 border-b flex items-center justify-between px-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <FileText size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${planColor}18`, color: planColor }}>
            {plan.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl border cursor-pointer"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
            >
              <Bell size={15} color="var(--text3)" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: 'var(--accent)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-12 z-50" style={{ width: 360 }}>
                <NotificationCenter onClose={() => setShowNotifs(false)} />
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border cursor-pointer"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
          >
            <Settings size={15} color="var(--text3)" />
          </button>

          <div
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: 'var(--accentS)' }}>
              {profile.logoDataUrl
                ? <img src={profile.logoDataUrl} alt="" className="w-full h-full object-contain p-0.5" />
                : <span className="text-[10px] font-black" style={{ color: 'var(--accent)' }}>{getInitials(profile.name || 'EE')}</span>
              }
            </div>
            <span className="text-[12px] font-bold max-w-[120px] truncate" style={{ color: 'var(--text)' }}>
              {profile.name || 'Mon espace'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-8 py-8">

          {/* Welcome */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-[30px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>
                {greeting}{profile.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋
              </h1>
              <p className="text-[14px]" style={{ color: 'var(--text3)' }}>
                Tableau de bord — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={handleNewDoc}>
              <Plus size={16} /> Nouveau Document
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard icon={<FileText size={16} />} label="Documents créés" value={documents.length} sub="Dans votre bibliothèque" />
            <StatCard icon={<Download size={16} />} label="PDFs exportés" value={entries.length} sub="Depuis le début" color="#059669" />
            <StatCard icon={<Users size={16} />} label="Membres équipe" value={members.length} sub="Collaborateurs actifs" color="#7C3AED" />
            <StatCard icon={<TrendingUp size={16} />} label="Score moyen" value={`${Math.min(100, documents.length * 12 + 40)}%`} sub="Complétude documents" color="#D97706" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left column - Quick actions + Recent docs */}
            <div className="col-span-2 flex flex-col gap-6">
              {/* Quick start with templates */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} color="var(--accent)" />
                    <span className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Démarrage rapide</span>
                  </div>
                  <button onClick={() => router.push('/templates')} className="text-[12px] font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent" style={{ color: 'var(--accent)' }}>
                    Tous les templates <ChevronRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-0">
                  {QUICK_TEMPLATES.map((tpl, i) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleQuickTemplate(tpl.id)}
                      className="flex flex-col items-start gap-2 p-4 cursor-pointer border-none text-left transition-all"
                      style={{
                        background: 'transparent',
                        borderRight: i % 3 !== 2 ? '1px solid var(--border)' : 'none',
                        borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px]"
                        style={{ background: `${tpl.color}18` }}>
                        {tpl.icon}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{tpl.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{tpl.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent documents */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Clock size={14} color="var(--accent)" />
                    <span className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Documents récents</span>
                  </div>
                  <button onClick={() => router.push('/documents')} className="text-[12px] font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent" style={{ color: 'var(--accent)' }}>
                    Voir tout <ChevronRight size={12} />
                  </button>
                </div>
                {recentDocs.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <FolderOpen size={32} style={{ color: 'var(--text4)', margin: '0 auto 12px' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Aucun document — commencez par en créer un !</p>
                    <Button variant="primary" size="sm" onClick={handleNewDoc} style={{ marginTop: 12 }}>
                      <Plus size={12} /> Créer un document
                    </Button>
                  </div>
                ) : (
                  <div>
                    {recentDocs.map((doc, i) => (
                      <div
                        key={doc.id}
                        onClick={() => handleOpenDoc(doc.id)}
                        className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-all"
                        style={{ borderBottom: i < recentDocs.length - 1 ? '1px solid var(--border)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${doc.docStyle?.accentColor || 'var(--accent)'}18` }}>
                          <FileText size={16} color={doc.docStyle?.accentColor || 'var(--accent)'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold truncate" style={{ color: 'var(--text)' }}>
                            {doc.title || 'Sans titre'}
                          </div>
                          <div className="text-[11px]" style={{ color: 'var(--text4)' }}>
                            {doc.entityName} · {doc.pageCount} pages · {new Date(doc.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                        <ArrowRight size={14} color="var(--text4)" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {/* Plan info */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: planColor }} />
                    <span className="text-[13px] font-bold" style={{ color: planColor }}>Plan {plan.label}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text4)' }}>{plan.price}</p>
                </div>
                <div className="px-5 py-4 flex flex-col gap-3">
                  {[
                    { label: 'Documents', val: documents.length, max: plan.maxDocsPerMonth === Infinity ? '∞' : plan.maxDocsPerMonth },
                    { label: 'Pages / doc', val: '—', max: plan.maxPagesPerDoc === Infinity ? '∞' : plan.maxPagesPerDoc },
                    { label: 'IA rédaction', val: plan.ai ? '✓' : '✗', max: null },
                    { label: 'Membres', val: members.length, max: planId === 'business' ? 10 : planId === 'pro' ? 1 : 1 },
                  ].map(({ label, val, max }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{label}</span>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>
                        {val}{max !== null ? ` / ${max}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
                {planId === 'starter' && (
                  <div className="px-5 pb-4">
                    <Button variant="primary" fullWidth size="sm" onClick={() => router.push('/settings#plan')}>
                      <Zap size={11} /> Passer au plan Pro
                    </Button>
                  </div>
                )}
              </div>

              {/* Recent exports */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Download size={13} color="var(--accent)" />
                    <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Exports récents</span>
                  </div>
                  <button onClick={() => router.push('/history')} className="text-[10px] cursor-pointer border-none bg-transparent font-bold" style={{ color: 'var(--text4)' }}>
                    Tout voir
                  </button>
                </div>
                <div className="px-5 py-3">
                  {recentExports.length === 0 ? (
                    <p className="text-[11px] text-center py-4" style={{ color: 'var(--text4)' }}>Aucun export pour l'instant</p>
                  ) : recentExports.map(e => (
                    <div key={e.id} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accentS)' }}>
                        <Download size={11} color="var(--accent)" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text)' }}>{e.title}</div>
                        <div className="text-[9px] mt-0.5" style={{ color: 'var(--text4)' }}>
                          {e.exportedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {e.pageCount}p
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Navigation rapide</span>
                </div>
                <div className="p-2">
                  {[
                    { icon: <Grid size={13} />, label: 'Templates', path: '/templates' },
                    { icon: <FolderOpen size={13} />, label: 'Mes documents', path: '/documents' },
                    { icon: <BarChart2 size={13} />, label: 'Historique', path: '/history' },
                    { icon: <Users size={13} />, label: 'Équipe', path: '/team' },
                    { icon: <BookOpen size={13} />, label: 'Bibliothèque', path: '/ebooks' },
                    { icon: <Settings size={13} />, label: 'Paramètres', path: '/settings' },
                  ].map(item => (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-bold cursor-pointer border-none text-left transition-all"
                      style={{ background: 'transparent', color: 'var(--text3)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}
                    >
                      <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                      {item.label}
                      <ChevronRight size={11} className="ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
