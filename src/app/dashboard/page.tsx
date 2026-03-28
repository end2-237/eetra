'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '../../app/icon.png'
import {
  FileText, Plus, BarChart2, Zap, LayoutGrid, Users,
  BookOpen, Download, Bell, Settings,
  FolderOpen, ChevronRight, History, LogOut, Search,
  LayoutDashboard, Layers, TrendingUp, ExternalLink,
  CheckCircle2, PenLine, Menu, X, Lock,
} from 'lucide-react'
import { useProfile }         from '@/contexts/ProfileContext'
import { useLibrary }         from '@/contexts/LibraryContext'
import { useHistory }         from '@/contexts/HistoryContext'
import { useTeam }            from '@/contexts/TeamContext'
import { useNotifications }   from '@/contexts/NotificationContext'
import { usePlan }            from '@/contexts/PlanContext'
import { ThemeToggle }        from '@/components/ui/ThemeToggle'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { PlanUpgradeModal }   from '@/components/editor/PlanUpgradeModal'
import { getInitials }        from '@/lib/utils'

const STORAGE_DRAFT = 'eetra-document-draft'

const TEMPLATES = [
  { id: 'bp',      name: 'Business Plan',     desc: 'Plan stratégique 5 ans',  color: '#1B4FD8' },
  { id: 'ao',      name: "Appel d'Offre",     desc: 'Réponse structurée',       color: '#059669' },
  { id: 'audit',   name: "Rapport d'Audit",   desc: 'Constatations & risques',  color: '#7C3AED' },
  { id: 'devis',   name: 'Devis / Facture',   desc: 'Proposition commerciale',  color: '#D97706' },
  { id: 'contrat', name: 'Contrat OHADA',     desc: 'Cadre contractuel légal',  color: '#DC2626' },
  { id: 'memo',    name: 'Note de Direction', desc: 'Communication interne',    color: '#0E7490' },
]

const NAV_MAIN = [
  { label: "Vue d'ensemble", path: '/dashboard',  Icon: LayoutDashboard },
  { label: 'Documents',      path: '/documents',  Icon: FileText        },
  { label: 'Templates',      path: '/templates',  Icon: LayoutGrid      },
  { label: 'Designs',        path: '/designs',    Icon: Layers          },
  { label: 'Analytics',      path: '/analytics',  Icon: TrendingUp      },
  { label: 'Historique',     path: '/history',    Icon: History         },
  { label: 'Équipe',         path: '/team',       Icon: Users           },
  { label: 'Bibliothèque',   path: '/ebooks',     Icon: BookOpen        },
]

