'use client'

import { useState } from 'react'
import { MessageSquare, X, Check, ChevronDown, ChevronRight, Reply } from 'lucide-react'
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
    { key: 'open', label: `En attente (${comments.filter(c => !c.resolved).length})` },
    { key: 'resolved', label: `Résolus (${comments.filter(c => c.resolved).length})` },
  ]

  return (
    <div className="w-[272px] min-w-[272px] border-r overflow-y-auto hide-scroll flex flex-col"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={13} color="var(--accent)" strokeWidth={2} />
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Revue Collaborative</span>
        </div>

        {/* New comment */}
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ajoutez une annotation de révision..."
          className="w-full rounded-lg px-3.5 py-2.5 text-[13px] border outline-none resize-y min-h-[72px] leading-relaxed font-sans mb-2"
          style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)'; }}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd() }}
        />
        <Button variant="primary" fullWidth size="sm" onClick={handleAdd} style={{ marginBottom: 16 }}>
          Ajouter
        </Button>

        {/* Filters */}
        <div className="flex rounded-lg border overflow-hidden mb-4" style={{ borderColor: 'var(--border)' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex-1 py-1.5 text-[10px] font-bold cursor-pointer border-none transition-colors"
              style={filter === f.key
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'var(--bg3)', color: 'var(--text4)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Comments list */}
        {filtered.length === 0 ? (
          <div className="text-[11px] text-center py-6" style={{ color: 'var(--text4)' }}>
            Aucun commentaire{filter !== 'all' ? ' dans cette catégorie' : ''}.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(c => (
              <div key={c.id}
                className="rounded-lg border"
                style={{
                  background: c.resolved ? 'var(--bg3)' : 'var(--surface)',
                  borderColor: c.resolved ? 'var(--border)' : 'var(--accentS2)',
                  borderLeft: `3px solid ${c.resolved ? 'var(--text4)' : 'var(--accent)'}`,
                  opacity: c.resolved ? .75 : 1,
                }}>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <span className="text-[11px] font-bold" style={{ color: c.resolved ? 'var(--text4)' : 'var(--accent)' }}>
                      {c.author.slice(0, 16)}
                    </span>
                    <span className="font-mono text-[9px] flex-shrink-0" style={{ color: 'var(--text4)' }}>
                      {c.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed mb-2" style={{ color: 'var(--text2)' }}>
                    {c.text}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => resolveComment(c.id)}
                      className="flex items-center gap-1 text-[10px] cursor-pointer border-none bg-transparent transition-colors"
                      style={{ color: c.resolved ? 'var(--text4)' : 'var(--success)' }}
                    >
                      <Check size={9} />
                      {c.resolved ? 'Rouvrir' : 'Résoudre'}
                    </button>
                    <button
                      onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText('') }}
                      className="flex items-center gap-1 text-[10px] cursor-pointer border-none bg-transparent"
                      style={{ color: 'var(--text4)' }}
                    >
                      <Reply size={9} />
                      Répondre
                    </button>
                    {c.replies.length > 0 && (
                      <button
                        onClick={() => toggleExpand(c.id)}
                        className="flex items-center gap-1 text-[10px] cursor-pointer border-none bg-transparent"
                        style={{ color: 'var(--text4)' }}
                      >
                        {expanded.has(c.id) ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
                        {c.replies.length} réponse{c.replies.length > 1 ? 's' : ''}
                      </button>
                    )}
                    <button
                      onClick={() => removeComment(c.id)}
                      className="flex items-center gap-1 text-[10px] cursor-pointer border-none bg-transparent ml-auto"
                      style={{ color: 'var(--danger)' }}
                    >
                      <X size={9} /> Suppr.
                    </button>
                  </div>

                  {/* Reply input */}
                  {replyingTo === c.id && (
                    <div className="mt-2 flex gap-2">
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Votre réponse..."
                        className="flex-1 rounded px-2.5 py-1.5 text-[11px] border outline-none font-sans"
                        style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        onKeyDown={e => { if (e.key === 'Enter') handleReply(c.id) }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleReply(c.id)}
                        style={{ padding: '4px 10px', borderRadius: 5, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                      >↵</button>
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
                          <span className="text-[10px] font-bold" style={{ color: 'var(--text3)' }}>{r.author}</span>
                          <p className="text-[11px]" style={{ color: 'var(--text2)', margin: '2px 0 0' }}>{r.text}</p>
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
