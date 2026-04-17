'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '../../app/icon.png'
import {
  Layers, LayoutGrid, Layout, BarChart2, MessageSquare,
  BookOpen, Download, Settings, BookMarked, Users, Menu, X, CircleHelp, Radar,
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
  .sb-btn.active-radar { background:rgba(16,185,129,.1); color:#059669; }
  .sb-btn.active-radar:hover { background:rgba(16,185,129,.18); }
  .sb-divider { width:24px; height:1px; background:var(--border); margin:5px 0; flex-shrink:0; }
  .sb-avatar { width:26px; height:26px; border-radius:6px; background:var(--accentS); display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:39; opacity:0; visibility:hidden; transition:opacity .25s, visibility .25s; }
  .sb-overlay.open { opacity:1; visibility:visible; }
  .sb-toggle { display:none; }
  
  @media (max-width:1023px) {
    .sidebar { position:fixed; bottom:0; left:0; right:0; width:100%; height:56px; flex-direction:row; padding:0 8px; border-right:none; border-top:1px solid var(--border); border-left:none; align-items:center; z-index:40; }
    .sb-top { display:none !important; }
    .sb-nav { flex:1; min-width:0; display:flex !important; gap:2; padding:0 4px; flex-direction:row !important; overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch; scroll-behavior:smooth; scrollbar-width:none; }
    .sb-nav::-webkit-scrollbar { display:none; }
    .sb-bottom { display:flex !important; gap:2; flex-direction:row !important; }
    .sb-btn { width:32px !important; height:32px !important; font-size:12px; flex-shrink:0; }
    .sb-divider { width:1px !important; height:20px !important; margin:0 4px !important; }
    .sb-overlay { display:block !important; }
    .sb-toggle { display:flex !important; }
  }
  
  @media (max-width:479px) {
    .sb-btn { width:28px !important; height:28px !important; }
    .sidebar { height:52px; }
  }
`

const TABS = [
  { id:'editor',      Icon:Layers,       tip:'Blocs'              },
  { id:'templates',   Icon:LayoutGrid,   tip:'Templates'          },
  { id:'layout',      Icon:Layout,       tip:'Mise en page'       },
  { id:'analytics',   Icon:BarChart2,    tip:'Analyse'            },
  { id:'radar',       Icon:Radar,        tip:'Assistant Qualité'      },
  { id:'comments',    Icon:MessageSquare,tip:'Notes'              },
  { id:'orientation', Icon:BookMarked,   tip:"Zone d'Orientation" },
]

interface Props { onExport: () => void }

export function Sidebar({ onExport }: Props) {
  const { activeTab, setActiveTab, orientationZone } = useDocument()
  const { profile }  = useProfile()
  const { planId, requestUpgrade }   = usePlan()
  const router       = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const planColor = ({ starter:'#6B7280', pro:'#1B4FD8', business:'#059669' } as Record<string,string>)[planId] ?? '#1B4FD8'

  const handleTeamClick = () => {
    const isPro = planId === 'pro' || planId === 'business'
    if (!isPro) {
      requestUpgrade('La collaboration en équipe est réservée aux plans Pro et Business.')
      return
    }
    router.push('/team')
  }

  const closeSidebar = () => setSidebarOpen(false)
  const openGuide = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('eetra-open-guide'))
    }
    closeSidebar()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      {/* Mobile overlay */}
      <div 
        className={`sb-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
      />

      <div className="sidebar" style={isMobile && sidebarOpen ? { position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', height: 'auto', maxHeight: '80vh', flexDirection: 'column', padding: '12px 8px', overflow: 'auto', zIndex: 40 } : {}}>
        {/* Toggle button for mobile */}
        {isMobile && (
          <button 
            className="sb-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: 36, height: 36, borderRadius: 7, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', color: 'var(--text3)', flexShrink: 0 }}
            title={sidebarOpen ? "Fermer" : "Menu"}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        {/* Logo - hidden on mobile */}
        <button className="sb-btn sb-top" style={{ marginBottom:8 }} title="Tableau de bord" onClick={() => { router.push('/dashboard'); closeSidebar() }}>
          <Image src={logo} alt="EETRA" width={22} height={22} style={{ borderRadius:5 }}/>
        </button>

        {/* Tab nav */}
        <div data-tour="sidebar-nav" className="sb-nav" style={{ display:'flex', flexDirection:'column', gap:2, flex:1, width:'100%', padding:'0 8px' }}>
          {TABS.map(({ id, Icon, tip }) => {
            const isActive = activeTab === id
            const isOZ     = id === 'orientation'
            const isRadar  = id === 'radar'
            const ozActive    = isOZ && isActive
            const radarActive = isRadar && isActive
            const ozEnabled = isOZ && orientationZone?.enabled && !isActive
            return (
              <button
                key={id}
                data-tour={id === 'templates' ? 'templates-nav' : undefined}
                className={`sb-btn${isActive && !isOZ && !isRadar ? ' active' : ''}${ozActive ? ' active-oz' : ''}${radarActive ? ' active-radar' : ''}`}
                title={tip}
                onClick={() => { setActiveTab(id as any); closeSidebar() }}
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
          <button className="sb-btn sb-top" title="Mes documents" onClick={() => { router.push('/documents'); closeSidebar() }}>
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
            data-tour="export-btn"
            title="Exporter en PDF"
            onClick={onExport}
            style={{ width:36, height:36, borderRadius:7, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--accent)', color:'#fff', flexShrink:0 }}
          >
            <Download size={15}/>
          </button>

          <button
            className="sb-btn"
            title="Guide"
            onClick={openGuide}
          >
            <CircleHelp size={15}/>
          </button>

          <div className="sb-divider sb-top"/>

          <div style={{ display:'flex', justifyContent:'center' }}>
            <ThemeToggle/>
          </div>

          <button className="sb-btn sb-top" title="Paramètres" onClick={() => { router.push('/settings'); closeSidebar() }}>
            <Settings size={15}/>
          </button>

          {/* Avatar */}
          <button className="sb-btn sb-top" title={profile.name || 'Profil'} onClick={() => { router.push('/onboarding'); closeSidebar() }}
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