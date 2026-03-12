'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/Button'

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

export function CommentsPanel({ showToast }: Props) {
  const { comments, addComment, removeComment } = useDocument()
  const { profile } = useProfile()
  const [input, setInput] = useState('')

  function handleAdd() {
    if (!input.trim()) return
    addComment(input.trim(), profile.name || 'Utilisateur')
    setInput('')
    showToast('Commentaire ajouté')
    // update badge
    const badge = document.getElementById('cmt-badge')
    // Note: badge is managed by sidebar, emit event
  }

  return (
    <div className="w-[272px] min-w-[272px] border-r overflow-y-auto hide-scroll flex flex-col"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={13} color="var(--accent)" strokeWidth={2} />
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Revue Collaborative</span>
        </div>

        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ajoutez une annotation de révision..."
          className="w-full rounded-lg px-3.5 py-2.5 text-[13px] border outline-none resize-y min-h-[72px] leading-relaxed font-sans mb-2"
          style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)'; }}
        />
        <Button variant="primary" fullWidth size="sm" onClick={handleAdd} style={{ marginBottom: 16 }}>
          Ajouter
        </Button>

        {comments.length === 0 ? (
          <div className="text-[11px] text-center py-6" style={{ color: 'var(--text4)' }}>
            Aucun commentaire.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {comments.map(c => (
              <div key={c.id} className="rounded-lg border-l-[3px] p-3 border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: 'var(--accent)' }}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>
                    {c.author.slice(0, 16)}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: 'var(--text4)' }}>
                    {c.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed mb-1.5" style={{ color: 'var(--text2)' }}>
                  {c.text}
                </p>
                <button onClick={() => removeComment(c.id)}
                  className="flex items-center gap-1 text-[10px] cursor-pointer border-none bg-transparent"
                  style={{ color: 'var(--text4)' }}>
                  <X size={9} /> Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
