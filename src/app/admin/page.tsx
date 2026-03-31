'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  LayoutGrid,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import logo from '../../app/icon.png'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalDocuments: number
    totalTemplates: number
    totalPayments: number
    successfulPayments: number
    totalRevenue: number
  }
  usersByPlan: Record<string, number>
  recentActivity: {
    newUsers: any[]
    newDocuments: any[]
  }
}

const NAV_ITEMS = [
  { label: 'Vue d\'ensemble', path: '/admin', icon: LayoutDashboard },
  { label: 'Utilisateurs', path: '/admin/users', icon: Users },
  { label: 'Paiements', path: '/admin/payments', icon: CreditCard },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  { label: 'Templates', path: '/admin/templates', icon: LayoutGrid },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Paramètres', path: '/admin/settings', icon: Settings },
]

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPath, setCurrentPath] = useState('/admin')

  // Verify super admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !(session?.user as any)?.isSuperAdmin) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && (session?.user as any)?.isSuperAdmin) {
      fetchAnalytics()
    }
  }, [status, session])

  const handleNavClick = (path: string) => {
    setCurrentPath(path)
    router.push(path)
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ fontSize: '14px', color: 'var(--text3)' }}>Chargement...</div>
      </div>
    )
  }

  return (
    <div className="db">
      {/* Sidebar */}
      <div className="db-side">
        <div className="db-logo-row" onClick={() => router.push('/admin')}>
          <Image src={logo} alt="EETRA" width={24} height={24} />
          <div className="db-logo-name">EETRA</div>
        </div>
        <div className="db-nav">
          <div className="db-nav-label">Admin</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`db-nav-btn ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="db-plan-box">
          <button
            className="db-logout-btn"
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="db-main">
        <div className="db-top">
          <div className="db-top-left">
            <button className="db-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <h1 className="admin-title">Dashboard Admin</h1>
          </div>
          <div className="db-top-right">
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
              Super Admin
            </span>
          </div>
        </div>

        <div className="db-body">
          <div className="db-center">
            <div className="admin-title">Vue d'ensemble</div>
            <div className="admin-desc">Gestion complète de la plateforme EETRA</div>

            {data ? (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-label">Utilisateurs</div>
                    <div className="stat-val">{data.overview.totalUsers}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Documents</div>
                    <div className="stat-val">{data.overview.totalDocuments}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Templates</div>
                    <div className="stat-val">{data.overview.totalTemplates}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Revenus</div>
                    <div className="stat-val">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        maximumFractionDigits: 0,
                      }).format(data.overview.totalRevenue)}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Paiements</div>
                    <div className="stat-val">{data.overview.successfulPayments}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Taux de conversion</div>
                    <div className="stat-val">
                      {data.overview.totalUsers > 0
                        ? Math.round((data.overview.successfulPayments / data.overview.totalUsers) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div className="activity-section">
                    <div className="activity-title">Derniers utilisateurs</div>
                    {data.recentActivity.newUsers.map((user) => (
                      <div key={user.id} className="activity-item">
                        <div className="activity-time">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="activity-desc">{user.email}</div>
                      </div>
                    ))}
                  </div>
                  <div className="activity-section">
                    <div className="activity-title">Derniers documents</div>
                    {data.recentActivity.newDocuments.map((doc) => (
                      <div key={doc.id} className="activity-item">
                        <div className="activity-time">
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="activity-desc">{doc.title || 'Sans titre'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        .db { display:flex; height:100dvh; overflow:hidden; background:var(--bg); color:var(--text); font-size:13px; font-family:'Bricolage Grotesque',sans-serif; }
        .db-side { width:228px; flex-shrink:0; display:flex; flex-direction:column; background:var(--surface); border-right:1px solid var(--border); height:100dvh; overflow:hidden; }
        .db-logo-row { height:52px; padding:0 14px; display:flex; align-items:center; gap:9px; border-bottom:1px solid var(--border); flex-shrink:0; cursor:pointer; }
        .db-logo-name { font-size:15px; font-weight:700; letter-spacing:-.02em; color:var(--text); }
        .db-nav { flex:1; overflow-y:auto; padding:6px; display:flex; flex-direction:column; }
        .db-nav-label { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--text4); padding:10px 8px 4px; margin-top:10px; }
        .db-nav-btn { display:flex; align-items:center; gap:9px; padding:7px 9px; border-radius:6px; cursor:pointer; color:var(--text3); font-size:13px; font-weight:500; border:none; background:transparent; width:100%; text-align:left; transition:background .12s,color .12s; }
        .db-nav-btn:hover { background:var(--bg3); color:var(--text); }
        .db-nav-btn.active { background:var(--accentS); color:var(--accent); font-weight:600; }
        .db-logout-btn { display:flex; align-items:center; gap:6px; padding:7px 9px; border-radius:6px; cursor:pointer; color:var(--text3); font-size:13px; border:none; background:transparent; width:100%; text-align:left; transition:background .12s,color .12s; margin-top:auto; }
        .db-logout-btn:hover { background:var(--bg3); color:var(--danger); }
        .db-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
        .db-top { height:52px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 18px; gap:10px; min-width:0; }
        .db-top-left { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
        .db-top-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .db-icon-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:border-color .12s,background .12s; color:var(--text3); }
        .db-icon-btn:hover { border-color:var(--border2); background:var(--bg3); color:var(--text); }
        .db-body { flex:1; overflow-y:auto; }
        .db-center { flex:1; padding:22px; min-width:0; overflow-y:auto; }
        .admin-title { font-size:24px; font-weight:700; color:var(--text); margin-bottom:4px; }
        .admin-desc { font-size:13px; color:var(--text3); margin-bottom:20px; }
        .stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
        .stat-card { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:14px 16px; }
        .stat-val { font-size:24px; font-weight:700; letter-spacing:-.03em; color:var(--text); margin:8px 0 2px; }
        .stat-label { font-size:11px; color:var(--text4); text-transform:uppercase; }
        .stat-sub { font-size:10px; color:var(--text4); margin-top:2px; }
        .activity-section { background:var(--surface); border:1px solid var(--border); border-radius:7px; padding:14px 16px; margin-bottom:14px; }
        .activity-title { font-size:12px; font-weight:600; color:var(--text); margin-bottom:10px; }
        .activity-item { display:flex; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); font-size:12px; }
        .activity-item:last-child { border-bottom:none; }
        .activity-time { color:var(--text4); min-width:80px; }
        .activity-desc { color:var(--text3); flex:1; }
      `}