const CSS = `
  .db { display:flex; height:100dvh; overflow:hidden; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }
  .db-side { width:228px; flex-shrink:0; display:flex; flex-direction:column; background:var(--surface); border-right:1px solid var(--border); height:100dvh; transition:transform .25s cubic-bezier(.23,1,.32,1); }
  .db-logo-row { height:52px; padding:0 14px; display:flex; align-items:center; gap:9px; border-bottom:1px solid var(--border); flex-shrink:0; cursor:pointer; }
  .db-logo-name { font-size:15px; font-weight:700; letter-spacing:-.02em; color:var(--text); }
  .db-nav { flex:1; overflow-y:auto; padding:6px; }
  .db-nav-label { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--text4); padding:10px 8px 4px; }
  .db-nav-btn { display:flex; align-items:center; gap:9px; padding:7px 9px; border-radius:6px; cursor:pointer; color:var(--text3); font-size:13px; font-weight:500; border:none; background:transparent; width:100%; text-align:left; transition:background .12s,color .12s; }
  .db-nav-btn:hover { background:var(--bg3); color:var(--text); }
  .db-nav-btn.active { background:var(--accentS); color:var(--accent); font-weight:600; }
  .db-plan-box { padding:10px; border-top:1px solid var(--border); flex-shrink:0; }
  .db-plan-inner { background:var(--bg2); border:1px solid var(--border); border-radius:7px; padding:11px 12px; }
  .plan-track { height:3px; border-radius:99px; background:var(--border); overflow:hidden; margin-top:7px; }
  .plan-fill  { height:100%; border-radius:99px; transition:width 1s ease; }
  .db-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .db-top { height:52px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 18px; gap:10px; min-width:0; flex-wrap:nowrap; }
  .db-top-left { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
  .db-top-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .db-search { display:flex; align-items:center; gap:7px; border:1px solid var(--border); border-radius:6px; padding:4px 10px; background:var(--bg); transition:border-color .15s; height:28px; }
  .db-search:focus-within { border-color:var(--accent); }
  .db-search input { border:none; outline:none; background:transparent; font-size:12px; color:var(--text); width:176px; }
  .db-search input::placeholder { color:var(--text4); }
  .db-icon-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:border-color .12s,background .12s; position:relative; }
  .db-icon-btn:hover { border-color:var(--border2); background:var(--bg3); }
  .db-avatar-btn { display:flex; align-items:center; gap:7px; padding:3px 9px 3px 4px; border-radius:6px; border:1px solid var(--border); background:var(--bg2); cursor:pointer; transition:border-color .12s; }
  .db-avatar-btn:hover { border-color:var(--border2); }
  .db-body { flex:1; overflow-y:auto; }
  .db-inner { display:flex; gap:0; height:100%; }
  .db-center { flex:1; padding:22px; min-width:0; overflow-y:auto; }
  .db-right { width:272px; flex-shrink:0; border-left:1px solid var(--border); padding:18px 16px; overflow-y:auto; display:flex; flex-direction:column; gap:18px; background:var(--surface); }
  .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
  .stat-card { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:14px 16px; }
  .stat-val { font-size:24px; font-weight:700; letter-spacing:-.03em; color:var(--text); margin:8px 0 2px; line-height:1; }
  .stat-label { font-size:11px; color:var(--text4); }
  .stat-sub { font-size:10px; color:var(--text4); margin-top:2px; }
  .db-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; margin-bottom:14px; }
  .db-block-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid var(--border); background:var(--bg); }
  .db-block-title { font-size:12px; font-weight:600; color:var(--text); }
  .db-block-link { font-size:11px; font-weight:600; color:var(--accent); border:none; background:transparent; cursor:pointer; display:flex; align-items:center; gap:3px; padding:0; }
  .db-block-link:hover { text-decoration:underline; }
  .db-th { display:grid; gap:10px; padding:5px 14px; border-bottom:1px solid var(--border); background:var(--bg2); }
  .db-th span { font-size:10px; font-weight:600; color:var(--text4); text-transform:uppercase; letter-spacing:.06em; }
  .db-tr { display:grid; gap:10px; padding:8px 14px; border-bottom:1px solid var(--border); cursor:pointer; transition:background .1s; align-items:center; }
  .db-tr:last-child { border-bottom:none; }
  .db-tr:hover { background:var(--bg2); }
  .tpl-grid { display:grid; grid-template-columns:1fr 1fr 1fr; }
  .tpl-cell { padding:11px 14px; cursor:pointer; transition:background .1s; border:none; background:transparent; text-align:left; }
  .tpl-cell:hover { background:var(--bg2); }
  .rp-label { font-size:11px; font-weight:600; color:var(--text); margin-bottom:8px; }
  .rp-row { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--border); }
  .rp-row:last-child { border-bottom:none; }
  .icon-box { width:26px; height:26px; border-radius:5px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
  .btn-sm { padding:4px 10px; font-size:11px; }
  .btn-full { width:100%; justify-content:center; }
  .bdg { display:inline-block; padding:1px 7px; border-radius:4px; font-size:10px; font-weight:600; }

  .db-side-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:49; }
  .db-hamburger { display:none; }

  @media (max-width:1023px) {
    .db { flex-direction:column; }
    .db-side { position:fixed; left:0; top:0; width:100%; height:auto; max-height:100vh; border-right:none; border-bottom:1px solid var(--border); z-index:100; transform:translateY(-100%); }
    .db-side.open { transform:translateY(0); }
    .db-side-overlay { display:block !important; opacity:0; pointer-events:none; transition:opacity .2s; }
    .db-side-overlay.open { opacity:1; pointer-events:auto; }
    .db-logo-row { display:none; }
    .db-nav { flex-direction:row; padding:8px; overflow-x:auto; overflow-y:hidden; }
    .db-nav-btn { flex-shrink:0; min-width:fit-content; padding:6px 8px; font-size:12px; }
    .db-plan-box { display:none; }
    .db-hamburger { display:flex !important; }
    .db-main { flex-direction:row; }
    .db-search { display:none; }
    .stat-grid { grid-template-columns: repeat(2,1fr) !important; }
    .db-right { display:none; }
    .db-center { padding:14px; }
    .tpl-grid { grid-template-columns:1fr 1fr !important; }
  }

  @media (max-width:640px) {
    .db-top { padding:0 10px !important; }
    .db-center { padding:10px !important; }
    .stat-grid { grid-template-columns:1fr !important; }
  }
`

