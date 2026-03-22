'use client'

/**
 * usePushNotifications — Web Push API integration
 *
 * Workflow:
 * 1. User grants permission via `requestPermission()`
 * 2. Browser subscribes via PushManager.subscribe()
 * 3. Subscription is sent to /api/push/subscribe (persisted in Prisma)
 * 4. Server (e.g. Supabase webhook or API route) calls /api/push/send to push
 *
 * Falls back gracefully if Push API is unsupported.
 */

import { useState, useEffect, useCallback } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export type PushStatus = 'unsupported' | 'default' | 'denied' | 'granted'

export function usePushNotifications() {
  const [status,    setStatus]    = useState<PushStatus>('default')
  const [loading,   setLoading]   = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      const perm = Notification.permission
      setStatus(perm as PushStatus)
    } else {
      setStatus('unsupported')
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported || !VAPID_PUBLIC_KEY) return false
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return false }
      setStatus('granted')

      // Register SW if needed
      const swReg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe to push
      const sub = await swReg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Send to server
      await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON() }),
      })

      return true
    } catch (err) {
      console.error('Push subscription failed:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [supported])

  const unsubscribe = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.getRegistration()
      if (!swReg) return
      const sub = await swReg.pushManager.getSubscription()
      if (!sub) return
      await sub.unsubscribe()
      await fetch('/api/push/subscribe', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ endpoint: sub.endpoint }),
      })
      setStatus('default')
    } catch {}
  }, [])

  const sendTestNotification = useCallback(async () => {
    await fetch('/api/push/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        title:   '🎉 Notifications EETRA activées',
        body:    'Vous recevrez désormais des alertes pour vos documents.',
        icon:    '/icon.png',
        badge:   '/icon.png',
      }),
    })
  }, [])

  return { status, loading, supported, requestPermission, unsubscribe, sendTestNotification }
}
