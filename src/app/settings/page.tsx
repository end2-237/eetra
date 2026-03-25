'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Settings, User, Bell, Shield, CreditCard, Palette,
  ArrowLeft, Check, Eye, EyeOff, Save,
  Trash2, Download, Globe, Zap, Upload,
  CheckCircle2, AlertCircle, RefreshCw,
} from 'lucide-react'
import { useProfile }       from '@/contexts/ProfileContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePlan }          from '@/contexts/PlanContext'
import { ThemeToggle }      from '@/components/ui/ThemeToggle'
import { Toast }            from '@/components/ui/Toast'
import { useToast }         from '@/hooks/useToast'
import { MonetbilModal }    from '@/components/ui/MonetbilModal'
import { PALETTE }          from '@/lib/templates'
import { Suspense }         from 'react'

type Tab = 'profile' | 'appearance' | 'notifications' | 'security' | 'plan'

interface NotifPrefs {
  exports:   boolean
  comments:  boolean
  team:      boolean
  updates:   boolean
  marketing: boolean
}

const TABS: { id: Tab; Icon: React.ElementType; label: string }[] = [
  { id: 'profile',       Icon: User,       label: 'Profil & Entreprise' },
  { id: 'appearance',    Icon: Palette,    label: 'Apparence'           },
  { id: 'notifications', Icon: Bell,       label: 'Notifications'       },
  { id: 'security',      Icon: Shield,     label: 'Sécurité'            },
  { id: 'plan',          Icon: CreditCard, label: 'Plan & Facturation'  },
]

const SECTORS = ['','Technologie / SaaS','Finance & Investissement','Conseil & Stratégie','Industrie','Immobilier','Santé & Biotech','Commerce','BTP','Agriculture','Autre']
const LEGALS  = ['','SA','SARL','SAS','GIE','ONG','EI','Autre']

const CSS = `
  .set-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }
  .set-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .set-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .set-back:hover { color:var(--text); }
  .set-layout { display:flex; flex:1; min-height:0; }
  .set-sidebar { width:220px; flex-shrink:0; border-right:1px solid var(--border); background:var(--surface); padding:10px 8px; display:flex; flex-direction:column; gap:2px; }
  .set-nav-btn { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:500; color:var(--text3); border:none; background:transparent; width:100%; text-align:left; transition:background .12s,color .12s; }
  .set-nav-btn:hover { background:var(--bg3); color:var(--text); }
  .set-nav-btn.active { background:var(--accentS); color:var(--accent); font-weight:600; }
  .set-nav-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); padding:8px 10px 4px; }
  .set-content { flex:1; overflow-y:auto; }
  .set-inner { max-width:680px; margin:0 auto; padding:24px 24px 48px; }
  .set-section-h { font-size:16px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .set-section-sub { font-size:12px; color:var(--text4); margin:0 0 20px; }
  .set-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; margin-bottom:14px; }
  .set-block-head { padding:10px 14px; border-bottom:1px solid var(--border); background:var(--bg2); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); }
  .set-block-body { padding:16px 16px; }
  .set-field { margin-bottom:12px; }
  .set-field:last-child { margin-bottom:0; }
  .set-label { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin-bottom:5px; }
  .set-input, .set-select { width:100%; padding:7px 10px; border-radius:6px; border:1px solid var(--border); background:var(--bg); font-size:12px; color:var(--text); outline:none; transition:border-color .15s,background .15s; font-family:inherit; }
  .set-input:focus, .set-select:focus { border-color:var(--accent); background:var(--surface); }
  .set-input::placeholder { color:var(--text4); }
  .set-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .set-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); }
  .set-toggle-row:last-child { border-bottom:none; padding-bottom:0; }
  .set-checkbox { width:16px; height:16px; border-radius:4px; border:1.5px solid var(--border2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .12s; flex-shrink:0; }
  .set-checkbox.on { background:var(--accent); border-color:var(--accent); }
  .set-logo-box { width:80px; height:80px; border-radius:8px; border:1px dashed var(--border2); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; transition:border-color .15s,background .15s; background:var(--bg); flex-shrink:0; }
  .set-logo-box:hover { border-color:var(--accent); background:var(--accentS); }
  .set-palette { display:flex; gap:7px; flex-wrap:wrap; }
  .set-color-dot { width:28px; height:28px; border-radius:6px; cursor:pointer; transition:transform .15s,box-shadow .15s; border:2px solid transparent; flex-shrink:0; }
  .set-color-dot.selected { transform:scale(1.2); box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--text); }
  .set-stat-box { padding:10px 12px; border-radius:6px; background:var(--bg2); }
  .set-stat-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text4); margin-bottom:3px; }
  .set-stat-val { font-size:14px; font-weight:700; color:var(--text); }
  .set-pm { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:6px; background:var(--bg); border:1px solid var(--border); }
  .set-pw-wrap { position:relative; }
  .set-pw-wrap .set-input { padding-right:34px; }
  .set-pw-toggle { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--text4); padding:0; display:flex; }
  .set-session { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:6px; background:var(--bg2); }
  .set-danger { border:1px solid rgba(220,38,38,.25); border-radius:7px; background:rgba(220,38,38,.03); padding:14px 16px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:7px 15px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-ghost { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:transparent; color:var(--text2); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; transition:all .12s; }
  .btn-ghost:hover { border-color:var(--border2); background:var(--bg3); }
  .btn-danger { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:transparent; color:#DC2626; border:1px solid rgba(220,38,38,.3); font-size:12px; font-weight:600; cursor:pointer; transition:all .12s; }
  .btn-danger:hover { background:rgba(220,38,38,.08); }
  .btn-sm { padding:5px 11px; font-size:11px; }

  .plan-card { border-radius:10px; padding:16px; border:2px solid var(--border); cursor:pointer; transition:all .2s; margin-bottom:10px; }
  .plan-card:hover { border-color:var(--border2); }
  .plan-card.selected { border-color:var(--accent); background:var(--accentS); }

  @media (max-width: 767px) {
    .set-layout { flex-direction: column; }
    .set-sidebar { width: 100%; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .set-nav-btn { min-width: auto; white-space: nowrap; }
    .set-nav-label { display: none; }
    .set-grid-2 { grid-template-columns: 1fr; }
  }
`

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
      {on && <Check size={10} color="#fff" strokeWidth={3} />}
    </div>
  )
}

function SettingsContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { profile, updateProfile }              = useProfile()
  const { clearAll, markAllAsRead }             = useNotifications()
  const { plan, planId, refreshPlan, setPlanId } = usePlan()
  const { toast, showToast }                    = useToast()
  const logoRef                                 = useRef<HTMLInputElement>(null)

  const [activeTab,      setActiveTab]      = useState<Tab>('profile')
  const [showPw,         setShowPw]         = useState(false)
  const [notifPrefs,     setNotifPrefs]     = useState<NotifPrefs>({
    exports: true, comments: true, team: true, updates: false, marketing: false,
  })
  const [monetbilPlan,    setMonetbilPlan]    = useState<'pro' | 'business' | 'student' | null>(null)
  const [monetbilBilling, setMonetbilBilling] = useState<'monthly' | 'annual'>('monthly')

  // Handle return from Monetbil
  useEffect(() => {
    const payment = searchParams.get('payment')
    const ref     = searchParams.get('ref')

    if (payment === 'cancel') {
      showToast('Paiement annulé.', 'err')
      setActiveTab('plan')
      return
    }

    if (payment === 'demo' && ref) {
      setActiveTab('plan')
      ;(async () => {
        const res  = await fetch('/api/payments/monetbil/verify', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ paymentRef: ref }),
        })
        const data = await res.json()
        if (data.confirmed) { await refreshPlan(); showToast('Plan activé (démo)', 'ok') }
      })()
      return
    }

    if (payment === 'return' && ref) {
      setActiveTab('plan')
      const status        = searchParams.get('status') || ''
      const transactionId = searchParams.get('transaction_id') || ''

      ;(async () => {
        try {
          const res  = await fetch('/api/payments/monetbil/verify', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ paymentRef: ref, status, transactionId }),
          })
          const data = await res.json()

          if (data.confirmed) {
            await refreshPlan()
            showToast('🎉 Paiement confirmé ! Plan activé.', 'ok')
          } else if (data.status === 'failed') {
            showToast('Le paiement a échoué. Veuillez réessayer.', 'err')
          } else {
            setTimeout(async () => {
              try {
                const r2 = await fetch('/api/payments/monetbil/verify', {
                  method:  'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body:    JSON.stringify({ paymentRef: ref, status, transactionId }),
                })
                const d2 = await r2.json()
                if (d2.confirmed) {
                  await refreshPlan()
                  showToast('🎉 Plan activé !', 'ok')
                } else {
                  showToast('Vérification en cours… Actualisez dans quelques instants.', 'ok')
                }
              } catch {}
            }, 4000)
          }
        } catch {
          showToast('Erreur réseau. Rechargez la page.', 'err')
        }
      })()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = ev => updateProfile({ logoDataUrl: ev.target?.result as string })
    r.readAsDataURL(f)
  }

  const profileExtra = profile as unknown as Record<string, string>
  const setExtra = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateProfile({ [key]: e.target.value })

  const planColor = ({
    starter:  '#6B7280',
    pro:      '#1B4FD8',
    business: '#059669',
    student:  '#059669',
  } as Record<string, string>)[planId] ?? '#1B4FD8'

  const PLAN_DEFS = [
    {
      id: 'pro' as const,
      label: 'Pro',
      price: '14 900',
      color: '#1B4FD8',
      features: ['Documents illimités', 'IA rédactionnelle', 'Pages illimitées', 'Export PDF + Word', 'Sans filigrane'],
    },
    {
      id: 'student' as const,
      label: 'Tarif Étudiant',
      price: '2 000',
      color: '#059669',
      features: ['Accès complet', 'Support 24/7', 'Export PDF', '2 pages max / doc', 'Sans filigrane'],
    },
    {
      id: 'business' as const,
      label: 'Business',
      price: '39 900',
      color: '#059669',
      features: ["Tout le plan Pro", "Jusqu'à 10 membres", 'Espace partagé', 'Collaboration temps réel', 'Support prioritaire'],
    },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="set-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <header className="set-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="set-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13} /> Tableau de bord
            </button>
            <span style={{ fontSize: 14, color: 'var(--border2)' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Paramètres</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="set-layout" style={{ flex: 1 }}>

          {/* Sidebar */}
          <aside className="set-sidebar">
            <div className="set-nav-label">Paramètres</div>
            {TABS.map(({ id, Icon, label }) => (
              <button
                key={id}
                className={`set-nav-btn${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} color={activeTab === id ? 'var(--accent)' : 'var(--text4)'} />
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

                  <div className="set-block">
                    <SectionHead>Identité visuelle</SectionHead>
                    <div className="set-block-body">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                        <div style={{ flexShrink: 0 }}>
                          <div className="set-logo-box" onClick={() => logoRef.current?.click()}>
                            {profile.logoDataUrl
                              ? <img src={profile.logoDataUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                              : (
                                <>
                                  <Upload size={16} color="var(--text4)" style={{ marginBottom: 4 }} />
                                  <span style={{ fontSize: 9, color: 'var(--text4)', fontWeight: 600 }}>Logo</span>
                                </>
                              )
                            }
                          </div>
                          <input type="file" ref={logoRef} accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                          {profile.logoDataUrl && (
                            <button
                              style={{ fontSize: 10, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center', marginTop: 5 }}
                              onClick={() => updateProfile({ logoDataUrl: null })}
                            >
                              Retirer
                            </button>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Field label="Raison sociale">
                            <input
                              className="set-input"
                              placeholder="QUANTUM INDUSTRIES SAS"
                              value={profile.name}
                              onChange={e => updateProfile({ name: e.target.value })}
                            />
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

                  <div className="set-block">
                    <SectionHead>Coordonnées</SectionHead>
                    <div className="set-block-body">
                      <div className="set-grid-2">
                        {([
                          ['Adresse',        'address', 'Rue du Commerce, Douala'],
                          ['Ville',          'city',    'Douala, Cameroun'],
                          ['Email',          'email',   'contact@entreprise.com'],
                          ['Site web',       'web',     'eetra.buyticle.com'],
                          ['RCCM / N° Fiscal','siret',  'CM-DLA-2024-B-0001'],
                          ['Capital social', 'capital', '5 000 000 FCFA'],
                        ] as [string, string, string][]).map(([label, key, ph]) => (
                          <Field key={key} label={label}>
                            <input className="set-input" placeholder={ph} value={profileExtra[key] || ''} onChange={setExtra(key)} />
                          </Field>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="set-block">
                    <SectionHead>Options document</SectionHead>
                    <div className="set-block-body">
                      <div className="set-grid-2" style={{ marginBottom: 12 }}>
                        <Field label="Slogan / Tagline">
                          <input
                            className="set-input"
                            placeholder="Votre devise corporate"
                            value={profile.tagline || ''}
                            onChange={e => updateProfile({ tagline: e.target.value })}
                          />
                        </Field>
                        <Field label="Signataire par défaut">
                          <input
                            className="set-input"
                            placeholder="Directeur Général"
                            value={profile.signer || ''}
                            onChange={e => updateProfile({ signer: e.target.value })}
                          />
                        </Field>
                      </div>
                      <div className="set-toggle-row">
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Filigrane EETRA</div>
                          <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>Afficher "Généré par EETRA" en pied de page</div>
                        </div>
                        <Checkbox on={!!profile.watermark} onClick={() => updateProfile({ watermark: !profile.watermark })} />
                      </div>
                    </div>
                  </div>

                  <button className="btn-primary" onClick={() => showToast('Profil sauvegardé', 'ok')}>
                    <Save size={12} /> Enregistrer les modifications
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Mode clair / sombre</div>
                          <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>Basculer le thème de l'application</div>
                        </div>
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>

                  <div className="set-block">
                    <SectionHead>Couleur corporate</SectionHead>
                    <div className="set-block-body">
                      <div style={{ marginBottom: 14 }}>
                        <div className="set-palette">
                          {PALETTE.map(c => (
                            <div
                              key={c}
                              className={`set-color-dot${profile.color === c ? ' selected' : ''}`}
                              style={{ background: c }}
                              onClick={() => updateProfile({ color: c })}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="color"
                          value={profile.color || '#1B4FD8'}
                          onChange={e => updateProfile({ color: e.target.value })}
                          style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 3, background: 'var(--bg)' }}
                        />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Couleur personnalisée</div>
                          <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--accent)' }}>{profile.color || '#1B4FD8'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ══ NOTIFICATIONS ══ */}
              {activeTab === 'notifications' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h2 className="set-section-h">Notifications</h2>
                      <p className="set-section-sub" style={{ margin: 0 }}>Gérez vos préférences.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button className="btn-ghost btn-sm" onClick={markAllAsRead}>Tout marquer lu</button>
                      <button className="btn-danger btn-sm" onClick={clearAll}>Effacer tout</button>
                    </div>
                  </div>

                  <div className="set-block">
                    <SectionHead>Préférences e-mail</SectionHead>
                    <div className="set-block-body">
                      {([
                        ['exports',   'Exports de documents',      'Confirmation à chaque export PDF ou Word'],
                        ['comments',  'Nouveaux commentaires',      'Notification lors de nouvelles annotations'],
                        ['team',      'Activité équipe',            'Modifications et ajouts de membres'],
                        ['updates',   'Mises à jour produit',       'Nouvelles fonctionnalités'],
                        ['marketing', 'Communications marketing',   'Conseils, tutoriels et promotions'],
                      ] as [keyof NotifPrefs, string, string][]).map(([key, label, desc]) => (
                        <div key={key} className="set-toggle-row">
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                            <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>{desc}</div>
                          </div>
                          <Checkbox on={notifPrefs[key]} onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="btn-primary" onClick={() => showToast('Préférences sauvegardées', 'ok')}>
                    <Save size={12} /> Enregistrer
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
                                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            )}
                          </div>
                        </Field>
                      ))}
                      <button
                        className="btn-primary btn-sm"
                        style={{ marginTop: 6 }}
                        onClick={() => showToast('Mot de passe mis à jour', 'ok')}
                      >
                        Changer le mot de passe
                      </button>
                    </div>
                  </div>

                  <div className="set-block">
                    <SectionHead>Session active</SectionHead>
                    <div className="set-block-body">
                      <div className="set-session">
                        <div style={{ width: 34, height: 34, borderRadius: 7, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Globe size={15} color="var(--accent)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Session actuelle</div>
                          <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>Navigateur web · Douala, CM · En cours</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'rgba(5,150,105,.1)', color: '#059669' }}>
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ══ PLAN ══ */}
              {activeTab === 'plan' && (
                <div id="plan">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h2 className="set-section-h">Plan & Facturation</h2>
                      <p className="set-section-sub" style={{ margin: 0 }}>Gérez votre abonnement.</p>
                    </div>
                    <button className="btn-ghost btn-sm" onClick={() => { refreshPlan(); showToast('Plan actualisé', 'ok') }}>
                      <RefreshCw size={11} /> Actualiser
                    </button>
                  </div>

                  {/* Current plan badge */}
                  <div className="set-block" style={{ borderColor: planColor + '40' }}>
                    <div className="set-block-head" style={{ background: `${planColor}10`, color: planColor }}>
                      Plan actuel — {plan.label}
                    </div>
                    <div className="set-block-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${planColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {planId === 'starter'
                            ? <Zap size={18} color={planColor} />
                            : <CheckCircle2 size={18} color={planColor} />
                          }
                        </div>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Plan {plan.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--text4)' }}>{plan.price}</div>
                        </div>
                      </div>
                      <div className="set-grid-2">
                        {[
                          ['Pages / document', plan.maxPagesPerDoc === Infinity ? 'Illimitées' : String(plan.maxPagesPerDoc)],
                          ['Documents / mois',  plan.maxDocsPerMonth === Infinity ? 'Illimités' : String(plan.maxDocsPerMonth)],
                          ['IA rédactionnelle', plan.ai ? 'Activée' : 'Non incluse'],
                          ['Sans filigrane',    plan.canRemoveWatermark ? 'Disponible' : 'Non disponible'],
                        ].map(([label, value]) => (
                          <div key={label} className="set-stat-box">
                            <div className="set-stat-label">{label}</div>
                            <div className="set-stat-val">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Plan upgrade cards */}
                  <div style={{ marginBottom: 20 }}>
                    {PLAN_DEFS.map(p => (
                      <div
                        key={p.id}
                        className={`plan-card${monetbilPlan === p.id ? ' selected' : ''}`}
                        onClick={() => setMonetbilPlan(p.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{p.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text4)' }}>{p.price} FCFA/mois</div>
                          </div>
                          {monetbilPlan === p.id && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${p.color}18`, color: p.color }}>
                              Sélectionné
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                          {p.features.map(f => (
                            <span key={f} style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--text3)' }}>
                              <Check size={8} color={p.color} strokeWidth={3} /> {f}
                            </span>
                          ))}
                        </div>
                        <button
                          className="btn-primary"
                          onClick={e => { e.stopPropagation(); setMonetbilPlan(p.id) }}
                          style={{ fontSize: 11, padding: '5px 12px' }}
                        >
                          <CreditCard size={11} /> Payer via Mobile Money
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Moyens de paiement */}
                  <div className="set-block">
                    <SectionHead>Moyens de paiement acceptés</SectionHead>
                    <div className="set-block-body">
                      <div className="set-grid-2">
                        {([
                          ['Orange Money',     '🟠', 'CI, SN, ML, BF, CM'],
                          ['MTN Mobile Money', '🟡', 'CI, GH, UG, RW, CM'],
                          ['Wave',             '🔵', 'CI, SN, ML, BF'],
                          ['Virement UEMOA',   '🏦', 'Zone UEMOA / CEMAC'],
                        ] as [string, string, string][]).map(([name, flag, desc]) => (
                          <div key={name} className="set-pm">
                            <span style={{ fontSize: 20 }}>{flag}</span>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
                              <div style={{ fontSize: 10, color: 'var(--text4)' }}>{desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text4)', marginTop: 12, marginBottom: 0 }}>
                        Pour toute demande : <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>billing@eetra.buyticle.com</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Toast {...toast} />

      {monetbilPlan && (
        <MonetbilModal
          planId={monetbilPlan}
          billing={monetbilBilling}
          onClose={() => setMonetbilPlan(null)}
          onSuccess={async () => {
            await refreshPlan()
            setMonetbilPlan(null)
            showToast('Plan activé !', 'ok')
          }}
        />
      )}
    </>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <SettingsContent />
    </Suspense>
  )
}