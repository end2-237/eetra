'use client'

import { useRouter } from 'next/navigation'
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
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import logo from '../../app/icon.png'

interface NavItem {
  label: string
  path: string
  icon: any
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Vue d\'ensemble', path: '/admin', icon: LayoutDashboard },
  { label: 'Utilisateurs', path: '/admin/users', icon: Users },
  { label: 'Paiements', path: '/admin/payments', icon: CreditCard },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  { label: 'Templates', path: '/admin/templates', icon: LayoutGrid },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Paramètres', path: '/admin/settings', icon: Settings },
]

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPath, setCurrentPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/admin')

  const handleNavClick = (path: string) => {
    setCurrentPath(path)
    router.push(path)
  }

  return (
    <div className="db">
      <style>{`
        .db { display:flex; height:100dvh; overflow:hidden; background:var(--bg); color:var(--text); font-size:13px; font-family:'Bricolage Grotesque',sans-serif; }
        .db-side { width:228px; flex-shrink:0; display:flex; flex-direction:column; background:var(--surface); border-right:1px solid var(--border); height:100dvh; transition:width .3s ease; overflow:hidden; }
        .db-side.collapsed { width:0; }
        .db-logo-row { height:52px; padding:0 14px; display:flex; align-items:center; gap:9px; border-bottom:1px solid var(--border); flex-shrink:0; cursor:pointer; }
        .db-logo-name { font-size:15px; font-weight:700; letter-spacing:-.02em; color:var(--text); }
        .db-nav { flex:1; overflow-y:auto; padding:6px; display:flex; flex-direction:column; }
        .db-nav-label { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--text4); padding:10px 8px 4px; }
        .db-nav-btn { display:flex; align-items:center; gap:9px; padding:7px 9px; border-radius:6px; cursor:pointer; color:var(--text3); font-size:13px; font-weight:500; border:none; background:transparent; width:100%; text-align:left; transition:background .12s,color .12s; }
        .db-nav-btn:hover { background:var(--bg3); color:var(--text); }
        .db-nav-btn.active { background:var(--accentS); color:var(--accent); font-weight:600; }
        .db-plan-box { padding:10px; border-top:1px solid var(--border); flex-shrink:0; }
        .db-plan-inner { background:var(--bg2); border:1px solid var(--border); border-radius:7px; padding:11px 12px; }
        .db-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
        .db-top { height:52px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 18px; gap:10px; min-width:0; }
        .db-top-left { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
        .db-top-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .db-icon-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:border-color .12s,background .12s; }
        .db-icon-btn:hover { border-color:var(--border2); background:var(--bg3); }
        .db-body { flex:1; overflow-y:auto; }
        .db-center { flex:1; padding:22px; min-width:0; overflow-y:auto; }
        .admin-title { font-size:24px; font-weight:700; color:var(--text); margin-bottom:4px; }
        .admin-desc { font-size:13px; color:var(--text3); }
      `}
