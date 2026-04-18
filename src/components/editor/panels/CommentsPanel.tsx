'use client'

import { useState } from 'react'
import { MessageSquare, X, Check, CheckCheck, ChevronDown, ChevronRight, Reply } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/Button'

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

type FilterType = 'all' | 'open' | 'resolved'

export function CommentsPanel({ showToast }: Props) {
  const { comments, addComment, removeComment, resolveComment, addReply } = useDocument()
  const { profile } = useProfile()
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const filtered = comments.filter(c => {
    if (filter === 'open') return !c.resolved
    if (filter === 'resolved') return c.resolved
    return true
  })

  function handleAdd() {
    if (!input.trim()) return
    addComment(input.trim(), profile.name || 'Utilisateur')
    setInput('')
    showToast('Commentaire ajouté', 'ok')
  }

  function handleReply(commentId: string) {
    if (!replyText.trim()) return
    addReply(commentId, replyText.trim(), profile.name || 'Utilisateur')
    setReplyText('')
    setReplyingTo(null)
    showToast('Réponse ajoutée', 'ok')
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Tous (${comments.length})` },
    { key: 'open', label: `Attente (${comments.filter(c => !c.resolved).length})` },
    { key: 'resolved', label: `Résolus (${comments.filter(c => c.resolved).length})` },
  ]

  return (
    <div style={{
      width: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'var(--bg2)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '12px 14px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <MessageSquare size={13} color="var(--accent)" strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Revue Collaborative</span>
        </div>

        {/* New comment */}
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ajoutez une annotation de révision..."
          style={{
            width: '100%',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 12,
            border: '1px solid var(--border)',
            outline: 'none',
            resize: 'vertical',
            minHeight: 64,
            lineHeight: 1.5,
            fontFamily: 'inherit',
            background: 'var(--bg3)',
            color: 'var(--text)',
            marginBottom: 8,
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)' }}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd() }}
        />
        <Button variant="primary" fullWidth size="sm" onClick={handleAdd} style={{ marginBottom: 12 }}>
          Ajouter
        </Button>

        {/* Filters */}
        <div style={{
          display: 'flex',
          borderRadius: 8,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: 14,
        }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: filter === f.key ? 'var(--accent)' : 'var(--bg3)',
                color: filter === f.key ? '#fff' : 'var(--text4)',
                transition: 'all .12s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Comments list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 11, color: 'var(--text4)' }}>
            Aucun commentaire{filter !== 'all' ? ' dans cette catégorie' : ''}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(c => (
              <div key={c.id} style={{
                borderRadius: 8,
                border: '1px solid',
                borderColor: c.resolved ? 'var(--border)' : 'var(--accentS2)',
                borderLeft: `3px solid ${c.resolved ? 'var(--text4)' : 'var(--accent)'}`,
                background: c.resolved ? 'var(--bg3)' : 'var(--surface)',
                opacity: c.resolved ? .75 : 1,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.resolved ? 'var(--text4)' : 'var(--accent)', flexShrink: 0 }}>
                      {c.author.slice(0, 16)}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--text4)', flexShrink: 0 }}>
                      {c.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 8, color: 'var(--text2)', margin: '0 0 8px' }}>
                    {c.text}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => resolveComment(c.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, cursor: 'pointer', border: 'none', background: 'transparent', color: c.resolved ? 'var(--text4)' : 'var(--success)', padding: 0 }}>
                      <Check size={9} />
                      {c.resolved ? 'Rouvrir' : 'Résoudre'}
                    </button>
                    <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText('') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text4)', padding: 0 }}>
                      <Reply size={9} />
                      Répondre
                    </button>
                    {c.replies.length > 0 && (
                      <button onClick={() => toggleExpand(c.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text4)', padding: 0 }}>
                        {expanded.has(c.id) ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
                        {c.replies.length} rép.
                      </button>
                    )}
                    <button onClick={() => removeComment(c.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--danger)', marginLeft: 'auto', padding: 0 }}>
                      <X size={9} /> Suppr.
                    </button>
                  </div>

                  {/* Reply input */}
                  {replyingTo === c.id && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Votre réponse..."
                        style={{ flex: 1, borderRadius: 6, padding: '6px 10px', fontSize: 11, border: '1px solid var(--border)', outline: 'none', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'inherit' }}
                        onKeyDown={e => { if (e.key === 'Enter') handleReply(c.id) }}
                        autoFocus
                      />
                      <button onClick={() => handleReply(c.id)}
                        style={{ padding: '4px 10px', borderRadius: 5, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                        ↵
                      </button>
                    </div>
                  )}
                </div>

                {/* Replies thread */}
                {expanded.has(c.id) && c.replies.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {c.replies.map(r => (
                      <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accentS2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--accent)' }}>
                            {r.author.slice(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)' }}>{r.author}</span>
                          <p style={{ fontSize: 11, color: 'var(--text2)', margin: '2px 0 0' }}>{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}