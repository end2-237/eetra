'use client'

import { useRouter } from 'next/navigation'
import {
  FileText, Edit3, Grid, BarChart2, MessageSquare, Download, Link2,
  Home, User, Clock, Users, Palette, Zap, RotateCcw,
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useHistory } from '@/contexts/HistoryContext'
import { usePlan } from '@/contexts/PlanContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { getInitials } from '@/lib/utils'

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

export function Sidebar({ showToast }: Props) {
  const router = useRouter()
  const { activeTab, setActiveTab, docId, setShowStyleModal, clearDraft, pages } = useDocument()
  const { profile } = useProfile()
  const { entries } = useHistory()
  const { plan, planId, usage, getRemainingDocs, requestUpgrade } = usePlan()

  function copyLink() {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'https://eetra.app'}/view/${docId}`
    navigator.clipboard.writeText(link).then(() => showToast('Lien copié !', 'ok'))
  }

  function handleNewDoc() {
    if (window.confirm('Créer un nouveau document ? Le document actuel est sauvegardé automatiquement.')) {
      clearDraft()
      window.location.reload()
    }
  }

  const navItems = [
    { id: 'editor',    icon: <Edit3 size={14} />,        label: 'Éditeur' },
    { id: 'templates', icon: <Grid size={14} />,          label: 'Smart Templates' },
    { id: 'analytics', icon: <BarChart2 size={14} />,     label: 'Analytics' },
    { id: 'comments',  icon: <MessageSquare size={14} />, label: 'Commentaires' },
  ] as const

  const btnBase = "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 border-none cursor-pointer text-left mb-0.5"

  const remaining = getRemainingDocs()
  const showUsageMeter = planId === 'starter' && plan.maxDocsPerMonth !== Infinity

  const PLAN_COLORS: Record<string, string> = {
    starter: '#6B7280', pro: '#1B4FD8', business: '#059669',
  }
  const planColor = PLAN_COLORS[planId] || '#1B4FD8'

  return (
    <aside className="w-[236px] min-w-[236px] flex flex-col border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

      {/* Logo */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
            <FileText size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Company badge */}
      <div className="mx-3 mb-3 rounded-xl border px-3 py-2.5 flex items-center gap-2.5"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: 'var(--accentS)' }}>
          {profile.logoDataUrl
            ? <img src={profile.logoDataUrl} alt="" className="w-full h-full object-contain p-1" />
            : <span className="text-[11px] font-black" style={{ color: 'var(--accent)' }}>{getInitials(profile.name || 'EE')}</span>
          }
        </div>
        <div className="overflow-hidden flex-1">
          <div className="text-[12px] font-bold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--text)' }}>
            {profile.name || 'Entité non définie'}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{profile.sector || '—'}</div>
        </div>
      </div>

      {/* Plan badge */}
      <div className="mx-3 mb-3 rounded-xl px-3 py-2 flex items-center justify-between"
        style={{ background: `${planColor}12`, border: `1px solid ${planColor}30` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: planColor }} />
          <span className="text-[11px] font-bold" style={{ color: planColor }}>{plan.label}</span>
        </div>
        {planId === 'starter' && (
          <button
            onClick={() => requestUpgrade('Passez au plan Pro pour des fonctionnalités illimitées.')}
            style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: planColor, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Upgrade →
          </button>
        )}
      </div>

      <div className="h-px mx-3 mb-2" style={{ background: 'var(--border)' }} />

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto hide-scroll">
        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text4)' }}>Workspace</div>

        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={btnBase}
            style={activeTab === item.id
              ? { background: 'var(--accentS)', color: 'var(--accent)', fontWeight: 700 }
              : { background: 'transparent', color: 'var(--text3)', fontWeight: 500 }
            }
            onMouseEnter={e => { if (activeTab !== item.id) { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; } }}
            onMouseLeave={e => { if (activeTab !== item.id) { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; } }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="h-px mx-1 my-3" style={{ background: 'var(--border)' }} />

        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text4)' }}>Document</div>

        <button onClick={handleNewDoc}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <RotateCcw size={14} /> Nouveau Document
        </button>

        <div className="h-px mx-1 my-3" style={{ background: 'var(--border)' }} />

        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text4)' }}>Export</div>

        <button onClick={() => window.dispatchEvent(new CustomEvent('eetra:export-pdf'))}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Download size={14} /> Exporter PDF
        </button>

        <button onClick={copyLink}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Link2 size={14} /> Lien Sécurisé
        </button>

        <div className="h-px mx-1 my-3" style={{ background: 'var(--border)' }} />
        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text4)' }}>Outils</div>

        <button onClick={() => setShowStyleModal(true)}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Palette size={14} /> Style du Document
        </button>

        <button onClick={() => router.push('/history')}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Clock size={14} /> Historique
          {entries.length > 0 && (
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
              {entries.length}
            </span>
          )}
        </button>

        <button onClick={() => router.push('/team')}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Users size={14} /> Équipe
        </button>

        {/* Usage meter (starter plan) */}
        {showUsageMeter && (
          <div className="mx-1 mt-3 rounded-xl p-3 border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>Utilisation</span>
              <span className="text-[10px] font-bold" style={{ color: remaining <= 1 ? 'var(--danger)' : 'var(--text3)' }}>
                {usage.docsThisMonth} / {plan.maxDocsPerMonth}
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2, transition: 'width .4s',
                background: remaining <= 1 ? 'var(--danger)' : 'var(--accent)',
                width: `${Math.min(100, (usage.docsThisMonth / plan.maxDocsPerMonth) * 100)}%`,
              }} />
            </div>
            {remaining <= 2 && (
              <button
                onClick={() => requestUpgrade('Vous approchez de la limite mensuelle du plan Starter.')}
                className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border"
                style={{ background: 'var(--accentS)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                <Zap size={10} style={{ display: 'inline', marginRight: 4 }} />
                Upgrade →
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="p-2">
          <button onClick={() => router.push('/onboarding')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] border-none cursor-pointer"
            style={{ background: 'transparent', color: 'var(--text4)' }}
            onMouseEnter={e => { (e.currentTarget).style.color = 'var(--text)'; (e.currentTarget).style.background = 'var(--bg3)'; }}
            onMouseLeave={e => { (e.currentTarget).style.color = 'var(--text4)'; (e.currentTarget).style.background = 'transparent'; }}
          >
            <User size={12} /> Modifier le profil
          </button>
          <button onClick={() => router.push('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] border-none cursor-pointer"
            style={{ background: 'transparent', color: 'var(--text4)' }}
            onMouseEnter={e => { (e.currentTarget).style.color = 'var(--text)'; (e.currentTarget).style.background = 'var(--bg3)'; }}
            onMouseLeave={e => { (e.currentTarget).style.color = 'var(--text4)'; (e.currentTarget).style.background = 'transparent'; }}
          >
            <Home size={12} /> Accueil
          </button>
        </div>
        {/* Legal links */}
        <div className="px-3 pb-3 flex gap-3 flex-wrap">
          <button onClick={() => router.push('/legal')}
            className="text-[10px] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--text4)' }}
            onMouseEnter={e => (e.currentTarget).style.color = 'var(--text3)'}
            onMouseLeave={e => (e.currentTarget).style.color = 'var(--text4)'}
          >
            CGU
          </button>
          <button onClick={() => router.push('/legal#privacy')}
            className="text-[10px] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--text4)' }}
            onMouseEnter={e => (e.currentTarget).style.color = 'var(--text3)'}
            onMouseLeave={e => (e.currentTarget).style.color = 'var(--text4)'}
          >
            Confidentialité
          </button>
          <span className="text-[10px] ml-auto" style={{ color: 'var(--text4)' }}>v2.1</span>
        </div>
      </div>
    </aside>
  )
}
