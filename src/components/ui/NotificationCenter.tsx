'use client'

import { useNotifications, type Notification } from '@/contexts/NotificationContext'
import { Bell, X, Check, CheckCheck, Info, MessageSquare, Download, Users, Zap, AlertTriangle } from 'lucide-react'

const TYPE_CONFIG = {
  info:     { icon: <Info size={13} />,            color: 'var(--accent)',  bg: 'var(--accentS)' },
  success:  { icon: <Check size={13} />,           color: '#059669',        bg: 'rgba(5,150,105,.1)' },
  warning:  { icon: <AlertTriangle size={13} />,   color: '#D97706',        bg: 'rgba(217,119,6,.1)' },
  comment:  { icon: <MessageSquare size={13} />,   color: '#7C3AED',        bg: 'rgba(124,58,237,.1)' },
  approval: { icon: <Zap size={13} />,             color: '#D97706',        bg: 'rgba(217,119,6,.1)' },
  export:   { icon: <Download size={13} />,        color: '#059669',        bg: 'rgba(5,150,105,.1)' },
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "À l'instant"
  if (min < 60) return `Il y a ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

interface Props {
  onClose: () => void
}

export function NotificationCenter({ onClose }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()

  return (
    <div
      className="rounded-2xl border shadow-2xl overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Bell size={14} color="var(--accent)" />
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1 text-[10px] font-bold cursor-pointer border-none bg-transparent" style={{ color: 'var(--accent)' }}>
              <CheckCheck size={10} /> Tout lire
            </button>
          )}
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent" style={{ color: 'var(--text4)' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell size={28} style={{ color: 'var(--text4)', margin: '0 auto 8px' }} />
            <p className="text-[12px]" style={{ color: 'var(--text4)' }}>Aucune notification</p>
          </div>
        ) : (
          notifications.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info
            return (
              <div
                key={notif.id}
                className="flex items-start gap-3 px-4 py-3 border-b transition-all"
                style={{
                  borderColor: 'var(--border)',
                  background: notif.read ? 'transparent' : `${cfg.bg}`,
                  cursor: 'pointer',
                }}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{notif.title}</span>
                    <span className="text-[9px] flex-shrink-0" style={{ color: 'var(--text4)' }}>{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text3)' }}>{notif.message}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeNotification(notif.id) }}
                  className="opacity-0 hover:opacity-100 cursor-pointer border-none bg-transparent transition-opacity flex-shrink-0"
                  style={{ color: 'var(--text4)' }}
                >
                  <X size={12} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={clearAll} className="text-[10px] font-bold cursor-pointer border-none bg-transparent w-full text-center" style={{ color: 'var(--danger)' }}>
            Effacer toutes les notifications
          </button>
        </div>
      )}
    </div>
  )
}
