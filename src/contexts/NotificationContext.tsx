'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type NotifType = 'info' | 'success' | 'warning' | 'comment' | 'approval' | 'export'

export interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  read: boolean
  createdAt: Date
  actionUrl?: string
  actionLabel?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [], unreadCount: 0,
  addNotification: () => {}, markAsRead: () => {}, markAllAsRead: () => {},
  removeNotification: () => {}, clearAll: () => {},
})

const STORAGE_KEY = 'eetra-notifications'

function genId() { return Math.random().toString(36).slice(2, 10) }

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored).map((n: Notification) => ({
          ...n, createdAt: new Date(n.createdAt)
        }))
        setNotifications(parsed)
      }
    } catch {}
  }, [])

  const persist = (items: Notification[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const full: Notification = { ...n, id: genId(), read: false, createdAt: new Date() }
    setNotifications(prev => {
      const updated = [full, ...prev].slice(0, 50)
      persist(updated)
      return updated
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      persist(updated)
      return updated
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      persist(updated)
      return updated
    })
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      persist(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, addNotification, markAsRead,
      markAllAsRead, removeNotification, clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
