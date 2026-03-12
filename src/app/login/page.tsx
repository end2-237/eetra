'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useProfile } from '@/contexts/ProfileContext'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast, showToast } = useToast()
  const { updateProfile } = useProfile()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  // Sign in fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Sign up fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [company, setCompany] = useState('')
  const [suPassword, setSuPassword] = useState('')

  useEffect(() => {
    if (params.get('demo') === '1') handleDemo()
  }, [])

  function handleDemo() {
    updateProfile({
      name: 'ACACIA CONSULTING',
      sector: 'Conseil & Stratégie',
      color: '#1B4FD8',
      email: 'contact@acacia.ci',
      city: 'Abidjan, Côte d\'Ivoire',
      signer: 'Directeur Général',
      tagline: 'Votre croissance, notre expertise',
    })
    showToast('Mode démo activé', 'ok')
    setTimeout(() => router.push('/editor'), 600)
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    showToast('Connexion en cours...', 'default')
    setTimeout(() => router.push('/onboarding'), 700)
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (company) updateProfile({ name: company })
    showToast('Compte créé avec succès !', 'ok')
    setTimeout(() => router.push('/onboarding'), 700)
  }

  const inputClass = `w-full rounded-lg px-3.5 py-2.5 text-[13px] border outline-none transition-colors duration-150 font-sans`

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <div className="h-14 border-b flex items-center justify-between px-8 flex-shrink-0"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <FileText size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-7">
            <h1 className="text-[26px] font-black tracking-tight mb-1.5" style={{ color: 'var(--text)' }}>
              Bienvenue sur EETRA
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
              Plateforme de documents d&apos;entreprise
            </p>
          </div>

          <div className="rounded-2xl border p-7" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {/* Tabs */}
            <div className="flex rounded-lg border p-1 gap-1 mb-7"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              {(['signin', 'signup'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-md text-[13px] font-bold cursor-pointer border-none transition-all"
                  style={tab === t
                    ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }
                    : { background: 'transparent', color: 'var(--text3)' }
                  }>
                  {t === 'signin' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            {tab === 'signin' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>
                    Adresse e-mail
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="votre@entreprise.com" required
                    className={inputClass}
                    style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>
                    Mot de passe
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className={inputClass}
                    style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <Button type="submit" variant="primary" fullWidth>Se connecter</Button>
                <Button type="button" variant="ghost" fullWidth onClick={handleDemo}>
                  ▷ Continuer avec la démo
                </Button>
                <p className="text-center text-[11px] cursor-pointer" style={{ color: 'var(--text4)' }}
                  onClick={() => setTab('signup')}>
                  Pas encore de compte ?{' '}
                  <span style={{ color: 'var(--accent)' }}>Créer un compte</span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Prénom', val: firstName, set: setFirstName, ph: 'Marie' },
                    { label: 'Nom', val: lastName, set: setLastName, ph: 'Dupont' },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>{label}</label>
                      <input value={val} onChange={e => set(e.target.value)} placeholder={ph} required
                        className={inputClass}
                        style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>E-mail professionnel</label>
                  <input type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)}
                    placeholder="votre@entreprise.com" required className={inputClass}
                    style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>Entreprise</label>
                  <input value={company} onChange={e => setCompany(e.target.value)}
                    placeholder="Nom de votre entreprise" className={inputClass}
                    style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text3)' }}>Mot de passe</label>
                  <input type="password" value={suPassword} onChange={e => setSuPassword(e.target.value)}
                    placeholder="8 caractères minimum" required className={inputClass}
                    style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <Button type="submit" variant="primary" fullWidth>Créer mon compte</Button>
                <p className="text-center text-[11px] cursor-pointer" style={{ color: 'var(--text4)' }}
                  onClick={() => setTab('signin')}>
                  Déjà un compte ?{' '}
                  <span style={{ color: 'var(--accent)' }}>Se connecter</span>
                </p>
              </form>
            )}
          </div>

          <p className="text-center text-[11px] mt-4" style={{ color: 'var(--text4)' }}>
            En vous connectant, vous acceptez nos{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>CGU</span> et{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Politique de confidentialité</span>.
          </p>
        </div>
      </div>
      <Toast {...toast} />
    </div>
  )
}
