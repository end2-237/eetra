'use client'

/**
 * useBlockSync — collaborative real-time block editing via Supabase broadcast.
 *
 * Strategy: last-writer-wins with lamport clock.
 * - Each local mutation is assigned a monotonically increasing clock value.
 * - Mutations are broadcast on a Supabase channel `blocks:DOCID`.
 * - Remote mutations are applied only if their clock > local last-applied.
 *
 * Supported operations:
 *   - block_update: replaces a single block's data
 *   - block_add:    inserts a new block at given position
 *   - block_remove: removes a block by id
 *   - page_add:     adds a new page
 *   - page_remove:  removes a page by index
 *   - title_update: document title changed
 *
 * The hook is designed to be called inside EditorLayout.
 * It patches the DocumentContext directly via exposed setters.
 */

import { useEffect, useRef, useCallback } from 'react'
import { getSupabaseClient }              from '@/lib/supabase'
import { useSession }                     from 'next-auth/react'

export type SyncOp =
  | { type: 'block_update'; pageIdx: number; blockId: string; data: any;   clock: number; userId: string }
  | { type: 'block_add';    pageIdx: number; blockId: string; block: any;  clock: number; userId: string }
  | { type: 'block_remove'; pageIdx: number; blockId: string;              clock: number; userId: string }
  | { type: 'page_add';     pageIdx: number;                               clock: number; userId: string }
  | { type: 'page_remove';  pageIdx: number;                               clock: number; userId: string }
  | { type: 'title_update'; title: string;                                 clock: number; userId: string }

interface BlockSyncOptions {
  docId:         string
  getPages:      () => any[]
  setPages:      (pages: any[]) => void
  setTitle:      (title: string) => void
  debounceMs?:   number
}

export function useBlockSync({
  docId,
  getPages,
  setPages,
  setTitle,
  debounceMs = 500,
}: BlockSyncOptions) {
  const { data: session }      = useSession()
  const channelRef             = useRef<any>(null)
  const clockRef               = useRef<number>(Date.now())
  const lastAppliedRef         = useRef<Record<string, number>>({})  // userId → last applied clock
  const supabase               = getSupabaseClient()
  const pendingRef             = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ── Apply a remote operation ────────────────────────────────────────────────

  const applyRemote = useCallback((op: SyncOp) => {
    const prev = lastAppliedRef.current[op.userId] ?? 0
    if (op.clock <= prev) return  // skip stale / duplicate
    lastAppliedRef.current[op.userId] = op.clock

    const pages = getPages()

    if (op.type === 'title_update') {
      setTitle(op.title)
      return
    }

    if (op.type === 'page_add') {
      const newPage = {
        id:     `page-${Date.now()}`,
        blocks: [],
      }
      const next = [...pages]
      next.splice(op.pageIdx, 0, newPage)
      setPages(next)
      return
    }

    if (op.type === 'page_remove') {
      if (pages.length <= 1) return
      const next = pages.filter((_, i) => i !== op.pageIdx)
      setPages(next)
      return
    }

    if (op.pageIdx >= pages.length) return

    const nextPages = pages.map((page, pi) => {
      if (pi !== op.pageIdx) return page

      if (op.type === 'block_update') {
        return {
          ...page,
          blocks: page.blocks.map((b: any) =>
            b.id === op.blockId ? { ...b, ...op.data } : b
          ),
        }
      }

      if (op.type === 'block_add') {
        const blocks = [...(page.blocks || [])]
        blocks.push(op.block)
        return { ...page, blocks }
      }

      if (op.type === 'block_remove') {
        return {
          ...page,
          blocks: (page.blocks || []).filter((b: any) => b.id !== op.blockId),
        }
      }

      return page
    })

    setPages(nextPages)
  }, [getPages, setPages, setTitle])

  // ── Subscribe to channel ────────────────────────────────────────────────────

  useEffect(() => {
    if (!supabase || !docId) return

    const channel = supabase.channel(`blocks:${docId}`)

    channel
      .on('broadcast', { event: 'op' }, ({ payload }: { payload: SyncOp }) => {
        const myId = (session?.user as any)?.id
        if (payload.userId === myId) return  // ignore own ops
        applyRemote(payload)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [supabase, docId, session]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Broadcast an operation (debounced per blockId) ─────────────────────────

  const broadcast = useCallback((op: Omit<SyncOp, 'clock' | 'userId'>) => {
    if (!channelRef.current) return

    const myId = (session?.user as any)?.id ?? 'anonymous'
    clockRef.current++
    const full: SyncOp = { ...op, clock: clockRef.current, userId: myId } as SyncOp

    // Debounce block_update by blockId to avoid flooding on keystroke
    if (op.type === 'block_update') {
      const key = `${op.pageIdx}:${op.blockId}`
      const existing = pendingRef.current.get(key)
      if (existing) clearTimeout(existing)
      pendingRef.current.set(key, setTimeout(() => {
        pendingRef.current.delete(key)
        channelRef.current?.send({ type: 'broadcast', event: 'op', payload: full })
      }, debounceMs))
    } else {
      // Immediate for structural ops
      channelRef.current.send({ type: 'broadcast', event: 'op', payload: full })
    }
  }, [session, debounceMs])

  return { broadcast }
}
