'use client'

import { useRouter } from 'next/navigation'
import {
  FileText, Download, BookOpen, Settings,
  MessageSquare, BarChart2, Layers, Grid, Layout
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePlan } from '@/contexts/PlanContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { getInitials } from '@/lib/utils'

// Extend TabName to include 'layout'
type ExtendedTab = 'editor' | 'templates' | 'analytics' | 'comments' | 'layout'

const EDITOR_TABS = [
  { id: 'editor',    icon: <Layers   size={16} />, label: 'Blocs',       tip: 'Bibliothèque de blocs' },
  { id: 'templates', icon: <Grid     size={16} />, label: 'Templates',   tip: 'Templates de document' },
  { id: 'layout',    icon: <Layout   size={16} />, label: 'Mise en page',tip: 'En-tête, pied de page, filigrane' },
  { id: 'analytics', icon: <BarChart2 size={16} />, label: 'Analyse',    tip: 'Analyse du document' },
  { id: 'comments',  icon: <MessageSquare size={16} />, label: 'Notes',  tip: 'Annotations & commentaires' },
]

interface Props {
  onExport: () => void
}

export function Sidebar({ onExport }: Props) {
  const { activeTab, setActiveTab } = useDocument()
  const { profile } = useProfile()
  const { planId } = usePlan()
  const router = useRouter()

  const PLAN_COLORS: Record<string, string> = {
    starter: '#6B7280', pro: '#1B4FD8', business: '#059669'
  }
  const planColor = PLAN_COLORS[planId] || '#1B4FD8'

  return (
    <div style={{
      width: 60, flexShrink: 0, borderRight: '1px solid var(--border)',
      background: 'var(--surface)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '12px 0', gap: 4, height: '100vh',
    }}>
      {/* Logo / Home */}
      <button
        onClick={() => router.push('/dashboard')}
        title="Tableau de bord"
        style={{
          width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <FileText size={16} color="#fff" strokeWidth={2.5} />
      </button>

      {/* Tab switchers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 8px', marginBottom: 'auto' }}>
        {EDITOR_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            title={tab.tip}
            style={{
              width: '100%', height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: activeTab === tab.id ? 'var(--accentS)' : 'transparent',
              color:      activeTab === tab.id ? 'var(--accent)' : 'var(--text4)',
              transition: 'all .12s',
              // Layout tab gets a subtle accent dot to indicate it's a new feature
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--text2)'
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--text4)'
              }
            }}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', padding: '0 8px', marginTop: 'auto' }}>
        <button
          onClick={() => router.push('/documents')}
          title="Mes documents"
          style={{
            width: '100%', height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', color: 'var(--text4)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text4)' }}
        >
          <BookOpen size={16} />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          title="Exporter en PDF"
          style={{
            width: '100%', height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent)', color: '#fff',
          }}
        >
          <Download size={16} />
        </button>

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

        {/* Theme */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
          <ThemeToggle />
        </div>

        {/* Settings */}
        <button
          onClick={() => router.push('/settings')}
          title="Paramètres"
          style={{
            width: '100%', height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', color: 'var(--text4)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text4)' }}
        >
          <Settings size={16} />
        </button>

        {/* Avatar / Profile */}
        <button
          onClick={() => router.push('/onboarding')}
          title={profile.name || 'Profil'}
          style={{
            width: '100%', height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'var(--accentS)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            border: `1px solid ${planColor}40`,
          }}>
            {profile.logoDataUrl
              ? <img src={profile.logoDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
              : <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--accent)' }}>{getInitials(profile.name || 'EE')}</span>
            }
          </div>
        </button>
      </div>
    </div>
  )
}