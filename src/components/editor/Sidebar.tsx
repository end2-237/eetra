'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '../../app/icon.png'
import {
  Layers, LayoutGrid, Layout, BarChart2, MessageSquare,
  BookOpen, Download, Settings, LogOut,
} from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile }  from '@/contexts/ProfileContext'
import { usePlan }     from '@/contexts/PlanContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { getInitials } from '@/lib/utils'

const CSS = `
  .sidebar { width:52px; flex-shrink:0; border-right:1px solid var(--border); background:var(--surface); display:flex; flex-direction:column; align-items:center; padding:10px 0; height:100vh; overflow:hidden; }
  .sb-btn { width:36px; height:36px; border-radius:7px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .12s,color .12s; background:transparent; color:var(--text4); }
  .sb-btn:hover { background:var(--bg3); color:var(--text2); }
  .sb-btn.active { background:var(--accentS); color:var(--accent); }
  .sb-divider { width:24px; height:1px; background:var(--border); margin:5px 0; flex-shrink:0; }
  .sb-avatar { width:26px; height:26px; border-radius:6px; background:var(--accentS); display:flex; align-items:center; justify-content:center; overflow:hidden; }
`

const TABS = [
  { id:'editor',    Icon:Layers,        tip:'Blocs'        },
  { id:'templates', Icon:LayoutGrid,    tip:'Templates'    },
  { id:'layout',    Icon:Layout,        tip:'Mise en page' },
  { id:'analytics', Icon:BarChart2,     tip:'Analyse'      },
  { id:'comments',  Icon:MessageSquare, tip:'Notes'        },
]

interface Props { onExport: () => void }

export function Sidebar({ onExport }: Props) {
  const { activeTab, setActiveTab } = useDocument()
  const { profile }  = useProfile()
  const { planId }   = usePlan()
  const router       = useRouter()

  const planColor = ({ starter:'#6B7280', pro:'#1B4FD8', business:'#059669' } as Record<string,string>)[planId] ?? '#1B4FD8'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="sidebar">
        {/* Logo */}
        <button className="sb-btn" style={{ marginBottom:8 }} title="Tableau de bord" onClick={() => router.push('/dashboard')}>
          <Image src={logo} alt="EETRA" width={22} height={22} style={{ borderRadius:5 }}/>
        </button>

        {/* Tab nav */}
        <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1, width:'100%', padding:'0 8px' }}>
          {TABS.map(({ id, Icon, tip }) => (
            <button
              key={id}
              className={`sb-btn${activeTab === id ? ' active' : ''}`}
              title={tip}
              onClick={() => setActiveTab(id as any)}
            >
              <Icon size={16}/>
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'center', padding:'0 8px', width:'100%' }}>
          <button className="sb-btn" title="Mes documents" onClick={() => router.push('/documents')}>
            <BookOpen size={15}/>
          </button>

          <button
            title="Exporter en PDF"
            onClick={onExport}
            style={{ width:36, height:36, borderRadius:7, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--accent)', color:'#fff', flexShrink:0 }}
          >
            <Download size={15}/>
          </button>

          <div className="sb-divider"/>

          <div style={{ display:'flex', justifyContent:'center' }}>
            <ThemeToggle/>
          </div>

          <button className="sb-btn" title="Paramètres" onClick={() => router.push('/settings')}>
            <Settings size={15}/>
          </button>

          {/* Avatar */}
          <button className="sb-btn" title={profile.name || 'Profil'} onClick={() => router.push('/onboarding')}
            style={{ background:'transparent', padding:0, border:'none', cursor:'pointer' }}>
            <div className="sb-avatar" style={{ border:`1.5px solid ${planColor}30` }}>
              {profile.logoDataUrl
                ? <img src={profile.logoDataUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', padding:2 }}/>
                : <span style={{ fontSize:8, fontWeight:800, color:'var(--accent)' }}>{getInitials(profile.name || 'EE')}</span>
              }
            </div>
          </button>
        </div>
      </div>
    </>
  )
}