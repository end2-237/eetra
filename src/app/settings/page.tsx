'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings, User, Bell, Shield, CreditCard, Palette,
  FileText, ArrowLeft, Check, Eye, EyeOff, Save,
  Trash2, Download, Globe, Zap, Upload,
} from 'lucide-react'
import { useProfile }       from '@/contexts/ProfileContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePlan }          from '@/contexts/PlanContext'
import { ThemeToggle }      from '@/components/ui/ThemeToggle'
import { Toast }            from '@/components/ui/Toast'
import { useToast }         from '@/hooks/useToast'
import { PALETTE }          from '@/lib/templates'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'appearance' | 'notifications' | 'security' | 'plan'

interface NotifPrefs {
  exports:   boolean
  comments:  boolean
  team:      boolean
  updates:   boolean
  marketing: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; Icon: React.ElementType; label: string }[] = [
  { id: 'profile',       Icon: User,        label: 'Profil & Entreprise' },
  { id: 'appearance',    Icon: Palette,     label: 'Apparence'           },
  { id: 'notifications', Icon: Bell,        label: 'Notifications'       },
  { id: 'security',      Icon: Shield,      label: 'Sécurité'            },
  { id: 'plan',          Icon: CreditCard,  label: 'Plan & Facturation'  },
]

