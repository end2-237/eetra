'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
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
  Trash2,
  Edit2,
} from 'lucide-react'
import Image from 'next/image'
import logo from '../../../app/icon.png'

interface User {
  id: string
  email: string
  name?: string
  profile?: { planId: string }
  createdAt: string
}

interface UsersData {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
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

export default function AdminUsers() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<UsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPath] = useState('/admin/users')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Verify super admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !(session?.user as any)?.isSuperAdmin) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        })
        if (searchQuery) params.append('search', searchQuery)

        const res = await fetch(`/api/admin/users?${params}`)
        if (!res.ok) throw new Error('Failed to fetch users')
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && (session?.user as any)?.isSuperAdmin) {
      fetchUsers()
    }
  }, [status, session, page, searchQuery])

  const handleChangePlan = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPlanId: newPlan }),
      })
      if (!res.ok) throw new Error('Failed to update plan')
      // Refetch users
      window.location.reload()
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('Erreur lors de la mise à jour du plan')
    }
  }

  const handleNavClick = (path: string) => {
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
            <h1 className="admin-title">Gestion des utilisateurs</h1>
          </div>
          <div className="db-top-right">
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
              {data?.pagination.total || 0} utilisateurs
            </span>
          </div>
        </div>

        <div className="db-body">
          <div className="db-center">
            <div className="admin-title">Utilisateurs</div>
            <div className="admin-desc">Gérez les utilisateurs de la plateforme</div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Rechercher par email ou nom..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {data ? (
              <>
                <div className="db-block">
                  <div className="db-block-head">
                    <div className="db-block-title">Liste des utilisateurs</div>
                  </div>
                  <div className="db-th">
                    <span>Email</span>
                    <span>Nom</span>
                    <span>Plan</span>
                    <span>Actions</span>
                  </div>
                  {data.users.map((user) => (
                    <div key={user.id} className="db-tr">
                      <div>{user.email}</div>
                      <div>{user.name || '-'}</div>
                      <select
                        className="user-select"
                        defaultValue={user.profile?.planId || 'starter'}
                        onChange={(e) => handleChangePlan(user.id, e.target.value)}
                      >
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                      <div style={{ fontSize: '11px', color: 'var(--text4)' }}>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.pages > 1 && (
                  <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px' }}>
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          padding: '6px 10px',
                          margin: '0 4px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          background: p === page ? 'var(--accent)' : 'transparent',
                          color: p === page ? '#fff' : 'var(--text)',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
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
        .db-top { height:52px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 18px; gap:10px; }
        .db-top-left { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
        .db-icon-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text3); }
        .db-icon-btn:hover { border-color:var(--border2); background:var(--bg3); color:var(--text); }
        .db-body { flex:1; overflow-y:auto; }
        .db-center { flex:1; padding:22px; min-width:0; overflow-y:auto; }
        .admin-title { font-size:24px; font-weight:700; color:var(--text); margin-bottom:4px; }
        .admin-desc { font-size:13px; color:var(--text3); margin-bottom:20px; }
        .search-box { display:flex; align-items:center; gap:7px; border:1px solid var(--border); border-radius:6px; padding:6px 10px; background:var(--bg); margin-bottom:16px; }
        .search-box input { border:none; outline:none; background:transparent; font-size:12px; color:var(--text); width:100%; }
        .search-box input::placeholder { color:var(--text4); }
        .db-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
        .db-block-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid var(--border); background:var(--bg); }
        .db-block-title { font-size:12px; font-weight:600; color:var(--text); }
        .db-th { display:grid; grid-template-columns:1fr 1fr 1fr 100px; gap:10px; padding:5px 14px; border-bottom:1px solid var(--border); background:var(--bg2); }
        .db-th span { font-size:10px; font-weight:600; color:var(--text4); text-transform:uppercase; }
        .db-tr { display:grid; grid-template-columns:1fr 1fr 1fr 100px; gap:10px; padding:8px 14px; border-bottom:1px solid var(--border); align-items:center; }
        .db-tr:hover { background:var(--bg2); }
        .user-select { width:100%; padding:4px 6px; border:1px solid var(--border); border-radius:4px; background:var(--bg); color:var(--text); font-size:11px; }
      `}
      </style>
    </div>
  )
}
