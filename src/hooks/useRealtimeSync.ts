'use client'

/**
 * useRealtimeSync — broadcasts document changes to collaborators via Supabase.
 *
 * When a user edits a document (title change, block add/remove), we broadcast
 * a lightweight diff event on the channel. Other users receive it and can
 * show a "Document mis à jour par X" notification without full reload.
 *
 * Usage: call in EditorLayout after adding this hook.
 */

import { useEffect, useRef, useCallback } from 'react'
import { getSupabaseClient }              from '@/lib/supabase'

export type DocEvent =
  | { type: 'block_added';   blockType: string; userName: string }
  | { type: 'block_removed'; userName: string }
  | { type: 'title_changed'; title: string;     userName: string }
  | { type: 'page_added';    userName: string }
  | { type: 'exported';      format: string;    userName: string }

interface Options {
  docId:    string
  userName: string
  onEvent?: (event: DocEvent) => void
}

export function useRealtimeSync({ docId, userName, onEvent }: Options) {
  const channelRef  = useRef<any>(null)
  const supabase    = getSupabaseClient()

  useEffect(() => {
    if (!supabase || !docId) return

    const channel = supabase.channel(`sync:${docId}`)

    channel
      .on('broadcast', { event: 'doc_event' }, ({ payload }: { payload: DocEvent }) => {
        // Ignore our own events (they won't have a userName match since we
        // set it before broadcast, but as safety we could check user ID)
        onEvent?.(payload)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [supabase, docId]) // eslint-disable-line react-hooks/exhaustive-deps

  const broadcast = useCallback((event: DocEvent) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type:    'broadcast',
      event:   'doc_event',
      payload: event,
    })
  }, [])

  return { broadcast }
}
