'use client'

import {
  createContext, useContext, useEffect, useRef,
  useState, useCallback, type ReactNode,
} from 'react'
import { useSession }                       from 'next-auth/react'
import { getSupabaseClient, getCursorColor, type PresenceState } from '@/lib/supabase'
import { useProfile }                       from '@/contexts/ProfileContext'

interface RealtimeContextType {
  /** Other users currently in the same document */
  peers:         PresenceState[]
  /** Whether realtime is connected */
  connected:     boolean
  /** Whether Supabase env vars are configured */
  available:     boolean
  /** Update your own cursor position */
  updateCursor:  (x: number, y: number, pageIndex: number) => void
  /** Join a document channel */
  joinDocument:  (docId: string) => void
  /** Leave the current channel */
  leaveDocument: () => void
}

const RealtimeContext = createContext<RealtimeContextType>({
  peers:         [],
  connected:     false,
  available:     false,
  updateCursor:  () => {},
  joinDocument:  () => {},
  leaveDocument: () => {},
})

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session }    = useSession()
  const { profile }          = useProfile()
  const channelRef           = useRef<any>(null)
  const docIdRef             = useRef<string | null>(null)
  const [peers, setPeers]    = useState<PresenceState[]>([])
  const [connected, setConnected]   = useState(false)
  const supabase = getSupabaseClient()
  const available = !!supabase

  const myUserId   = session?.user?.id   || 'anonymous'
  const myUserName = session?.user?.name || profile.name || 'Invité'
  const myColor    = getCursorColor(myUserId)

  const leaveDocument = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
    setPeers([])
    setConnected(false)
    docIdRef.current = null
  }, [])

  const joinDocument = useCallback((docId: string) => {
    if (!supabase) return
    if (docIdRef.current === docId) return // already joined

    // Leave previous channel
    if (channelRef.current) channelRef.current.unsubscribe()
    docIdRef.current = docId

    const channel = supabase.channel(`doc:${docId}`, {
      config: { presence: { key: myUserId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state  = channel.presenceState<PresenceState>()
        const others = Object.entries(state)
          .flatMap(([key, presences]) => presences as PresenceState[])
          .filter(p => p.userId !== myUserId)
        setPeers(others)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const p = (newPresences as PresenceState[])[0]
        if (p && p.userId !== myUserId) {
          setPeers(prev => [...prev.filter(x => x.userId !== p.userId), p])
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const p = (leftPresences as PresenceState[])[0]
        if (p) setPeers(prev => prev.filter(x => x.userId !== p.userId))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          await channel.track({
            userId:    myUserId,
            userName:  myUserName,
            color:     myColor,
            cursor:    null,
            pageIndex: 0,
            lastSeen:  Date.now(),
          } satisfies PresenceState)
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnected(false)
        }
      })

    channelRef.current = channel
  }, [supabase, myUserId, myUserName, myColor])

  const updateCursor = useCallback((x: number, y: number, pageIndex: number) => {
    if (!channelRef.current || !connected) return
    channelRef.current.track({
      userId:    myUserId,
      userName:  myUserName,
      color:     myColor,
      cursor:    { x, y },
      pageIndex,
      lastSeen:  Date.now(),
    } satisfies PresenceState)
  }, [connected, myUserId, myUserName, myColor])

  // Cleanup on unmount
  useEffect(() => () => { leaveDocument() }, [leaveDocument])

  return (
    <RealtimeContext.Provider value={{
      peers, connected, available,
      updateCursor, joinDocument, leaveDocument,
    }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export const useRealtime = () => useContext(RealtimeContext)
