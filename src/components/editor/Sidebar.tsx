'use client'

import { useRouter } from 'next/navigation'
import { FileText, Edit3, Grid, BarChart2, MessageSquare, Download, Link2, Home, User, Clock, Users, Palette } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useHistory } from '@/contexts/HistoryContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { getInitials } from '@/lib/utils'

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

export function Sidebar({ showToast }: Props) {
  const router = useRouter()
  const { activeTab, setActiveTab, docId, setShowStyleModal } = useDocument()
  const { profile } = useProfile()
  const { entries } = useHistory()

  function copyLink() {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'https://eetra.app'}/view/${docId}`
    navigator.clipboard.writeText(link).then(() => showToast('Lien copié !', 'ok'))
  }

  const navItems = [
    { id: 'editor',    icon: <Edit3 size={14} />,       label: 'Éditeur' },
    { id: 'templates', icon: <Grid size={14} />,         label: 'Smart Templates' },
    { id: 'analytics', icon: <BarChart2 size={14} />,    label: 'Analytics' },
    { id: 'comments',  icon: <MessageSquare size={14} />, label: 'Commentaires' },
  ] as const

  const btnBase = "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-500 transition-all duration-150 border-none cursor-pointer text-left mb-0.5"

  return (
    <aside className="w-[236px] min-w-[236px] flex flex-col border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

      {/* Logo + theme */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}>
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
            : <span className="text-[11px] font-black" style={{ color: 'var(--accent)' }}>
                {getInitials(profile.name || 'EE')}
              </span>
          }
        </div>
        <div className="overflow-hidden flex-1">
          <div className="text-[12px] font-bold overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ color: 'var(--text)' }}>
            {profile.name || 'Entité non définie'}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text4)' }}>
            {profile.sector || '—'}
          </div>
        </div>
      </div>

      <div className="h-px mx-3 mb-2" style={{ background: 'var(--border)' }} />

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto hide-scroll">
        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2"
          style={{ color: 'var(--text4)' }}>
          Workspace
        </div>
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

        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2"
          style={{ color: 'var(--text4)' }}>
          Export
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('eetra:export-pdf'))}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Download size={14} />
          Exporter PDF
        </button>
        <button onClick={copyLink}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Link2 size={14} />
          Lien Sécurisé
        </button>

        <div className="h-px mx-1 my-3" style={{ background: 'var(--border)' }} />

        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2"
          style={{ color: 'var(--text4)' }}>
          Outils
        </div>

        <button onClick={() => setShowStyleModal(true)}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Palette size={14} />
          Style du Document
        </button>

        <button onClick={() => router.push('/history')}
          className={btnBase}
          style={{ background: 'transparent', color: 'var(--text3)', fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'var(--bg3)'; (e.currentTarget).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text3)'; }}
        >
          <Clock size={14} />
          Historique
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
          <Users size={14} />
          Équipe
        </button>
      </nav>

      {/* Bottom */}
      <div className="border-t p-2" style={{ borderColor: 'var(--border)' }}>
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
    </aside>
  )
}
