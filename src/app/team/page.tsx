'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Plus, Trash2, ArrowLeft, Crown, Edit3, Eye,
  Shield, Mail, ChevronDown, X, Check, AlertCircle,
  UserCheck, UserX, MoreHorizontal, RefreshCw,
} from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { TeamMember } from '@/types'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// ── Role config ───────────────────────────────────────────────────────────────

const ROLES: Record<TeamMember['role'], { label:string; color:string; desc:string; Icon: any }> = {
  admin:  { label:'Admin',      color:'#1B4FD8', desc:'Accès complet, gestion des membres et paramètres', Icon:Crown  },
  editor: { label:'Rédacteur',  color:'#059669', desc:'Création et édition de documents',                  Icon:Edit3  },
  viewer: { label:'Lecteur',    color:'#D97706', desc:'Consultation de documents uniquement',               Icon:Eye    },
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  .team-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }

  /* Topbar */
  .team-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .team-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .team-back:hover { color:var(--text); }
  .team-sep { font-size:14px; color:var(--border2); }
  .team-page-title { font-size:14px; font-weight:700; color:var(--text); }

  /* Layout */
  .team-body { max-width:1100px; margin:0 auto; padding:24px 20px 48px; }
  .team-layout { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }

  /* Page header */
  .team-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
  .team-h1  { font-size:18px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .team-sub { font-size:12px; color:var(--text4); margin:0; }

  /* Table */
  .team-table { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
  .team-th { display:grid; gap:10px; padding:7px 16px; background:var(--bg2); border-bottom:1px solid var(--border); align-items:center; }
  .team-th span { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text4); }
  .team-tr { display:grid; gap:10px; padding:10px 16px; border-bottom:1px solid var(--border); align-items:center; transition:background .1s; }
  .team-tr:last-child { border-bottom:none; }
  .team-tr:hover { background:var(--bg2); }
  .team-tr:hover .team-row-actions { opacity:1; }
  .team-row-actions { opacity:0; transition:opacity .15s; display:flex; gap:5px; }

  /* Avatar */
  .team-avatar { width:32px; height:32px; border-radius:50%; background:var(--bg3); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; border:1px solid var(--border); }
  .team-name-col { display:flex; align-items:center; gap:10px; min-width:0; }
  .team-name { font-size:13px; font-weight:600; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .team-email { font-size:11px; color:var(--text4); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:1px; }

  /* Role badge */
  .role-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:4px; font-size:11px; font-weight:600; }

  /* Role select */
  .role-select { padding:4px 8px; border-radius:5px; border:1px solid var(--border); background:var(--bg2); font-size:11px; font-weight:600; color:var(--text); cursor:pointer; outline:none; transition:border-color .12s; }
  .role-select:focus { border-color:var(--accent); }

  /* Status badge */
  .status-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600; }

  /* Action buttons */
  .act-btn { width:26px; height:26px; border-radius:5px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .12s; color:var(--text4); }
  .act-btn:hover { border-color:var(--border2); background:var(--bg3); color:var(--text); }
  .act-btn.danger:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }

  /* Right panel — Invite + Info */
  .team-panel { display:flex; flex-direction:column; gap:14px; }
  .panel-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
  .panel-head { padding:11px 14px; border-bottom:1px solid var(--border); background:var(--bg2); }
  .panel-head-title { font-size:12px; font-weight:600; color:var(--text); }
  .panel-body { padding:14px; }

  /* Form */
  .field { margin-bottom:12px; }
  .field label { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin-bottom:5px; }
  .field input, .field select {
    width:100%; padding:7px 10px; border-radius:6px;
    border:1px solid var(--border); background:var(--bg);
    font-size:12px; color:var(--text); outline:none;
    transition:border-color .15s; font-family:inherit;
  }
  .field input:focus, .field select:focus { border-color:var(--accent); }
  .field input::placeholder { color:var(--text4); }

  /* Role picker */
  .role-picker { display:flex; flex-direction:column; gap:5px; }
  .role-option { display:flex; align-items:flex-start; gap:8px; padding:8px 10px; border-radius:6px; border:1px solid var(--border); cursor:pointer; transition:all .12s; background:var(--bg); }
  .role-option:hover { border-color:var(--border2); background:var(--bg2); }
  .role-option.selected { border-color:var(--accent); background:var(--accentS); }
  .role-option-check { width:14px; height:14px; border-radius:50%; border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; transition:all .12s; }
  .role-option.selected .role-option-check { background:var(--accent); border-color:var(--accent); }

  /* Stats row */
  .team-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
  .team-stat { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:12px 14px; }
  .team-stat-val { font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); line-height:1; }
  .team-stat-label { font-size:11px; color:var(--text4); margin-top:3px; }

  /* Buttons */
  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-full { width:100%; justify-content:center; }
  .btn-ghost { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:6px; background:transparent; color:var(--text2); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; transition:all .12s; }
  .btn-ghost:hover { border-color:var(--border2); background:var(--bg3); }

  /* Empty */
  .team-empty { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:48px 24px; text-align:center; }