const SECTORS = ['','Technologie / SaaS','Finance & Investissement','Conseil & Stratégie','Industrie','Immobilier','Santé & Biotech','Commerce','BTP','Agriculture','Autre']
const LEGALS  = ['','SA','SARL','SAS','GIE','ONG','EI','Autre']

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  .set-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }

  /* Topbar */
  .set-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .set-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .set-back:hover { color:var(--text); }
  .set-sep { font-size:14px; color:var(--border2); }
  .set-page-title { font-size:14px; font-weight:700; color:var(--text); }

  /* Layout */
  .set-layout { display:flex; flex:1; min-height:0; }
  .set-sidebar { width:220px; flex-shrink:0; border-right:1px solid var(--border); background:var(--surface); padding:10px 8px; display:flex; flex-direction:column; gap:2px; }
  .set-nav-btn { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:500; color:var(--text3); border:none; background:transparent; width:100%; text-align:left; transition:background .12s,color .12s; }
  .set-nav-btn:hover { background:var(--bg3); color:var(--text); }
  .set-nav-btn.active { background:var(--accentS); color:var(--accent); font-weight:600; }
  .set-nav-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); padding:8px 10px 4px; }

  /* Content */
  .set-content { flex:1; overflow-y:auto; }
  .set-inner { max-width:680px; margin:0 auto; padding:24px 24px 48px; }

  /* Section heading */
  .set-section-h { font-size:16px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .set-section-sub { font-size:12px; color:var(--text4); margin:0 0 20px; }

  /* Blocks */
  .set-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; margin-bottom:14px; }
  .set-block-head { padding:10px 14px; border-bottom:1px solid var(--border); background:var(--bg2); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); }
  .set-block-body { padding:16px 16px; }

  /* Fields */
  .set-field { margin-bottom:12px; }
  .set-field:last-child { margin-bottom:0; }
  .set-label { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin-bottom:5px; }
  .set-input, .set-select, .set-textarea {
    width:100%; padding:7px 10px; border-radius:6px;
    border:1px solid var(--border); background:var(--bg);
    font-size:12px; color:var(--text); outline:none;
    transition:border-color .15s,background .15s; font-family:inherit;
  }
  .set-input:focus, .set-select:focus, .set-textarea:focus { border-color:var(--accent); background:var(--surface); }
  .set-input::placeholder { color:var(--text4); }
  .set-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .set-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }

  /* Toggle row */
  .set-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); }
  .set-toggle-row:last-child { border-bottom:none; padding-bottom:0; }
  .set-checkbox { width:16px; height:16px; border-radius:4px; border:1.5px solid var(--border2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .12s; flex-shrink:0; }
  .set-checkbox.on { background:var(--accent); border-color:var(--accent); }

  /* Logo upload */
  .set-logo-box { width:80px; height:80px; border-radius:8px; border:1px dashed var(--border2); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; transition:border-color .15s,background .15s; background:var(--bg); flex-shrink:0; }
  .set-logo-box:hover { border-color:var(--accent); background:var(--accentS); }

  /* Color palette */
  .set-palette { display:flex; gap:7px; flex-wrap:wrap; }
  .set-color-dot { width:28px; height:28px; border-radius:6px; cursor:pointer; transition:transform .15s,box-shadow .15s; border:2px solid transparent; flex-shrink:0; }
  .set-color-dot.selected { transform:scale(1.2); box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--text); }
  .set-color-dot:hover { transform:scale(1.1); }

  /* Stat boxes */
  .set-stat-box { padding:10px 12px; border-radius:6px; background:var(--bg2); }
  .set-stat-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text4); margin-bottom:3px; }
  .set-stat-val { font-size:14px; font-weight:700; color:var(--text); }

  /* Payment cards */
  .set-pm { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:6px; background:var(--bg); border:1px solid var(--border); }
  .set-pm-name { font-size:12px; font-weight:600; color:var(--text); }
  .set-pm-sub  { font-size:10px; color:var(--text4); margin-top:1px; }

  /* Danger zone */
  .set-danger { border:1px solid rgba(220,38,38,.25); border-radius:7px; background:rgba(220,38,38,.03); padding:14px 16px; display:flex; align-items:center; justify-content:space-between; gap:16px; }

  /* Session row */
  .set-session { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:6px; background:var(--bg2); }
  .set-session-icon { width:34px; height:34px; border-radius:7px; background:var(--accentS); display:flex; align-items:center; justify-content:center; flex-shrink:0; }

  /* Password field */
  .set-pw-wrap { position:relative; }
  .set-pw-wrap .set-input { padding-right:34px; }
  .set-pw-toggle { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--text4); padding:0; display:flex; }

  /* Buttons */
  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:7px 15px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-ghost { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:transparent; color:var(--text2); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; transition:all .12s; }
  .btn-ghost:hover { border-color:var(--border2); background:var(--bg3); }
  .btn-danger { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:transparent; color:#DC2626; border:1px solid rgba(220,38,38,.3); font-size:12px; font-weight:600; cursor:pointer; transition:all .12s; }
  .btn-danger:hover { background:rgba(220,38,38,.08); }
  .btn-sm { padding:5px 11px; font-size:11px; }
`

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHead({ children }: { children: React.ReactNode }) {
  return <div className="set-block-head">{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="set-field">
      <label className="set-label">{label}</label>
      {children}
    </div>
  )
}

function Checkbox({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div className={`set-checkbox${on ? ' on' : ''}`} onClick={onClick}>
      {on && <Check size={10} color="#fff" strokeWidth={3}/>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const { profile, updateProfile }    = useProfile()
  const { clearAll, markAllAsRead }   = useNotifications()
  const { plan, planId }              = usePlan()
  const { toast, showToast }          = useToast()
  const logoRef                       = useRef<HTMLInputElement>(null)

  const [activeTab,    setActiveTab]    = useState<Tab>('profile')
  const [showPw,       setShowPw]       = useState(false)
  const [notifPrefs,   setNotifPrefs]   = useState<NotifPrefs>({ exports:true, comments:true, team:true, updates:false, marketing:false })

  // ── Handlers ──

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = (ev) => updateProfile({ logoDataUrl: ev.target?.result as string })
    r.readAsDataURL(f)
  }

  const toggleNotif = (key: keyof NotifPrefs) =>
    setNotifPrefs(p => ({ ...p, [key]: !p[key] }))

  // Profile extra fields typed safely
  const profileExtra = profile as unknown as Record<string, string>
  const setExtra = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateProfile({ [key]: e.target.value })

  const planColor = ({ starter:'#6B7280', pro:'#1B4FD8', business:'#059669' } as Record<string, string>)[planId] ?? '#1B4FD8'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="set-page" style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        {/* Topbar */}
        <header className="set-top">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button className="set-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13}/> Tableau de bord
            </button>
            <span className="set-sep">/</span>
            <span className="set-page-title">Paramètres</span>
          </div>
          <ThemeToggle/>
        </header>

        {/* Body */}
        <div className="set-layout" style={{ flex:1 }}>

          {/* Sidebar */}
          <aside className="set-sidebar">
            <div className="set-nav-label">Paramètres</div>
            {TABS.map(({ id, Icon, label }) => (
              <button
                key={id}
                className={`set-nav-btn${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} color={activeTab === id ? 'var(--accent)' : 'var(--text4)'}/>
                {label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="set-content">
            <div className="set-inner">

              {/* ══ PROFILE ══ */}
              {activeTab === 'profile' && (
                <>
                  <h2 className="set-section-h">Profil & Entreprise</h2>
                  <p className="set-section-sub">Ces informations apparaissent sur tous vos documents.</p>

                  {/* Identité visuelle */}
                  <div className="set-block">
                    <SectionHead>Identité visuelle</SectionHead>
                    <div className="set-block-body">
                      <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                        {/* Logo */}
                        <div style={{ flexShrink:0 }}>
                          <div className="set-logo-box" onClick={() => logoRef.current?.click()}>
                            {profile.logoDataUrl
                              ? <img src={profile.logoDataUrl} alt="logo" style={{ width:'100%', height:'100%', objectFit:'contain', padding:4 }}/>
                              : <>
                                  <Upload size={16} color="var(--text4)" style={{ marginBottom:4 }}/>
                                  <span style={{ fontSize:9, color:'var(--text4)', fontWeight:600 }}>Logo</span>
                                </>
                            }
                          </div>
                          <input type="file" ref={logoRef} accept="image/*" style={{ display:'none' }} onChange={handleLogoChange}/>
                          {profile.logoDataUrl && (
                            <button style={{ fontSize:10, color:'#DC2626', background:'none', border:'none', cursor:'pointer', display:'block', width:'100%', textAlign:'center', marginTop:5 }}
                              onClick={() => updateProfile({ logoDataUrl: null })}>
                              Retirer
                            </button>
                          )}
                        </div>
                        {/* Fields */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <Field label="Raison sociale">
                            <input className="set-input" placeholder="QUANTUM INDUSTRIES SAS" value={profile.name} onChange={e => updateProfile({ name: e.target.value })}/>
                          </Field>
                          <div className="set-grid-2">
                            <Field label="Secteur">
                              <select className="set-select" value={profile.sector || ''} onChange={e => updateProfile({ sector: e.target.value })}>
                                {SECTORS.map(s => <option key={s} value={s}>{s || 'Sélectionner…'}</option>)}
                              </select>
                            </Field>
                            <Field label="Forme juridique">
                              <select className="set-select" value={profile.legal || ''} onChange={e => updateProfile({ legal: e.target.value })}>
                                {LEGALS.map(l => <option key={l} value={l}>{l || 'Sélectionner…'}</option>)}
                              </select>
                            </Field>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div className="set-block">
                    <SectionHead>Coordonnées</SectionHead>
                    <div className="set-block-body">
                      <div className="set-grid-2">
                        {([
                          ['Adresse',       'address', 'Rue du Commerce, Douala'],
                          ['Ville',         'city',    'Douala, Cameroun'],
                          ['Email',         'email',   'contact@entreprise.com'],
                          ['Site web',      'web',     'eetra.buyticle.com'],
                          ['RCCM / N° Fiscal','siret', 'CM-DLA-2024-B-0001'],
                          ['Capital social','capital', '5 000 000 FCFA'],
                        ] as [string,string,string][]).map(([label, key, ph]) => (
                          <Field key={key} label={label}>
                            <input className="set-input" placeholder={ph} value={profileExtra[key] || ''} onChange={setExtra(key)}/>
                          </Field>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Options document */}
                  <div className="set-block">
                    <SectionHead>Options document</SectionHead>
                    <div className="set-block-body">
                      <div className="set-grid-2" style={{ marginBottom:12 }}>
                        <Field label="Slogan / Tagline">
                          <input className="set-input" placeholder="Votre devise corporate" value={profile.tagline || ''} onChange={e => updateProfile({ tagline: e.target.value })}/>
                        </Field>
                        <Field label="Signataire par défaut">
                          <input className="set-input" placeholder="Directeur Général" value={profile.signer || ''} onChange={e => updateProfile({ signer: e.target.value })}/>
                        </Field>
                      </div>
                      <div className="set-toggle-row">
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Filigrane EETRA</div>
                          <div style={{ fontSize:11, color:'var(--text4)', marginTop:1 }}>Afficher "Généré par EETRA" en pied de page</div>
                        </div>
                        <Checkbox on={!!profile.watermark} onClick={() => updateProfile({ watermark: !profile.watermark })}/>
                      </div>
                    </div>
                  </div>

                  <button className="btn-primary" onClick={() => showToast('Profil sauvegardé', 'ok')}>
                    <Save size={12}/> Enregistrer les modifications
                  </button>
                </>
              )}

              {/* ══ APPEARANCE ══ */}
              {activeTab === 'appearance' && (
                <>
                  <h2 className="set-section-h">Apparence</h2>
                  <p className="set-section-sub">Personnalisez l'interface et la couleur corporate.</p>

                  <div className="set-block">
                    <SectionHead>Thème de l'interface</SectionHead>
                    <div className="set-block-body">
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Mode clair / sombre</div>
                          <div style={{ fontSize:11, color:'var(--text4)', marginTop:1 }}>Basculer le thème de l'application</div>
                        </div>
                        <ThemeToggle/>
                      </div>
                    </div>
                  </div>

                  <div className="set-block">
                    <SectionHead>Couleur corporate</SectionHead>
                    <div className="set-block-body">
                      <div style={{ marginBottom:14 }}>
                        <div style={{ fontSize:11, color:'var(--text4)', marginBottom:10 }}>Palette prédéfinie</div>
                        <div className="set-palette">
                          {PALETTE.map(c => (
                            <div key={c} className={`set-color-dot${profile.color === c ? ' selected' : ''}`}
                              style={{ background:c }}
                              onClick={() => updateProfile({ color: c })}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <input type="color" value={profile.color || '#1B4FD8'} onChange={e => updateProfile({ color: e.target.value })}
                          style={{ width:34, height:34, borderRadius:6, border:'1px solid var(--border)', cursor:'pointer', padding:3, background:'var(--bg)' }}/>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>Couleur personnalisée</div>
                          <div style={{ fontSize:11, fontFamily:'monospace', color:'var(--accent)' }}>{profile.color || '#1B4FD8'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ══ NOTIFICATIONS ══ */}
              {activeTab === 'notifications' && (
                <>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
                    <div>
                      <h2 className="set-section-h">Notifications</h2>
                      <p className="set-section-sub" style={{ margin:0 }}>Gérez vos préférences de notification.</p>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn-ghost btn-sm" onClick={markAllAsRead}>Tout marquer lu</button>
                      <button className="btn-danger btn-sm" onClick={clearAll}>Effacer tout</button>
                    </div>
                  </div>

                  <div className="set-block">
                    <SectionHead>Préférences e-mail</SectionHead>
                    <div className="set-block-body">
                      {([
                        ['exports',   'Exports de documents',    'Confirmation à chaque export PDF ou Word'],
                        ['comments',  'Nouveaux commentaires',    'Notification lors de nouvelles annotations'],
                        ['team',      'Activité équipe',          'Modifications et ajouts de membres'],
                        ['updates',   'Mises à jour produit',     'Nouvelles fonctionnalités et améliorations'],
                        ['marketing', 'Communications marketing', 'Conseils, tutoriels et promotions'],
                      ] as [keyof NotifPrefs, string, string][]).map(([key, label, desc]) => (
                        <div key={key} className="set-toggle-row">
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</div>
                            <div style={{ fontSize:11, color:'var(--text4)', marginTop:1 }}>{desc}</div>
                          </div>
                          <Checkbox on={notifPrefs[key]} onClick={() => toggleNotif(key)}/>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="btn-primary" onClick={() => showToast('Préférences sauvegardées', 'ok')}>
                    <Save size={12}/> Enregistrer
                  </button>
                </>
              )}

              {/* ══ SECURITY ══ */}
              {activeTab === 'security' && (
                <>
                  <h2 className="set-section-h">Sécurité</h2>
                  <p className="set-section-sub">Gérez votre mot de passe et la sécurité du compte.</p>

                  <div className="set-block">
                    <SectionHead>Mot de passe</SectionHead>
                    <div className="set-block-body">
                      {(['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le nouveau'] as const).map((label, i) => (
                        <Field key={label} label={label}>
                          <div className="set-pw-wrap">
                            <input
                              type={showPw ? 'text' : 'password'}
                              className="set-input"
                              placeholder={i === 1 ? '8 caractères minimum' : '••••••••'}
                            />
                            {i === 0 && (
                              <button type="button" className="set-pw-toggle" onClick={() => setShowPw(v => !v)}>
                                {showPw ? <EyeOff size={13}/> : <Eye size={13}/>}
                              </button>
                            )}
                          </div>
                        </Field>
                      ))}
                      <button className="btn-primary btn-sm" style={{ marginTop:6 }} onClick={() => showToast('Mot de passe mis à jour', 'ok')}>
                        Changer le mot de passe
                      </button>
                    </div>
                  </div>

                  <div className="set-block">
                    <SectionHead>Session active</SectionHead>
                    <div className="set-block-body">
                      <div className="set-session">
                        <div className="set-session-icon">
                          <Globe size={15} color="var(--accent)"/>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>Session actuelle</div>
                          <div style={{ fontSize:11, color:'var(--text4)', marginTop:1 }}>Navigateur web · Douala, CM · En cours</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:4, background:'rgba(5,150,105,.1)', color:'#059669' }}>Actif</span>
                      </div>
                    </div>
                  </div>

                  <div className="set-block" style={{ borderColor:'rgba(220,38,38,.2)' }}>
                    <div className="set-block-head" style={{ background:'rgba(220,38,38,.04)', color:'#DC2626' }}>Zone sensible</div>
                    <div className="set-block-body">
                      <div className="set-danger">
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#DC2626' }}>Supprimer le compte</div>
                          <div style={{ fontSize:11, color:'var(--text4)', marginTop:1 }}>Action irréversible — toutes les données seront supprimées.</div>
                        </div>
                        <button className="btn-danger btn-sm" onClick={() => window.confirm('Êtes-vous sûr ? Cette action est irréversible.')}>
                          <Trash2 size={11}/> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ══ PLAN ══ */}
              {activeTab === 'plan' && (
                <div id="plan">
                  <h2 className="set-section-h">Plan & Facturation</h2>
                  <p className="set-section-sub">Gérez votre abonnement et vos moyens de paiement.</p>

                  {/* Current plan */}
                  <div className="set-block">
                    <SectionHead>Abonnement actuel</SectionHead>
                    <div className="set-block-body">
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                        <div>
                          <div style={{ fontSize:20, fontWeight:700, color:'var(--text)', letterSpacing:'-.02em' }}>Plan {plan.label}</div>
                          <div style={{ fontSize:12, color:'var(--text4)', marginTop:2 }}>{plan.price}</div>
                        </div>
                        {planId === 'starter'
                          ? <button className="btn-primary" onClick={() => {}}><Zap size={12}/> Passer au Pro</button>
                          : <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:4, background:'rgba(5,150,105,.1)', color:'#059669' }}>Actif</span>
                        }
                      </div>
                      <div className="set-grid-2">
                        {([
                          ['Pages / document',  plan.maxPagesPerDoc === Infinity ? 'Illimitées' : String(plan.maxPagesPerDoc)],
                          ['Documents / mois',  plan.maxDocsPerMonth === Infinity ? 'Illimités'  : String(plan.maxDocsPerMonth)],
                          ['IA rédactionnelle', plan.ai ? 'Inclus'       : 'Non inclus'],
                          ['Sans filigrane',    plan.canRemoveWatermark ? 'Disponible' : 'Non disponible'],
                        ] as [string,string][]).map(([label, value]) => (
                          <div key={label} className="set-stat-box">
                            <div className="set-stat-label">{label}</div>
                            <div className="set-stat-val">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment methods */}
                  <div className="set-block">
                    <SectionHead>Moyens de paiement acceptés</SectionHead>
                    <div className="set-block-body">
                      <div className="set-grid-2">
                        {([
                          ['Orange Money',      '🟠', 'CI, SN, ML, BF, CM'],
                          ['MTN Mobile Money',  '🟡', 'CI, GH, UG, RW, CM'],
                          ['Wave',              '🔵', 'CI, SN, ML, BF'],
                          ['Virement UEMOA',    '🏦', 'Zone UEMOA / CEMAC'],
                        ] as [string,string,string][]).map(([name, flag, desc]) => (
                          <div key={name} className="set-pm">
                            <span style={{ fontSize:20 }}>{flag}</span>
                            <div>
                              <div className="set-pm-name">{name}</div>
                              <div className="set-pm-sub">{desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize:11, color:'var(--text4)', marginTop:12 }}>
                        Pour toute demande : <span style={{ fontFamily:'monospace', color:'var(--accent)' }}>billing@eetra.buyticle.com</span>
                      </p>
                    </div>
                  </div>

                  {/* Invoice history */}
                  <div className="set-block">
                    <SectionHead>Historique de facturation</SectionHead>
                    <div className="set-block-body" style={{ textAlign:'center', padding:'32px 16px' }}>
                      <Download size={24} color="var(--text4)" style={{ margin:'0 auto 8px' }}/>
                      <p style={{ fontSize:12, color:'var(--text4)', margin:0 }}>Aucune facture disponible.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Toast {...toast}/>
    </>
  )
}