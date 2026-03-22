'use client'

import { Bell, BellOff, Smartphone, Check, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

/**
 * PushNotificationToggle — inline component for Settings > Notifications.
 * Shows current permission state, allows enabling / disabling push.
 */
export function PushNotificationToggle() {
  const { status, loading, supported, requestPermission, unsubscribe, sendTestNotification } = usePushNotifications()

  if (!supported) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', opacity: .6 }}>
        <BellOff size={14} color="var(--text4)" />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Notifications push</div>
          <div style={{ fontSize: 11, color: 'var(--text4)' }}>Non supporté par ce navigateur</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: status === 'granted' ? 'rgba(5,150,105,.1)' : 'var(--bg2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {status === 'granted'
            ? <Bell size={13} color="#059669" />
            : <BellOff size={13} color="var(--text4)" />
          }
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            Notifications push
          </div>
          <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>
            {status === 'granted'  ? 'Activées — reçoit les alertes documents, exports et équipe'
           : status === 'denied'   ? 'Bloquées — autorisez dans les réglages du navigateur'
           : 'Recevoir des alertes même quand EETRA est fermé'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
        {status === 'granted' && (
          <button
            onClick={sendTestNotification}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 11, color: 'var(--text3)', cursor: 'pointer' }}
          >
            <Smartphone size={10} /> Test
          </button>
        )}
        {status === 'granted' ? (
          <button
            onClick={unsubscribe}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(220,38,38,.3)', background: 'transparent', fontSize: 11, color: '#DC2626', cursor: 'pointer' }}
          >
            Désactiver
          </button>
        ) : (
          <button
            onClick={requestPermission}
            disabled={loading || status === 'denied'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6,
              border: 'none', fontSize: 11, fontWeight: 700, cursor: status === 'denied' ? 'default' : 'pointer',
              background: status === 'denied' ? 'var(--bg3)' : 'var(--accent)',
              color:      status === 'denied' ? 'var(--text4)' : '#fff',
              opacity: loading ? .7 : 1,
            }}
          >
            {loading ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <Bell size={10} />}
            {status === 'denied' ? 'Bloquées' : 'Activer'}
          </button>
        )}
      </div>
    </div>
  )
}