export default function DashboardPage() {
  const router = useRouter()
  const { profile }      = useProfile()
  const { documents }    = useLibrary()
  const { entries }      = useHistory()
  const { members }      = useTeam()
  const { unreadCount }  = useNotifications()
  const { plan, planId, checkDocumentLimit, canCreateDocument, requestUpgrade } = usePlan()

  const [showNotifs, setShowNotifs] = useState(false)
  const [search,     setSearch]     = useState('')
  const [sideOpen,   setSideOpen]   = useState(false)

  const planColor = ({ starter: '#6B7280', pro: '#1B4FD8', student: '#059669', business: '#059669' } as any)[planId] ?? '#1B4FD8'
  const planMax   = plan.maxDocsPerMonth === Infinity ? 9999 : plan.maxDocsPerMonth
  const planPct   = Math.min(100, (documents.length / (planMax || 1)) * 100)
  const scoreAvg  = Math.min(100, documents.length * 12 + 40)
  const recentDocs = documents.slice(0, 6)
  const recentExports = entries.slice(0, 5)
  const limitReached = !canCreateDocument()

  const activity = [
    ...documents.slice(0, 3).map(d => ({ label: d.title || 'Sans titre', action: 'Modifié', time: new Date(d.updatedAt), color: '#1B4FD8', Icon: PenLine })),
    ...entries.slice(0, 3).map(e => ({ label: e.title, action: 'Exporté', time: e.exportedAt, color: '#059669', Icon: Download })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6)

  const go = (path: string) => { router.push(path); setSideOpen(false) }

  const newDoc = async () => {
    const allowed = await checkDocumentLimit()
    if (!allowed) return // upgrade modal shown automatically
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    router.push('/editor')
  }

  const openDoc = (doc: any) => {
    // Opening an EXISTING document — no limit check needed
    try { localStorage.setItem(STORAGE_DRAFT, JSON.stringify({ title: doc.title, subtitle: doc.subtitle, ref: doc.ref, destination: doc.destination, confidentiality: doc.confidentiality, pages: doc.pages, docStyle: doc.docStyle })) } catch {}
    router.push('/editor')
  }

  const useTpl = async (id: string) => {
    const allowed = await checkDocumentLimit()
    if (!allowed) return // upgrade modal shown automatically
    try { localStorage.removeItem(STORAGE_DRAFT); sessionStorage.setItem('eetra-pending-template', id) } catch {}
    router.push('/editor')
  }

  const Sidebar = () => (
    <aside className={`db-side${sideOpen ? ' open' : ''}`}>
      <div className="db-logo-row" onClick={() => go('/')}>
        <Image src={logo} alt="EETRA" width={26} height={26} style={{ borderRadius: 6 }} />
        <span className="db-logo-name">EETRA</span>
        <button onClick={e => { e.stopPropagation(); setSideOpen(false) }}
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex' }}
          className="db-mobile-close">
          <X size={16} />
        </button>
      </div>

      <nav className="db-nav">
        <div className="db-nav-label">Application</div>
        {NAV_MAIN.map(({ label, path, Icon }) => (
          <button key={path} className={`db-nav-btn${path === '/dashboard' ? ' active' : ''}`} onClick={() => go(path)}>
            <Icon size={14} color={path === '/dashboard' ? 'var(--accent)' : 'var(--text4)'} />
            {label}
          </button>
        ))}
        <div className="db-nav-label" style={{ marginTop: 4 }}>Compte</div>
        <button className="db-nav-btn" onClick={() => go('/settings')}><Settings size={14} color="var(--text4)" /> Paramètres</button>
        <button className="db-nav-btn" onClick={() => go('/onboarding')}><ExternalLink size={14} color="var(--text4)" /> Profil entreprise</button>
        <button className="db-nav-btn" onClick={() => go('/')}><LogOut size={14} color="var(--text4)" /> Déconnexion</button>
      </nav>

      <div className="db-plan-box">
        <div className="db-plan-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Plan {plan.label}</span>
            <span className="bdg" style={{ background: `${planColor}12`, color: planColor }}>{planId}</span>
          </div>
          <div style={{ fontSize: 11, color: limitReached ? '#DC2626' : 'var(--text4)', fontWeight: limitReached ? 700 : 400 }}>
            {documents.length} / {planMax === 9999 ? '∞' : planMax} documents
            {limitReached && ' — limite atteinte'}
          </div>
          <div className="plan-track">
            <div className="plan-fill" style={{ width: `${planPct}%`, background: limitReached ? '#DC2626' : planColor }} />
          </div>
          {(planId === 'starter' || planId === 'student') && (
            <button className="btn-primary btn-sm btn-full" style={{ marginTop: 9 }} onClick={() => go('/settings#plan')}>
              <Zap size={10} /> Passer au Plan Pro
            </button>
          )}
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <style>{`.db-mobile-close { display: none; } @media(max-width:767px){ .db-mobile-close { display:flex!important; } }`}</style>

      {/* Plan upgrade modal — rendered at root level of page */}
      <PlanUpgradeModal />

      <div className="db">
        <Sidebar />

        {/* Mobile overlay + sidebar container */}
        <div 
          className={`db-side-overlay${sideOpen ? ' open' : ''}`} 
          onClick={() => setSideOpen(false)}
        />

        {/* Sidebar - slides from top on mobile */}
        <div className={`db-side${sideOpen ? ' open' : ''}`}>
          {/* Logo Row */}
          <button className="db-logo-row" onClick={() => router.push('/dashboard')} title="Aller au dashboard">
            <Image src={logo} alt="EETRA" width={24} height={24} style={{ borderRadius:5 }}/>
            <span className="db-logo-name">EETRA</span>
          </button>

          {/* Navigation */}
          <nav className="db-nav">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', Icon: LayoutGrid },
              { id: 'documents', label: 'Documents', Icon: FileText },
              { id: 'templates', label: 'Templates', Icon: Layout },
              { id: 'team', label: 'Équipe', Icon: Users },
              { id: 'analytics', label: 'Analyse', Icon: BarChart2 },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`db-nav-btn${activeNav === id ? ' active' : ''}`}
                onClick={() => { setActiveNav(id); setSideOpen(false); }}
                title={label}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="db-main">
          {/* Top bar */}
          <header className="db-top">
            <div className="db-top-left">
              <button className="db-hamburger" onClick={() => setSideOpen(!sideOpen)} title="Menu">
                {sideOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="db-search">
                <Search size={12} color="var(--text4)" />
                <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="db-top-right">
              <ThemeToggle />
              <div style={{ position: 'relative' }}>
                <button className="db-icon-btn" onClick={() => setShowNotifs(v => !v)}>
                  <Bell size={13} color="var(--text3)" />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 7, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div style={{ position: 'absolute', right: 0, top: 36, zIndex: 100, width: 360 }}>
                    <NotificationCenter onClose={() => setShowNotifs(false)} />
                  </div>
                )}
              </div>
              <button className="db-icon-btn" onClick={() => go('/settings')}><Settings size={13} color="var(--text3)" /></button>
              <button className="db-avatar-btn" onClick={() => go('/onboarding')}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {profile.logoDataUrl
                    ? <img src={profile.logoDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                    : <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--accent)' }}>{getInitials(profile.name || 'EE')}</span>
                  }
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.name || 'Mon espace'}
                </span>
              </button>
            </div>
          </header>

          <div className="db-body">
            <div className="db-inner">
              <div className="db-center">

                {/* Limit banner */}
                {limitReached && (
                  <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Lock size={14} color="#DC2626" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Limite de documents atteinte</div>
                      <div style={{ fontSize: 11, color: 'var(--text4)' }}>
                        Vous avez utilisé vos {planMax} documents/{planId === 'student' ? 'mois' : 'mois'} inclus dans le plan {plan.label}.
                      </div>
                    </div>
                    <button
                      onClick={() => requestUpgrade(`Limite de ${planMax} documents atteinte sur le plan ${plan.label}.`, 'document')}
                      style={{ padding: '5px 12px', borderRadius: 7, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Upgrader →
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text)', margin: 0 }}>
                      {profile.name ? `Bonjour, ${profile.name.split(' ')[0]}` : "Vue d'ensemble"}
                    </h1>
                    <p style={{ fontSize: 11, color: 'var(--text4)', margin: '3px 0 0' }}>
                      {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={newDoc}
                  >
                    <Plus size={13} />
                    Nouveau document
                  </button>
                </div>

                <div className="stat-grid">
                  {[
                    { label: 'Documents',   value: documents.length,  sub: planMax === 9999 ? 'Illimité' : `${Math.max(0, planMax - documents.length)} restant${planMax - documents.length > 1 ? 's' : ''}`, Icon: FileText   },
                    { label: 'Exports',     value: entries.length,    sub: 'PDF et Word générés',                                            Icon: Download   },
                    { label: 'Membres',     value: members.length,    sub: 'Collaborateurs actifs',                                          Icon: Users      },
                    { label: 'Score moyen', value: `${scoreAvg}%`,    sub: 'Complétude des blocs',                                           Icon: TrendingUp },
                  ].map(({ label, value, sub, Icon }) => (
                    <div key={label} className="stat-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label">{label}</span>
                        <Icon size={13} color="var(--text4)" />
                      </div>
                      <div className="stat-val">{value}</div>
                      <div className="stat-sub" style={{ color: label === 'Documents' && limitReached ? '#DC2626' : undefined }}>
                        {sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent documents */}
                <div className="db-block">
                  <div className="db-block-head">
                    <span className="db-block-title">Documents récents</span>
                    <button className="db-block-link" onClick={() => go('/documents')}>Voir tout <ChevronRight size={11} /></button>
                  </div>
                  {recentDocs.length === 0 ? (
                    <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                      <FolderOpen size={24} color="var(--text4)" style={{ marginBottom: 10 }} />
                      <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 12px' }}>Aucun document — créez-en un pour commencer.</p>
                      <button
                        className="btn-primary btn-sm"
                        onClick={newDoc}
                      >
                        <Plus size={11} />
                        Créer un document
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="db-th" style={{ gridTemplateColumns: '1fr 130px 60px 90px' }}>
                        {['Titre', 'Entreprise', 'Pages', 'Modifié'].map(h => <span key={h}>{h}</span>)}
                      </div>
                      {recentDocs.map(doc => (
                        <div key={doc.id} className="db-tr" style={{ gridTemplateColumns: '1fr 130px 60px 90px' }} onClick={() => openDoc(doc)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                            <div className="icon-box" style={{ background: `${doc.docStyle?.accentColor || '#1B4FD8'}0E` }}>
                              <FileText size={12} color={doc.docStyle?.accentColor || 'var(--accent)'} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.title || 'Sans titre'}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.entityName || '—'}</span>
                          <span style={{ fontSize: 12, color: 'var(--text4)' }}>{doc.pageCount || 0}p</span>
                          <span style={{ fontSize: 12, color: 'var(--text4)' }}>{new Date(doc.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Templates */}
                <div className="db-block">
                  <div className="db-block-head">
                    <span className="db-block-title">Démarrage rapide</span>
                    <button className="db-block-link" onClick={() => go('/templates')}>Tous les templates <ChevronRight size={11} /></button>
                  </div>
                  <div className="tpl-grid">
                    {TEMPLATES.map((tpl, i) => (
                      <button
                        key={tpl.id}
                        className="tpl-cell"
                        onClick={() => useTpl(tpl.id)}
                        style={{
                          borderRight:  i % 3 !== 2 ? '1px solid var(--border)' : 'none',
                          borderBottom: i < 3       ? '1px solid var(--border)' : 'none',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: tpl.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{tpl.name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text4)', paddingLeft: 14 }}>{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right panel */}
              <div className="db-right">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="rp-label">Exports récents</span>
                    <button className="db-block-link" onClick={() => go('/history')}>Tout voir</button>
                  </div>
                  {recentExports.length === 0
                    ? <p style={{ fontSize: 11, color: 'var(--text4)' }}>Aucun export pour l'instant.</p>
                    : recentExports.map(e => (
                      <div key={e.id} className="rp-row">
                        <div className="icon-box" style={{ background: 'rgba(5,150,105,.08)' }}>
                          <Download size={11} color="#059669" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                          <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>
                            {e.exportedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {e.pageCount}p
                          </div>
                        </div>
                        <CheckCircle2 size={12} color="#059669" />
                      </div>
                    ))
                  }
                </div>

                <div style={{ height: 1, background: 'var(--border)' }} />

                <div>
                  <div className="rp-label">Activité</div>
                  {activity.length === 0
                    ? <p style={{ fontSize: 11, color: 'var(--text4)' }}>Aucune activité récente.</p>
                    : activity.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 9, padding: '5px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, marginTop: 4, flexShrink: 0 }} />
                          {i < activity.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 3 }} />}
                        </div>
                        <div style={{ paddingBottom: 8, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ color: 'var(--text4)', fontWeight: 500 }}>{a.action}</span>{' — '}<span>{a.label}</span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 1 }}>
                            {a.time.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>

                <div style={{ height: 1, background: 'var(--border)' }} />

                <div>
                  <div className="rp-label">Votre plan</div>
                  {[
                    ['Documents / mois', planMax === 9999 ? '∞' : String(planMax)],
                    ['Pages / document',  plan.maxPagesPerDoc === Infinity ? '∞' : String(plan.maxPagesPerDoc)],
                    ['IA rédactionnelle', plan.ai ? 'Activée' : 'Non incluse'],
                    ['Export PDF + Word', 'Inclus'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text4)' }}>{label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
                    </div>
                  ))}
                  {(planId === 'starter' || planId === 'student') && (
                    <button className="btn-primary btn-sm btn-full" style={{ marginTop: 12 }} onClick={() => go('/settings#plan')}>
                      <Zap size={11} /> Passer au Plan Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:767px){ .db-hamburger { display:flex!important; } }`}</style>
    </>
  )
}
