'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Trash2, ArrowLeft, FileText, Crown, Edit3, Eye } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { TeamMember } from '@/types'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

const ROLE_CONFIG: Record<TeamMember['role'], { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  admin: { label: 'Admin', color: '#1B4FD8', icon: <Crown size={11} />, desc: 'Accès complet, gestion des membres' },
  editor: { label: 'Rédacteur', color: '#059669', icon: <Edit3 size={11} />, desc: 'Création et édition de documents' },
  viewer: { label: 'Lecteur', color: '#D97706', icon: <Eye size={11} />, desc: 'Consultation uniquement' },
}

export default function TeamPage() {
  const router = useRouter()
  const { members, addMember, removeMember, updateRole } = useTeam()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamMember['role']>('editor')
  const [adding, setAdding] = useState(false)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    addMember(name, email, role)
    setName(''); setEmail(''); setRole('editor')
    setAdding(false)
  }

  const inpClass = "w-full rounded-lg px-3.5 py-2.5 text-[13px] border outline-none font-sans"
  const inpStyle = { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 h-14 border-b flex items-center justify-between px-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[12px] cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text4)' }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <FileText size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
            <span className="text-[12px]" style={{ color: 'var(--text4)' }}>/ Équipe</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-[760px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>
              Gestion de l'Équipe
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
              {members.length} membre{members.length > 1 ? 's' : ''} dans votre espace de travail
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setAdding(!adding)}>
            <Plus size={13} /> Inviter un membre
          </Button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="rounded-2xl border p-6 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--accent)' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
              Nouvel Invité
            </div>
            <form onSubmit={handleAdd}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>Nom complet</label>
                  <input className={inpClass} style={inpStyle} placeholder="Marie Dupont"
                    value={name} onChange={e => setName(e.target.value)} required
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>Adresse e-mail</label>
                  <input type="email" className={inpClass} style={inpStyle} placeholder="marie@entreprise.com"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text3)' }}>Rôle</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(ROLE_CONFIG) as [TeamMember['role'], typeof ROLE_CONFIG[TeamMember['role']]][]).map(([r, cfg]) => (
                    <button
                      key={r} type="button"
                      onClick={() => setRole(r)}
                      className="p-3 rounded-xl border text-left cursor-pointer transition-all"
                      style={{
                        background: role === r ? `${cfg.color}14` : 'var(--bg2)',
                        borderColor: role === r ? cfg.color : 'var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1" style={{ color: cfg.color }}>
                        {cfg.icon}
                        <span className="text-[12px] font-bold">{cfg.label}</span>
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{cfg.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Annuler</Button>
                <Button type="submit" variant="primary" size="sm">Inviter →</Button>
              </div>
            </form>
          </div>
        )}

        {/* Members list */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
            <div className="grid grid-cols-4 gap-3">
              {['Membre', 'Email', 'Rôle', 'Actions'].map(h => (
                <span key={h} className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>{h}</span>
              ))}
            </div>
          </div>

          {members.map((member, i) => {
            const cfg = ROLE_CONFIG[member.role]
            return (
              <div key={member.id}
                className="px-5 py-4 grid grid-cols-4 gap-3 items-center"
                style={{ borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
                    style={{ background: 'var(--bg3)' }}>
                    {member.avatar}
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{member.name}</span>
                </div>

                <span className="text-[12px] truncate" style={{ color: 'var(--text4)' }}>{member.email}</span>

                <div>
                  {member.role === 'admin' ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit"
                      style={{ background: `${cfg.color}14`, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={e => updateRole(member.id, e.target.value as TeamMember['role'])}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-bold border cursor-pointer outline-none"
                      style={{ background: `${cfg.color}14`, borderColor: `${cfg.color}40`, color: cfg.color }}
                    >
                      <option value="editor">Rédacteur</option>
                      <option value="viewer">Lecteur</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>

                <div>
                  {member.role !== 'admin' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Retirer ${member.name} de l'équipe ?`)) removeMember(member.id)
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border transition-all"
                      style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }}
                      onMouseEnter={e => { (e.currentTarget).style.background = '#FEE2E2'; (e.currentTarget).style.color = '#DC2626'; }}
                      onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text4)'; }}
                    >
                      <Trash2 size={11} /> Retirer
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Role legend */}
        <div className="mt-6 rounded-xl p-4 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text4)' }}>
            Niveaux d'Accès
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(Object.entries(ROLE_CONFIG) as [TeamMember['role'], typeof ROLE_CONFIG[TeamMember['role']]][]).map(([r, cfg]) => (
              <div key={r}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: cfg.color }}>
                  {cfg.icon}
                  <span className="text-[12px] font-bold">{cfg.label}</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text4)' }}>{cfg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
