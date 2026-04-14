'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import logo from '../../app/icon.png'
import {
  Eye, EyeOff, ArrowRight, CheckCircle2,
  FileText, Download, Users, Shield, BarChart2,
} from 'lucide-react'
import { ThemeToggle }  from '@/components/ui/ThemeToggle'
import { Toast }        from '@/components/ui/Toast'
import { useToast }     from '@/hooks/useToast'
import { useProfile }   from '@/contexts/ProfileContext'
import { signIn }       from 'next-auth/react'

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  .login-page { min-height:100vh; display:grid; grid-template-columns:1fr 440px; background:var(--bg); font-family:var(--font-bricolage,sans-serif); font-size:13px; color:var(--text); }

  /* Left panel */
  .login-left { background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; overflow:hidden; }
  .login-left-head { height:52px; padding:0 32px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .login-left-body { flex:1; display:flex; flex-direction:column; justify-content:center; padding:48px 64px; }
  .login-left-foot { padding:20px 32px; border-top:1px solid var(--border); flex-shrink:0; }

  /* Right panel */
  .login-right { background:var(--bg2); display:flex; flex-direction:column; justify-content:center; padding:40px 44px; overflow-y:auto; }

  /* Form card */
  .login-card { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:28px; }
  .login-card-title { font-size:16px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 4px; }
  .login-card-sub   { font-size:12px; color:var(--text4); margin:0 0 22px; }

  /* Tabs */
  .login-tabs { display:flex; border:1px solid var(--border); border-radius:6px; background:var(--bg); padding:3px; gap:3px; margin-bottom:20px; }
  .login-tab  { flex:1; padding:6px; border-radius:4px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:transparent; color:var(--text4); transition:all .15s; }
  .login-tab.active { background:var(--surface); color:var(--text); box-shadow:0 1px 4px rgba(0,0,0,.1); }

  /* Fields */
  .lf { margin-bottom:12px; }
  .lf label { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin-bottom:4px; }
  .lf input { width:100%; padding:7px 10px; border-radius:6px; border:1px solid var(--border); background:var(--bg); font-size:12px; color:var(--text); outline:none; transition:border-color .15s,background .15s; font-family:inherit; height:32px; }
  .lf input:focus { border-color:var(--accent); background:var(--surface); }
  .lf input::placeholder { color:var(--text4); }
  .lf-pw { position:relative; }
  .lf-pw input { padding-right:34px; }
  .lf-pw-toggle { position:absolute; right:9px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--text4); display:flex; padding:0; }
  .lf-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

  /* Buttons */
  .btn-primary { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; padding:8px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; margin-top:4px; }
  .btn-primary:hover { opacity:.88; }
  .btn-demo { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; padding:7px; border-radius:6px; background:transparent; color:var(--text2); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; margin-top:8px; }
  .btn-demo:hover { border-color:var(--border2); background:var(--bg3); }

  /* Left panel content */
  .login-tagline { font-size:28px; font-weight:700; letter-spacing:-.03em; line-height:1.15; color:var(--text); margin-bottom:10px; }
  .login-tagline span { color:var(--accent); }
  .login-tagline-sub { font-size:14px; color:var(--text4); margin-bottom:36px; line-height:1.6; }

  .login-feat { display:flex; flex-direction:column; gap:10px; margin-bottom:40px; }
  .login-feat-item { display:flex; gap:12px; align-items:flex-start; }
  .login-feat-icon { width:30px; height:30px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .login-feat-title { font-size:13px; font-weight:600; color:var(--text); }
  .login-feat-sub   { font-size:11px; color:var(--text4); margin-top:1px; line-height:1.4; }

  /* Social proof */
  .login-proof { display:flex; align-items:center; gap:12px; }
  .login-proof-avatars { display:flex; }
  .login-proof-avatar { width:26px; height:26px; border-radius:50%; border:2px solid var(--surface); background:var(--accentS); display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:var(--accent); margin-left:-6px; }
  .login-proof-avatar:first-child { margin-left:0; }
  .login-proof-text { font-size:11px; color:var(--text4); }
  .login-proof-text strong { color:var(--text); }

  /* Footer */
  .login-legal { font-size:11px; color:var(--text4); line-height:1.5; }
  .login-legal a { color:var(--accent); cursor:pointer; text-decoration:none; }
  .login-legal a:hover { text-decoration:underline; }

  /* Divider */
  .login-divider { display:flex; align-items:center; gap:10px; margin:14px 0; }
  .login-divider-line { flex:1; height:1px; background:var(--border); }
  .login-divider-text { font-size:10px; color:var(--text4); font-weight:500; white-space:nowrap; }

  /* Switch link */
  .login-switch { text-align:center; font-size:11px; color:var(--text4); margin-top:14px; }
  .login-switch span { color:var(--accent); cursor:pointer; font-weight:600; }
  .login-switch span:hover { text-decoration:underline; }

  @media (max-width: 768px) {
    .login-page { grid-template-columns:1fr; }
    .login-left { display:none; }
    .login-right { padding:24px 20px; }
  }
`

// ── Feature list ──────────────────────────────────────────────────────────────

const FEATURES = [
  { Icon:FileText,  bg:'rgba(27,79,216,.1)',  color:'#1B4FD8', title:'6 types de documents',   sub:'Business Plan, Contrat OHADA, Audit, Devis…' },
  { Icon:Download,  bg:'rgba(5,150,105,.1)',  color:'#059669', title:'Export PDF & Word',       sub:'Haute résolution A4 en un clic' },
  { Icon:Shield,    bg:'rgba(124,58,237,.1)', color:'#7C3AED', title:'QR authenticité',         sub:'Chaque export est signé et vérifiable' },
  { Icon:BarChart2, bg:'rgba(217,119,6,.1)',  color:'#D97706', title:'IA rédactionnelle',        sub:'Introductions, reformulations automatiques' },
  { Icon:Users,     bg:'rgba(14,116,144,.1)', color:'#0E7490', title:'Collaboration équipe',    sub:'Rôles, annotations, revue partagée' },
]

// ── Login form ────────────────────────────────────────────────────────────────

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast, showToast } = useToast()
  const { updateProfile }    = useProfile()

  const [tab,       setTab]       = useState<'signin' | 'signup'>('signin')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)

  // Sign in
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  // Sign up
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [suEmail,   setSuEmail]   = useState('')
  const [company,   setCompany]   = useState('')
  const [suPw,      setSuPw]      = useState('')
  const redirectParam = params.get('redirect')
  const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : null

  useEffect(() => {
    if (params.get('demo') === '1') handleDemo()
  }, [])

  function handleDemo() {
    updateProfile({ name:'ACACIA CONSULTING', sector:'Conseil & Stratégie', color:'#1B4FD8', email:'contact@acacia.ci', city:'Douala, Cameroun', signer:'Directeur Général', tagline:'Votre croissance, notre expertise' })
    showToast('Mode démo activé', 'ok')
    setTimeout(() => router.push('/editor'), 600)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
  
    if (tab === 'signup') {
      // Inscription
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: suEmail,
          password: suPw,
          name: `${firstName} ${lastName}`.trim(),
          company,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Erreur lors de l\'inscription', 'err')
        setLoading(false)
        return
      }
      // Connexion automatique après inscription
      const result = await signIn('credentials', { email: suEmail, password: suPw, redirect: false })
      if (result?.error) { showToast('Erreur de connexion', 'err'); setLoading(false); return }
      showToast('Compte créé !', 'ok')
      router.push(safeRedirect || '/onboarding')
    } else {
      // Connexion
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { showToast('Email ou mot de passe incorrect', 'err'); setLoading(false); return }
      showToast('Connexion réussie', 'ok')
      router.push(safeRedirect || '/dashboard')
    }
    setLoading(false)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="login-page">

        {/* ── Left: value proposition ── */}
        <div className="login-left">
          <div className="login-left-head">
            <div style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer' }} onClick={() => router.push('/')}>
              <Image src={logo} alt="EETRA" width={26} height={26} style={{ borderRadius:6 }}/>
              <span style={{ fontSize:15, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)' }}>EETRA</span>
            </div>
            <ThemeToggle/>
          </div>

          <div className="login-left-body">
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:12 }}>
              Document Intelligence · Afrique de l'Ouest
            </div>
            <h1 className="login-tagline">
              Des documents<br/>
              <span>professionnels</span><br/>
              en quelques minutes.
            </h1>
            <p className="login-tagline-sub">
              Créez, personnalisez et exportez vos documents d'entreprise avec votre charte graphique — conforme au cadre OHADA.
            </p>

            <div className="login-feat">
              {FEATURES.map(({ Icon, bg, color, title, sub }) => (
                <div key={title} className="login-feat-item">
                  <div className="login-feat-icon" style={{ background:bg }}>
                    <Icon size={14} color={color}/>
                  </div>
                  <div>
                    <div className="login-feat-title">{title}</div>
                    <div className="login-feat-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="login-proof">
              <div className="login-proof-avatars">
                {['AC','BK','MN','OT'].map(s => (
                  <div key={s} className="login-proof-avatar">{s}</div>
                ))}
              </div>
              <div className="login-proof-text">
                <strong>+500 entreprises</strong> font confiance à EETRA
              </div>
            </div>
          </div>

          <div className="login-left-foot">
            <p className="login-legal">
              En continuant, vous acceptez nos <a onClick={() => router.push('/legal')}>Conditions d'utilisation</a> et notre <a onClick={() => router.push('/legal#privacy')}>Politique de confidentialité</a>.
              <br/>EETRA · Douala, Cameroun · <a href="https://eetra.buyticle.com" target="_blank" rel="noreferrer">eetra.buyticle.com</a>
            </p>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="login-right">
          <div className="login-card">
            <h2 className="login-card-title">
              {tab === 'signin' ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="login-card-sub">
              {tab === 'signin'
                ? 'Connectez-vous à votre espace EETRA.'
                : 'Rejoignez EETRA et créez votre premier document.'}
            </p>

            {/* Tabs */}
            <div className="login-tabs">
              <button className={`login-tab${tab === 'signin' ? ' active' : ''}`} onClick={() => setTab('signin')}>Connexion</button>
              <button className={`login-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => setTab('signup')}>Inscription</button>
            </div>

            <form onSubmit={submit}>
              {tab === 'signup' && (
                <div className="lf-grid">
                  <div className="lf">
                    <label>Prénom</label>
                    <input placeholder="Marie" value={firstName} onChange={e => setFirstName(e.target.value)} required/>
                  </div>
                  <div className="lf">
                    <label>Nom</label>
                    <input placeholder="Dupont" value={lastName} onChange={e => setLastName(e.target.value)} required/>
                  </div>
                </div>
              )}

              <div className="lf">
                <label>Adresse e-mail</label>
                <input
                  type="email"
                  placeholder="votre@entreprise.com"
                  value={tab === 'signin' ? email : suEmail}
                  onChange={e => tab === 'signin' ? setEmail(e.target.value) : setSuEmail(e.target.value)}
                  required
                />
              </div>

              {tab === 'signup' && (
                <div className="lf">
                  <label>Entreprise <span style={{ color:'var(--text4)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optionnel)</span></label>
                  <input placeholder="Nom de votre entreprise" value={company} onChange={e => setCompany(e.target.value)}/>
                </div>
              )}

              <div className="lf">
                <label>Mot de passe</label>
                <div className="lf-pw">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder={tab === 'signup' ? '8 caractères minimum' : '••••••••'}
                    value={tab === 'signin' ? password : suPw}
                    onChange={e => tab === 'signin' ? setPassword(e.target.value) : setSuPw(e.target.value)}
                    required
                  />
                  <button type="button" className="lf-pw-toggle" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={13}/> : <Eye size={13}/>}
                  </button>
                </div>
              </div>

              {tab === 'signin' && (
                <div style={{ textAlign:'right', marginBottom:10, marginTop:-6 }}>
                  <span style={{ fontSize:11, color:'var(--accent)', cursor:'pointer' }}>Mot de passe oublié ?</span>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:12, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }}/> En cours…</span>
                  : <>{tab === 'signin' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={13}/></>
                }
              </button>

              <div className="login-divider">
                <div className="login-divider-line"/>
                <span className="login-divider-text">ou</span>
                <div className="login-divider-line"/>
              </div>

              <button type="button" className="btn-demo" onClick={handleDemo}>
                Continuer avec le compte démo
              </button>
            </form>

            <p className="login-switch">
              {tab === 'signin'
                ? <>Pas encore de compte ? <span onClick={() => setTab('signup')}>Créer un compte</span></>
                : <>Déjà un compte ? <span onClick={() => setTab('signin')}>Se connecter</span></>
              }
            </p>
          </div>

          {/* Trust badges */}
          <div style={{ display:'flex', gap:12, marginTop:16, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { Icon:Shield,       label:'Données sécurisées' },
              { Icon:CheckCircle2, label:'Aucune CB requise'  },
              { Icon:Users,        label:'Plan gratuit inclus' },
            ].map(({ Icon, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'var(--text4)', fontWeight:500 }}>
                <Icon size={11} color="var(--text4)"/> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toast {...toast}/>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
        <div style={{ width:28, height:28, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginContent/>
    </Suspense>
  )
}