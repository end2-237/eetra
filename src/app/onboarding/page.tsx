'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '../../app/icon.png'
import {
  FileText, Check, Upload, ChevronRight, ArrowLeft,
  User, Building2, CheckCircle2, Zap, Globe,
  BarChart2, BookOpen, Shield, Clock, Download,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useProfile }  from '@/contexts/ProfileContext'
import { PALETTE }     from '@/lib/templates'

type AccountType = 'individual' | 'company' | null

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTORS = ['','Technologie / SaaS','Finance & Investissement','Conseil & Stratégie','Industrie','Immobilier','Santé & Biotech','Commerce','BTP','Agriculture','Autre']
const LEGALS  = ['','SA','SARL','SAS','GIE','ONG','EI','Autre']
const STEPS   = [{ id:1, label:'Compte' }, { id:2, label:'Profil' }, { id:3, label:'Éditeur' }]

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  html, body { overflow:hidden; }
  .ob-page { height:100vh; display:flex; flex-direction:column; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); overflow:hidden; }

  /* Topbar */
  .ob-top { height:52px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .ob-skip { font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:4px; }
  .ob-skip:hover { color:var(--text); }

  /* Steps */
  .ob-steps { height:44px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; padding:0 20px; gap:0; }
  .ob-step-circle { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; flex-shrink:0; border:1.5px solid var(--border2); background:transparent; color:var(--text4); transition:all .15s; }
  .ob-step-circle.done   { background:var(--accent); border-color:var(--accent); color:#fff; }
  .ob-step-circle.active { border-color:var(--accent); color:var(--accent); }
  .ob-step-label { font-size:12px; font-weight:500; color:var(--text4); margin-left:6px; }
  .ob-step-label.active { color:var(--accent); font-weight:600; }
  .ob-step-label.done   { color:var(--text3); }
  .ob-step-line { width:36px; height:1px; background:var(--border); margin:0 8px; flex-shrink:0; }
  .ob-step-line.done { background:var(--accent); }

  /* Body: two columns */
  .ob-body { flex:1; overflow:hidden; display:grid; grid-template-columns:1fr 340px; }

  /* Form column */
  .ob-form-col { border-right:1px solid var(--border); display:flex; flex-direction:column; overflow:hidden; }
  .ob-form-head { padding:14px 20px; border-bottom:1px solid var(--border); flex-shrink:0; }
  .ob-form-title { font-size:15px; font-weight:700; color:var(--text); margin:0 0 2px; letter-spacing:-.01em; }
  .ob-form-sub   { font-size:11px; color:var(--text4); margin:0; }
  .ob-form-body  { flex:1; overflow-y:auto; padding:14px 20px; }
  .ob-form-footer { padding:11px 20px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; background:var(--surface); }

  /* Right panel */
  .ob-right-col { background:var(--bg2); display:flex; flex-direction:column; overflow:hidden; }
  .ob-right-head { padding:11px 16px; border-bottom:1px solid var(--border); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); flex-shrink:0; background:var(--surface); }
  .ob-right-body { flex:1; overflow-y:auto; padding:14px 14px; display:flex; flex-direction:column; gap:12px; }

  /* Account type */
  .ob-type-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:2px; }
  .ob-type-card { display:flex; flex-direction:column; gap:5px; padding:10px 11px; border-radius:6px; border:1.5px solid var(--border); background:var(--bg); cursor:pointer; transition:all .15s; text-align:left; }
  .ob-type-card:hover { border-color:var(--border2); background:var(--surface); }
  .ob-type-card.sel { border-color:var(--accent); background:var(--accentS); }
  .ob-type-title { font-size:12px; font-weight:700; color:var(--text); }
  .ob-type-card.sel .ob-type-title { color:var(--accent); }
  .ob-type-desc  { font-size:10px; color:var(--text4); line-height:1.4; }

  /* Fields */
  .ob-field { margin-bottom:9px; }
  .ob-label { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin-bottom:4px; }
  .ob-input, .ob-select { width:100%; padding:5px 9px; border-radius:6px; border:1px solid var(--border); background:var(--bg); font-size:12px; color:var(--text); outline:none; transition:border-color .15s,background .15s; font-family:inherit; height:28px; }
  .ob-input:focus, .ob-select:focus { border-color:var(--accent); background:var(--surface); }
  .ob-input::placeholder { color:var(--text4); }
  .ob-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:9px; }

  /* Logo upload */
  .ob-logo-box { width:56px; height:56px; border-radius:6px; border:1px dashed var(--border2); background:var(--bg); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; transition:all .15s; flex-shrink:0; }
  .ob-logo-box:hover { border-color:var(--accent); background:var(--accentS); }

  /* Color palette */
  .ob-palette { display:flex; gap:5px; flex-wrap:wrap; }
  .ob-dot { width:20px; height:20px; border-radius:5px; cursor:pointer; border:2px solid transparent; transition:transform .15s,box-shadow .15s; flex-shrink:0; }
  .ob-dot.sel { transform:scale(1.2); box-shadow:0 0 0 2px var(--surface), 0 0 0 3.5px var(--text); }
  .ob-dot:hover:not(.sel) { transform:scale(1.1); }

  /* Toggle */
  .ob-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:7px 0; }
  .ob-checkbox { width:14px; height:14px; border-radius:3px; border:1.5px solid var(--border2); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:all .12s; }
  .ob-checkbox.on { background:var(--accent); border-color:var(--accent); }

  /* Divider */
  .ob-divider { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin:10px 0 7px; padding-bottom:5px; border-bottom:1px solid var(--border); }

  /* Right panel blocks */
  .ob-panel-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
  .ob-panel-head { padding:8px 12px; border-bottom:1px solid var(--border); background:var(--bg2); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); }
  .ob-panel-body { padding:10px 12px; }
  .ob-check-item { display:flex; align-items:flex-start; gap:8px; padding:5px 0; border-bottom:1px solid var(--border); }
  .ob-check-item:last-child { border-bottom:none; }
  .ob-feat-item { display:flex; gap:9px; padding:6px 0; border-bottom:1px solid var(--border); align-items:flex-start; }
  .ob-feat-item:last-child { border-bottom:none; }
  .ob-feat-icon { width:24px; height:24px; border-radius:5px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ob-feat-title { font-size:11px; font-weight:600; color:var(--text); }
  .ob-feat-sub   { font-size:10px; color:var(--text4); margin-top:1px; line-height:1.35; }

  /* Buttons */
  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:7px 15px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-ghost { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:6px; background:transparent; color:var(--text3); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; transition:all .12s; }
  .btn-ghost:hover { border-color:var(--border2); color:var(--text); }
`

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router  = useRouter()
  const { profile, updateProfile } = useProfile()
  const logoRef = useRef<HTMLInputElement>(null)
  const [accountType, setAccountType] = useState<AccountType>(null)

  const profileExtra = profile as unknown as Record<string, string>

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = ev => updateProfile({ logoDataUrl: ev.target?.result as string })
    r.readAsDataURL(f)
  }

  // Dynamic checklist based on account type
  const checklist = accountType === 'individual'
    ? [
        'Raison sociale (votre nom complet)',
        'Email de contact',
        'Ville & pays',
        'Signataire par défaut',
      ]
    : accountType === 'company'
    ? [
        'Raison sociale officielle',
        'Forme juridique & secteur',
        'RCCM / N° Fiscal',
        'Capital social',
        'Coordonnées complètes',
        'Logo corporate',
      ]
    : [
        'Raison sociale',
        'Coordonnées',
        'Couleur corporate',
        'Logo (optionnel)',
      ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="ob-page">

        {/* Topbar */}
        <header className="ob-top">
          <div style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer' }} onClick={() => router.push('/')}>
            <Image src={logo} alt="EETRA" width={26} height={26} style={{ borderRadius:6 }}/>
            <span style={{ fontSize:15, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)' }}>EETRA</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <ThemeToggle/>
            <button className="ob-skip" onClick={() => router.push('/editor')}>
              Passer <ChevronRight size={13}/>
            </button>
          </div>
        </header>

        {/* Steps */}
        <div className="ob-steps">
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display:'flex', alignItems:'center' }}>
              <div className={`ob-step-circle${s.id < 2 ? ' done' : s.id === 2 ? ' active' : ''}`}>
                {s.id < 2 ? <Check size={9} strokeWidth={3}/> : s.id}
              </div>
              <span className={`ob-step-label${s.id < 2 ? ' done' : s.id === 2 ? ' active' : ''}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`ob-step-line${s.id < 2 ? ' done' : ''}`}/>}
            </div>
          ))}
          <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text4)' }}>
            Ces informations s'appliquent à tous vos documents
          </span>
        </div>

        {/* Body */}
        <div className="ob-body">

          {/* ── Form column ── */}
          <div className="ob-form-col">
            <div className="ob-form-head">
              <h1 className="ob-form-title">Configuration du profil</h1>
              <p className="ob-form-sub">Saisissez les informations qui apparaîtront sur vos documents.</p>
            </div>

            <div className="ob-form-body">

              {/* Account type */}
              <div className="ob-divider" style={{ marginTop:0 }}>Type de compte</div>
              <div className="ob-type-grid">
                <button className={`ob-type-card${accountType === 'individual' ? ' sel' : ''}`} onClick={() => setAccountType('individual')}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <User size={14} color={accountType === 'individual' ? 'var(--accent)' : 'var(--text4)'}/>
                    <span className="ob-type-title">Individuel</span>
                  </div>
                  <span className="ob-type-desc">Consultant, freelance, expert indépendant</span>
                </button>
                <button className={`ob-type-card${accountType === 'company' ? ' sel' : ''}`} onClick={() => setAccountType('company')}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <Building2 size={14} color={accountType === 'company' ? 'var(--accent)' : 'var(--text4)'}/>
                    <span className="ob-type-title">Entreprise</span>
                  </div>
                  <span className="ob-type-desc">PME, cabinet, organisation, startup</span>
                </button>
              </div>

              {/* Identity */}
              <div className="ob-divider">Identité visuelle</div>
              <div style={{ display:'flex', gap:10, alignItems:'flex-end', marginBottom:9 }}>
                <div style={{ flexShrink:0 }}>
                  <div className="ob-label">Logo</div>
                  <div className="ob-logo-box" onClick={() => logoRef.current?.click()}>
                    {profile.logoDataUrl
                      ? <img src={profile.logoDataUrl} alt="logo" style={{ width:'100%', height:'100%', objectFit:'contain', padding:4 }}/>
                      : <><Upload size={12} color="var(--text4)"/><span style={{ fontSize:8, color:'var(--text4)', marginTop:2 }}>PNG</span></>
                    }
                  </div>
                  <input type="file" ref={logoRef} accept="image/*" style={{ display:'none' }} onChange={handleLogo}/>
                  {profile.logoDataUrl && (
                    <button style={{ fontSize:9, color:'#DC2626', background:'none', border:'none', cursor:'pointer', marginTop:2 }} onClick={() => updateProfile({ logoDataUrl: null })}>Retirer</button>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="ob-field">
                    <label className="ob-label">
                      {accountType === 'individual' ? 'Nom complet *' : 'Raison sociale *'}
                    </label>
                    <input className="ob-input" placeholder={accountType === 'individual' ? 'Jean-Marie Kouassi' : 'QUANTUM INDUSTRIES SAS'} value={profile.name} onChange={e => updateProfile({ name: e.target.value })}/>
                  </div>
                </div>
              </div>

              {/* Sector + legal — only for company */}
              {accountType !== 'individual' && (
                <div className="ob-grid-2">
                  <div className="ob-field">
                    <label className="ob-label">Secteur</label>
                    <select className="ob-select" value={profile.sector || ''} onChange={e => updateProfile({ sector: e.target.value })}>
                      {SECTORS.map(s => <option key={s} value={s}>{s || 'Sélectionner…'}</option>)}
                    </select>
                  </div>
                  <div className="ob-field">
                    <label className="ob-label">Forme juridique</label>
                    <select className="ob-select" value={profile.legal || ''} onChange={e => updateProfile({ legal: e.target.value })}>
                      {LEGALS.map(l => <option key={l} value={l}>{l || 'Sélectionner…'}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Color */}
              <div className="ob-divider">Couleur corporate</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div className="ob-palette">
                  {PALETTE.map(c => (
                    <div key={c} className={`ob-dot${profile.color === c ? ' sel' : ''}`} style={{ background:c }} onClick={() => updateProfile({ color: c })}/>
                  ))}
                </div>
                <input type="color" value={profile.color || '#1B4FD8'} onChange={e => updateProfile({ color: e.target.value })}
                  style={{ width:24, height:24, borderRadius:5, border:'1px solid var(--border)', cursor:'pointer', padding:2, background:'var(--bg)', flexShrink:0 }}/>
                <span style={{ fontSize:10, fontFamily:'monospace', color:'var(--accent)' }}>{profile.color || '#1B4FD8'}</span>
              </div>

              {/* Coordinates */}
              <div className="ob-divider" style={{ marginTop:10 }}>Coordonnées</div>
              <div className="ob-grid-2">
                {([
                  ['Email',     'email',   'contact@entreprise.com'],
                  ['Ville',     'city',    'Douala, Cameroun'],
                  ['Site web',  'web',     'eetra.buyticle.com'],
                  ['Adresse',   'address', 'Rue du Commerce, Douala'],
                  ...(accountType !== 'individual' ? [
                    ['RCCM / N° Fiscal','siret','CM-DLA-2024-B-0001'] as [string,string,string],
                    ['Capital social',  'capital','5 000 000 FCFA']   as [string,string,string],
                  ] : []),
                ] as [string,string,string][]).map(([label, key, ph]) => (
                  <div key={key} className="ob-field">
                    <label className="ob-label">{label}</label>
                    <input className="ob-input" placeholder={ph} value={profileExtra[key] || ''} onChange={e => updateProfile({ [key]: e.target.value })}/>
                  </div>
                ))}
              </div>

              {/* Options */}
              <div className="ob-divider" style={{ marginTop:10 }}>Options document</div>
              <div className="ob-grid-2" style={{ marginBottom:6 }}>
                <div className="ob-field">
                  <label className="ob-label">{accountType === 'individual' ? 'Titre professionnel' : 'Slogan / Tagline'}</label>
                  <input className="ob-input" placeholder={accountType === 'individual' ? 'Consultant Senior' : 'Votre devise'} value={profile.tagline || ''} onChange={e => updateProfile({ tagline: e.target.value })}/>
                </div>
                <div className="ob-field">
                  <label className="ob-label">Signataire par défaut</label>
                  <input className="ob-input" placeholder={accountType === 'individual' ? 'Votre nom' : 'Directeur Général'} value={profile.signer || ''} onChange={e => updateProfile({ signer: e.target.value })}/>
                </div>
              </div>
              <div className="ob-toggle-row">
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>Filigrane EETRA</div>
                  <div style={{ fontSize:10, color:'var(--text4)' }}>Afficher "Généré par EETRA" en pied de page</div>
                </div>
                <div className={`ob-checkbox${profile.watermark ? ' on' : ''}`} onClick={() => updateProfile({ watermark: !profile.watermark })}>
                  {profile.watermark && <Check size={8} color="#fff" strokeWidth={3}/>}
                </div>
              </div>

            </div>

            <div className="ob-form-footer">
              <button className="btn-ghost" onClick={() => router.push('/login')}>
                <ArrowLeft size={12}/> Retour
              </button>
              <button className="btn-primary" onClick={() => router.push('/editor')}>
                Accéder à l'éditeur <ChevronRight size={13}/>
              </button>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="ob-right-col">
            <div className="ob-right-head">Guide de configuration</div>
            <div className="ob-right-body">

              {/* Checklist */}
              <div className="ob-panel-block">
                <div className="ob-panel-head">
                  {accountType === 'individual' ? 'Profil individuel' : accountType === 'company' ? 'Profil entreprise' : 'Informations requises'}
                </div>
                <div className="ob-panel-body">
                  {checklist.map((item, i) => (
                    <div key={i} className="ob-check-item">
                      <CheckCircle2 size={13} color="var(--accent)" style={{ flexShrink:0, marginTop:1 }}/>
                      <span style={{ fontSize:12, color:'var(--text3)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What you unlock */}
              <div className="ob-panel-block">
                <div className="ob-panel-head">Ce que vous débloquez</div>
                <div className="ob-panel-body">
                  {[
                    { Icon:BarChart2, color:'#1B4FD8', bg:'rgba(27,79,216,.1)',  title:'Documents pro A4',    sub:'Business Plan, Audit, Contrat OHADA…' },
                    { Icon:Download,  color:'#059669', bg:'rgba(5,150,105,.1)',  title:'Export PDF & Word',   sub:'Haute résolution, une page ou tout le doc' },
                    { Icon:Shield,    color:'#7C3AED', bg:'rgba(124,58,237,.1)', title:'QR authenticité',     sub:'Chaque document a un QR de vérification' },
                    { Icon:BookOpen,  color:'#D97706', bg:'rgba(217,119,6,.1)',  title:'Bibliothèque OHADA',  sub:'Guides juridiques & business inclus' },
                    { Icon:Clock,     color:'#0E7490', bg:'rgba(14,116,144,.1)', title:'Historique complet',  sub:'Tous vos exports archivés et traçables' },
                  ].map(({ Icon, color, bg, title, sub }) => (
                    <div key={title} className="ob-feat-item">
                      <div className="ob-feat-icon" style={{ background:bg }}>
                        <Icon size={12} color={color}/>
                      </div>
                      <div>
                        <div className="ob-feat-title">{title}</div>
                        <div className="ob-feat-sub">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{ fontSize:11, color:'var(--text4)', lineHeight:1.55, padding:'2px 2px' }}>
                Ces informations sont modifiables à tout moment dans les <span style={{ fontWeight:600, color:'var(--text3)' }}>Paramètres → Profil & Entreprise</span>. Elles n'apparaissent que sur vos documents.
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}