`

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const router = useRouter()
  const { members, addMember, removeMember, updateRole } = useTeam()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [role,     setRole]     = useState<TeamMember['role']>('editor')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [filter,   setFilter]   = useState<'all' | TeamMember['role']>('all')

  const filtered = members.filter(m => filter === 'all' || m.role === filter)

  const adminCount  = members.filter(m => m.role === 'admin').length
  const editorCount = members.filter(m => m.role === 'editor').length
  const viewerCount = members.filter(m => m.role === 'viewer').length

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setTimeout(() => {
      addMember(name.trim(), email.trim(), role)
      setName(''); setEmail(''); setRole('editor')
      setLoading(false); setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    }, 600)
  }

  const cols = '1fr 160px 100px 90px 80px'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="team-page">

        {/* Topbar */}
        <header className="team-top">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button className="team-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13}/> Tableau de bord
            </button>
            <span className="team-sep">/</span>
            <span className="team-page-title">Équipe</span>
          </div>
          <ThemeToggle/>
        </header>

        <div className="team-body">

          {/* Page header */}
          <div className="team-header">
            <div>
              <h1 className="team-h1">Gestion de l'équipe</h1>
              <p className="team-sub">{members.length} membre{members.length !== 1 ? 's' : ''} dans votre espace de travail</p>
            </div>
          </div>

          {/* Stats */}
          <div className="team-stats">
            {[
              { label:'Total membres', value:members.length, color:'var(--text)' },
              { label:'Admins',        value:adminCount,     color:'#1B4FD8'    },
              { label:'Rédacteurs',    value:editorCount,    color:'#059669'    },
            ].map(s => (
              <div key={s.label} className="team-stat">
                <div className="team-stat-val" style={{ color:s.color }}>{s.value}</div>
                <div className="team-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="team-layout">

            {/* Left: members table */}
            <div>
              {/* Filter tabs */}
              <div style={{ display:'flex', gap:2, marginBottom:12, borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
                {(['all','admin','editor','viewer'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding:'6px 14px', fontSize:12, fontWeight: filter === f ? 600 : 500,
                    color: filter === f ? 'var(--accent)' : 'var(--text4)',
                    background:'transparent', border:'none', cursor:'pointer',
                    borderBottom: filter === f ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom:-1,
                    transition:'color .12s, border-color .12s',
                  }}>
                    {f === 'all' ? 'Tous' : ROLES[f].label}
                    <span style={{ marginLeft:5, fontSize:10, fontWeight:700, padding:'1px 5px', borderRadius:3, background: filter === f ? 'var(--accentS)' : 'var(--bg3)', color: filter === f ? 'var(--accent)' : 'var(--text4)' }}>
                      {f === 'all' ? members.length : members.filter(m => m.role === f).length}
                    </span>
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="team-empty">
                  <Users size={26} color="var(--text4)" style={{ margin:'0 auto 10px' }}/>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>
                    {filter === 'all' ? 'Aucun membre' : `Aucun ${ROLES[filter].label.toLowerCase()}`}
                  </div>
                  <p style={{ fontSize:12, color:'var(--text4)', margin:0 }}>Invitez des membres via le formulaire.</p>
                </div>
              ) : (
                <div className="team-table">
                  <div className="team-th" style={{ gridTemplateColumns:cols }}>
                    <span>Membre</span>
                    <span>Email</span>
                    <span>Rôle</span>
                    <span>Statut</span>
                    <span></span>
                  </div>

                  {filtered.map((member, i) => {
                    const cfg = ROLES[member.role]
                    const isAdmin = member.role === 'admin'
                    return (
                      <div key={member.id} className="team-tr" style={{ gridTemplateColumns:cols }}>

                        {/* Name + avatar */}
                        <div className="team-name-col">
                          <div className="team-avatar">{member.avatar}</div>
                          <div style={{ minWidth:0 }}>
                            <div className="team-name">{member.name}</div>
                          </div>
                        </div>

                        {/* Email */}
                        <span style={{ fontSize:11, color:'var(--text4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {member.email}
                        </span>

                        {/* Role */}
                        <div>
                          {isAdmin ? (
                            <span className="role-badge" style={{ background:`${cfg.color}10`, color:cfg.color }}>
                              <cfg.Icon size={10}/> {cfg.label}
                            </span>
                          ) : (
                            <select
                              value={member.role}
                              className="role-select"
                              onChange={e => updateRole(member.id, e.target.value as TeamMember['role'])}
                              style={{ color:cfg.color, borderColor:`${cfg.color}30`, background:`${cfg.color}08` }}
                            >
                              <option value="editor">Rédacteur</option>
                              <option value="viewer">Lecteur</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </div>

                        {/* Status */}
                        <span className="status-badge" style={{ background:'rgba(5,150,105,.08)', color:'#059669' }}>
                          <div style={{ width:5, height:5, borderRadius:'50%', background:'#059669', flexShrink:0 }}/>
                          Actif
                        </span>

                        {/* Actions */}
                        <div className="team-row-actions" onClick={e => e.stopPropagation()}>
                          {!isAdmin && (
                            <button className="act-btn danger" title="Retirer"
                              onClick={() => { if (window.confirm(`Retirer ${member.name} de l'équipe ?`)) removeMember(member.id) }}>
                              <UserX size={11}/>
                            </button>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className="team-panel">

              {/* Invite form */}
              <div className="panel-block">
                <div className="panel-head" style={{ borderColor: success ? '#059669' : undefined }}>
                  <div className="panel-head-title">
                    {success
                      ? <span style={{ color:'#059669', display:'flex', alignItems:'center', gap:6 }}><Check size={12}/> Membre invité</span>
                      : 'Inviter un membre'
                    }
                  </div>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleInvite}>
                    <div className="field">
                      <label>Nom complet</label>
                      <input placeholder="Marie Dupont" value={name} onChange={e => setName(e.target.value)} required/>
                    </div>
                    <div className="field">
                      <label>Adresse e-mail</label>
                      <input type="email" placeholder="marie@entreprise.com" value={email} onChange={e => setEmail(e.target.value)} required/>
                    </div>
                    <div className="field">
                      <label>Rôle</label>
                      <div className="role-picker">
                        {(Object.entries(ROLES) as [TeamMember['role'], typeof ROLES[TeamMember['role']]][]).map(([r, cfg]) => (
                          <div key={r} className={`role-option${role === r ? ' selected' : ''}`} onClick={() => setRole(r)}>
                            <div className="role-option-check">
                              {role === r && <Check size={8} color="#fff" strokeWidth={3}/>}
                            </div>
                            <div>
                              <div style={{ fontSize:12, fontWeight:600, color: role === r ? 'var(--accent)' : 'var(--text)', display:'flex', alignItems:'center', gap:5 }}>
                                <cfg.Icon size={11} color={role === r ? 'var(--accent)' : cfg.color}/> {cfg.label}
                              </div>
                              <div style={{ fontSize:10, color:'var(--text4)', marginTop:1 }}>{cfg.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn-primary btn-full" disabled={loading} style={{ marginTop:4 }}>
                      {loading ? <RefreshCw size={12} style={{ animation:'spin 1s linear infinite' }}/> : <Plus size={12}/>}
                      {loading ? 'Invitation en cours…' : 'Inviter'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Role legend */}
              <div className="panel-block">
                <div className="panel-head">
                  <div className="panel-head-title">Niveaux d'accès</div>
                </div>
                <div className="panel-body" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {(Object.entries(ROLES) as [TeamMember['role'], typeof ROLES[TeamMember['role']]][]).map(([r, cfg]) => (
                    <div key={r} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <div style={{ width:28, height:28, borderRadius:6, background:`${cfg.color}10`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <cfg.Icon size={13} color={cfg.color}/>
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:1 }}>{cfg.label}</div>
                        <div style={{ fontSize:11, color:'var(--text4)' }}>{cfg.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="panel-block" style={{ borderColor:'rgba(220,38,38,.2)' }}>
                <div className="panel-head" style={{ background:'rgba(220,38,38,.04)', borderColor:'rgba(220,38,38,.15)' }}>
                  <div className="panel-head-title" style={{ color:'#DC2626' }}>Zone sensible</div>
                </div>
                <div className="panel-body">
                  <p style={{ fontSize:11, color:'var(--text4)', marginBottom:12 }}>
                    Retirer tous les membres non-admin de l'espace de travail. Cette action est irréversible.
                  </p>
                  <button
                    className="btn-ghost btn-full"
                    style={{ borderColor:'rgba(220,38,38,.25)', color:'#DC2626', fontSize:11 }}
                    onClick={() => {
                      if (window.confirm('Retirer tous les membres non-admin ?')) {
                        members.filter(m => m.role !== 'admin').forEach(m => removeMember(m.id))
                      }
                    }}
                  >
                    <UserX size={12}/> Retirer tous les non-admin
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  )
}