/**
 * Supabase client for Realtime features (presence, live cursors).
 * The full database is managed by Prisma — Supabase is used only for
 * its Realtime WebSocket channels here.
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
const akey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!url || !akey) return null
  if (!_client) {
    _client = createClient(url, akey, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  }
  return _client
}

export type PresenceState = {
  userId:    string
  userName:  string
  color:     string
  cursor:    { x: number; y: number } | null
  pageIndex: number
  lastSeen:  number
}

/** Random color palette for user cursors */
const CURSOR_COLORS = [
  '#1B4FD8', '#059669', '#7C3AED', '#DC2626',
  '#D97706', '#0E7490', '#B45309', '#374151',
]

export function getCursorColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = (hash << 5) - hash + userId.charCodeAt(i)
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}
