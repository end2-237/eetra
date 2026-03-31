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
  Send,
} from 'lucide-react'
import Image from 'next/image'
import logo from '../../../app/icon.png'

const NAV_ITEMS = [
  { label: 'Vue d\'ensemble', path: '/admin', icon: LayoutDashboard },
  { label: 'Utilisateurs', path: '/admin/users', icon: Users },
  { label: 'Paiements', path: '/admin/payments', icon: CreditCard },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  { label: 'Templates', path: '/admin/templates', icon: LayoutGrid },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Paramètres', path: '/admin/settings', icon: Settings },
]

export default function AdminNotifications() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPath] = useState('/admin/notifications')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !(session?.user as any)?.isSuperAdmin) {
      router.push('/dashboard')
    } else {
      setLoading(false)
    }
  }, [status, session, router])

  const handleSendNotification = async () => {
    if (!title || !message) {
      alert('Veuillez remplir tous les champs')
      return
    }

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      })
      if (!res.ok) throw new Error('Failed to send notification')
      alert('Notification envoyée avec succès')
      setTitle('')
      setMessage('')
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Erreur lors de l\'envoi de la notification')
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
            <h1 className="admin-title">Notifications</h1>
          </div>
        </div>

        <div className="db-body">
          <div className="db-center">
            <div className="admin-title">Envoyer une notification</div>
            <div className="admin-desc">Communiquer avec tous les utilisateurs</div>

            <div className="db-block">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Titre</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Titre de la notification..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Votre message ici..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  className="btn-primary"
                  onClick={handleSendNotification}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Send size={16} />
                  Envoyer la notification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .db { display:flex; height:100dvh; overflow:hidden; background:var(--bg); color:var(--text); font-size:13px; font-family:'Bricolage Grotesque',sans-serif; }
        .db-side { width:228px; flex-shrink:0; display:flex; flex-direction:column; background:var(--surface); border-right:1px solid var(--border); height:100dvh; }
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
        .db-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:20px; overflow:hidden; }
        .form-group { margin-bottom:16px; }
        .form-label { display:block; font-size:12px; font-weight:600; color:var(--text); margin-bottom:6px; }
        .form-input { width:100%; padding:8px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text); font-size:12px; font-family:inherit; }
        .form-textarea { min-height:120px; resize:vertical; }
        .btn-primary { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; }
        .btn-primary:hover { opacity:.88; }
      `}
      </style>
    </div>
  )
}
