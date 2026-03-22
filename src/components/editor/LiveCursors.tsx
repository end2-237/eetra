'use client'

import { useRealtime } from '@/contexts/RealtimeContext'

/**
 * Renders floating name badges for collaborators viewing the same document.
 * Position them relative to the canvas container.
 */
export function LiveCursors({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const { peers, connected, available } = useRealtime()

  if (!available || peers.length === 0) return null

  return (
    <>
      {/* Presence avatars strip */}
      <div style={{
        position:   'fixed',
        bottom:     80,
        right:      24,
        zIndex:     100,
        display:    'flex',
        flexDirection: 'column',
        gap:        6,
        pointerEvents: 'none',
      }}>
        {connected && (
          <div style={{
            fontSize:   9,
            fontWeight: 700,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color:      'var(--text4)',
            textAlign:  'right',
            marginBottom: 2,
          }}>
            {peers.length} en ligne
          </div>
        )}
        {peers.slice(0, 5).map(peer => (
          <div key={peer.userId} style={{
            display:      'flex',
            alignItems:   'center',
            gap:          6,
            padding:      '5px 10px 5px 6px',
            borderRadius: 99,
            background:   'var(--surface)',
            border:       `1.5px solid ${peer.color}`,
            boxShadow:    '0 2px 8px rgba(0,0,0,.12)',
          }}>
            <div style={{
              width:        20,
              height:       20,
              borderRadius: '50%',
              background:   peer.color,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              flexShrink:   0,
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>
                {peer.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', whiteSpace: 'nowrap', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {peer.userName}
            </span>
            {/* Page indicator */}
            {peer.pageIndex > 0 && (
              <span style={{ fontSize: 9, color: peer.color, fontWeight: 700, flexShrink: 0 }}>
                P{peer.pageIndex + 1}
              </span>
            )}
          </div>
        ))}
        {peers.length > 5 && (
          <div style={{ fontSize: 10, color: 'var(--text4)', textAlign: 'right' }}>
            +{peers.length - 5} autres
          </div>
        )}
      </div>

      {/* Cursor trails (canvas-relative) — rendered when container ref available */}
      {containerRef.current && peers.map(peer => {
        if (!peer.cursor) return null
        const rect = containerRef.current!.getBoundingClientRect()
        return (
          <div
            key={`cursor-${peer.userId}`}
            style={{
              position:  'fixed',
              left:      rect.left + peer.cursor.x - 6,
              top:       rect.top  + peer.cursor.y - 6,
              zIndex:    9999,
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor dot */}
            <div style={{
              width:        12,
              height:       12,
              borderRadius: '50%',
              background:   peer.color,
              border:       '2px solid #fff',
              boxShadow:    '0 2px 6px rgba(0,0,0,.2)',
            }} />
            {/* Name tooltip */}
            <div style={{
              position:     'absolute',
              top:          14,
              left:         8,
              background:   peer.color,
              color:        '#fff',
              fontSize:     10,
              fontWeight:   700,
              padding:      '2px 7px',
              borderRadius: 4,
              whiteSpace:   'nowrap',
            }}>
              {peer.userName}
            </div>
          </div>
        )
      })}
    </>
  )
}
