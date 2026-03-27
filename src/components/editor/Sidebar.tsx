'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '../../app/icon.png'
import {
  Layers, LayoutGrid, Layout, BarChart2, MessageSquare,
  BookOpen, Download, Settings, BookMarked, Users,
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
  .sb-btn.active-oz { background:rgba(124,58,237,.1); color:#7C3AED; }
  .sb-btn.active-oz:hover { background:rgba(124,58,237,.18); }
  .sb-divider { width:24px; height:1px; background:var(--border); margin:5px 0; flex-shrink:0; }
  .sb-avatar { width:26px; height:26px; border-radius:6px; background:var(--accentS); display:flex; align-items:center; justify-content:center; overflow:hidden; }
  
  @media (max-width:1023px) {
    .sidebar { width:100%; height:auto; flex-direction:row; padding:8px; border-right:none; border-top:1px solid var(--border); order:3; align-items:center; }
    .sb-top { display:none !important; }
    .sb-nav { flex:1; display:flex !important; gap:2; overflow-x:auto; padding-right:4px; flex-direction:row !important; }
    .sb-bottom { display:flex !important; gap:2; flex-direction:row !important; }
    .sb-btn { width:32px !important; height:32px !important; font-size:12px; }
    .sb-divider { width:1px !important; height:20px !important; margin:0 4px !important; }
  }
`

const TABS = [
  { id:'editor',      Icon:Layers,       tip:'Blocs'              },
  { id:'templates',   Icon:LayoutGrid,   tip:'Templates'          },
  { id:'layout',      Icon:Layout,       tip:'Mise en page'       },
  { id:'analytics',   Icon:BarChart2,    tip:'Analyse'            },
  { id:'comments',    Icon:MessageSquare,tip:'Notes'              },
  { id:'orientation', Icon:BookMarked,   tip:"Zone d'Orientation" },
]

interface Props { onExport: () => void }

export function Sidebar({ onExport }: Props) {
  const { activeTab, setActiveTab, orientationZone } = useDocument()
  const { profile }  = useProfile()
  const { planId, requestUpgrade }   = usePlan()
  const router       = useRouter()

  const planColor = ({ starter:'#6B7280', pro:'#1B4FD8', business:'#059669' } as Record<string,string>)[planId] ?? '#1B4FD8'

  const handleTeamClick = () => {
    const isPro = planId === 'pro' || planId === 'business'
    if (!isPro) {
      requestUpgrade('La collaboration en équipe est réservée aux plans Pro et Business.')
      return
    }
    router.push('/team')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="sidebar">
        {/* Logo - hidden on mobile */}
        <button className="sb-btn sb-top" style={{ marginBottom:8 }} title="Tableau de bord" onClick={() => router.push('/dashboard')}>
          <Image src={logo} alt="EETRA" width={22} height={22} style={{ borderRadius:5 }}/>
        </button>

        {/* Tab nav */}
        <div className="sb-nav" style={{ display:'flex', flexDirection:'column', gap:2, flex:1, width:'100%', padding:'0 8px' }}>
          {TABS.map(({ id, Icon, tip }) => {
            const isActive = activeTab === id
            const isOZ = id === 'orientation'
            const ozActive = isOZ && isActive
            const ozEnabled = isOZ && orientationZone?.enabled && !isActive
            return (
              <button
                key={id}
                className={`sb-btn${isActive && !isOZ ? ' active' : ''}${ozActive ? ' active-oz' : ''}`}
                title={tip}
                onClick={() => setActiveTab(id as any)}
                style={ozEnabled ? { position: 'relative' } : {}}
              >
                <Icon size={16}/>
                {/* Dot indicator when OZ is enabled but tab not active */}
                {ozEnabled && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#7C3AED',
                  }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="sb-bottom" style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'center', padding:'0 8px', width:'100%' }}>
          <button className="sb-btn sb-top" title="Mes documents" onClick={() => router.push('/documents')}>
            <BookOpen size={15}/>
          </button>

          <button 
            className="sb-btn sb-top" 
            title="Équipe (Pro)" 
            onClick={handleTeamClick}
            style={{ 
              opacity: (planId === 'pro' || planId === 'business') ? 1 : 0.5,
              cursor: (planId === 'pro' || planId === 'business') ? 'pointer' : 'not-allowed'
            }}
          >
            <Users size={15}/>
          </button>

          <button
            title="Exporter en PDF"
            onClick={onExport}
            style={{ width:36, height:36, borderRadius:7, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--accent)', color:'#fff', flexShrink:0 }}
          >
            <Download size={15}/>
          </button>

          <div className="sb-divider sb-top"/>

          <div style={{ display:'flex', justifyContent:'center' }}>
            <ThemeToggle/>
          </div>

          <button className="sb-btn sb-top" title="Paramètres" onClick={() => router.push('/settings')}>
            <Settings size={15}/>
          </button>

          {/* Avatar */}
          <button className="sb-btn sb-top" title={profile.name || 'Profil'} onClick={() => router.push('/onboarding')}
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
