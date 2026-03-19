'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Shield, MapPin, MessageSquare, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useProfile } from '@/contexts/ProfileContext'
import { PALETTE } from '@/lib/templates'

const SECTORS = ['', 'Technologie / SaaS', 'Finance & Investissement', 'Conseil & Stratégie', 'Industrie', 'Immobilier', 'Santé & Biotech', 'Commerce', 'BTP', 'Agriculture', 'Autre']
const LEGALS  = ['', 'SA', 'SARL', 'SAS', 'GIE', 'ONG', 'EI', 'Autre']
const CONFIDENTIALITIES = ['CONFIDENTIEL', 'USAGE INTERNE', 'PUBLIC', 'STRICTEMENT CONFIDENTIEL']

function StepIndicator({ step }: { step: number }) {
  const steps = ['Compte', 'Profil', 'Éditeur']
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black border-2 transition-all`}
              style={i + 1 < step
                ? { background: 'var(--success)', borderColor: 'var(--success)', color: '#fff' }
                : i + 1 === step
                  ? { border: '2px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }
                  : { border: '2px solid var(--border2)', color: 'var(--text4)', background: 'transparent' }
              }>
              {i + 1 < step ? <Check size={13} /> : i + 1}
            </div>
            <span className="text-[12px] font-bold"
              style={{ color: i + 1 < step ? 'var(--success)' : i + 1 === step ? 'var(--accent)' : 'var(--text4)' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-12 h-0.5 mx-2"
              style={{ background: i + 1 < step ? 'var(--success)' : 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, updateProfile } = useProfile()
  const logoFileRef = useRef<HTMLInputElement>(null)

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = ev => updateProfile({ logoDataUrl: ev.target?.result as string })
    r.readAsDataURL(f)
  }

  const sectionHeader = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2 mb-5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accentS)', color: 'var(--accent)' }}>
        {icon}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
        {label}
      </span>
    </div>
  )

  const labelClass = "block text-[10px] font-bold uppercase tracking-widest mb-1.5"
  const inputStyle = { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }
  const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-[13px] border outline-none transition-colors duration-150 font-sans"
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--accent)'
    e.target.style.background = 'var(--surface)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.background = 'var(--bg2)'
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 h-14 border-b flex items-center justify-between px-8 flex-shrink-0"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <FileText size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => router.push('/editor')}>
            Passer cette étape →
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-6 py-12">
          <div className="text-center mb-9">
            <h1 className="text-[30px] font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>
              Configurez votre identité corporate
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
              Ces informations s&apos;appliquent à tous vos documents. Modifiables dans les paramètres.
            </p>
          </div>
          <StepIndicator step={2} />

          {/* 1. Visual identity */}
          <div className="rounded-2xl border p-7 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {sectionHeader(<Shield size={14} strokeWidth={2} />, 'Identité Visuelle')}
            <div className="flex gap-7 items-start">
              {/* Logo upload */}
              <div>
                <label className={labelClass} style={{ color: 'var(--text3)' }}>Logo</label>
                <div
                  onClick={() => logoFileRef.current?.click()}
                  className="w-[120px] h-[120px] rounded-xl border-2 border-dashed flex flex-col items-center justify-content cursor-pointer transition-all duration-150 overflow-hidden"
                  style={{ borderColor: 'var(--border2)', background: 'var(--bg2)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; }}
                >
                  {profile.logoDataUrl ? (
                    <img src={profile.logoDataUrl} alt="logo" className="w-full h-full object-contain p-3" />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                      <FileText size={22} color="var(--text4)" />
                      <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text4)' }}>
                        Cliquez<br />PNG / SVG
                      </span>
                    </div>
                  )}
                </div>
                <input type="file" ref={logoFileRef} accept="image/*" className="hidden" onChange={handleLogo} />
                {profile.logoDataUrl && (
                  <button onClick={() => updateProfile({ logoDataUrl: null })}
                    className="mt-2 text-[11px] cursor-pointer border-none bg-transparent"
                    style={{ color: 'var(--danger)' }}>
                    ✕ Retirer
                  </button>
                )}
              </div>

              {/* Name + sector/legal */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className={labelClass} style={{ color: 'var(--text3)' }}>Raison Sociale *</label>
                  <input className={inputClass} style={inputStyle} placeholder="Ex : QUANTUM INDUSTRIES SAS"
                    value={profile.name} onChange={e => updateProfile({ name: e.target.value })}
                    onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} style={{ color: 'var(--text3)' }}>Secteur</label>
                    <select className={inputClass} style={inputStyle}
                      value={profile.sector} onChange={e => updateProfile({ sector: e.target.value })}
                      onFocus={focusStyle} onBlur={blurStyle}>
                      {SECTORS.map(s => <option key={s} value={s}>{s || 'Sélectionner...'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: 'var(--text3)' }}>Forme Juridique</label>
                    <select className={inputClass} style={inputStyle}
                      value={profile.legal} onChange={e => updateProfile({ legal: e.target.value })}
                      onFocus={focusStyle} onBlur={blurStyle}>
                      {LEGALS.map(l => <option key={l} value={l}>{l || 'Sélectionner...'}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Color */}
          <div className="rounded-2xl border p-7 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {sectionHeader(<div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }} />, 'Couleur Corporate')}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {PALETTE.map(c => (
                <button key={c} onClick={() => updateProfile({ color: c })}
                  className="w-9 h-9 rounded-lg border-2 cursor-pointer transition-all duration-150 flex-shrink-0"
                  style={{
                    background: c,
                    borderColor: profile.color === c ? 'var(--text)' : 'transparent',
                    transform: profile.color === c ? 'scale(1.15)' : '',
                  }}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={profile.color}
                onChange={e => updateProfile({ color: e.target.value })}
                className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
                style={{ borderColor: 'var(--border)' }}
              />
              <span className="text-[13px]" style={{ color: 'var(--text3)' }}>Couleur personnalisée</span>
              <span className="font-mono text-[12px]" style={{ color: 'var(--accent)' }}>{profile.color}</span>
            </div>
          </div>

          {/* 3. Coordinates */}
          <div className="rounded-2xl border p-7 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {sectionHeader(<MapPin size={14} strokeWidth={2} />, 'Coordonnées')}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Adresse', key: 'address', ph: '12 rue de la Paix', type: 'text' },
                { label: 'Ville', key: 'city', ph: "Abidjan, Côte d'Ivoire", type: 'text' },
                { label: 'Email', key: 'email', ph: 'contact@entreprise.com', type: 'email' },
                { label: 'Site Web', key: 'web', ph: 'www.entreprise.com', type: 'text' },
                { label: 'N° RCCM / Fiscal', key: 'siret', ph: 'CI-ABJ-2024-B-0001', type: 'text' },
                { label: 'Capital Social (FCFA)', key: 'capital', ph: 'Ex : 5 000 000', type: 'text' },
              ].map(({ label, key, ph, type }) => (
                <div key={key}>
                  <label className={labelClass} style={{ color: 'var(--text3)' }}>{label}</label>
                  <input type={type} className={inputClass} style={inputStyle} placeholder={ph}
                    value={(profile as unknown as Record<string, string>)[key] || ''}
                    onChange={e => updateProfile({ [key]: e.target.value })}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Options */}
          <div className="rounded-2xl border p-7 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {sectionHeader(<MessageSquare size={14} strokeWidth={2} />, 'Options Document')}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelClass} style={{ color: 'var(--text3)' }}>Slogan / Tagline</label>
                <input className={inputClass} style={inputStyle} placeholder="Votre devise corporate"
                  value={profile.tagline} onChange={e => updateProfile({ tagline: e.target.value })}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--text3)' }}>Signataire par défaut</label>
                <input className={inputClass} style={inputStyle} placeholder="Directeur Général"
                  value={profile.signer} onChange={e => updateProfile({ signer: e.target.value })}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            {/* Watermark toggle */}
            <div className="rounded-xl p-4 flex items-start justify-between gap-5"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div>
                <div className="text-[13px] font-bold mb-1" style={{ color: 'var(--text)' }}>Filigrane EETRA</div>
                <p className="text-[11px] leading-relaxed max-w-[380px]" style={{ color: 'var(--text3)' }}>
                  Par défaut, un discret filigrane &quot;Généré par EETRA&quot; apparaît en pied de page. Désactivez-le pour des documents 100% à votre marque (Plan Pro requis).
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => updateProfile({ watermark: !profile.watermark })}
                    className="w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-all"
                    style={profile.watermark
                      ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                      : { background: 'transparent', borderColor: 'var(--border2)' }
                    }>
                    {profile.watermark && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>
                  <span className="text-[12px] font-500" style={{ color: 'var(--text2)', fontWeight: 500 }}>
                    Afficher le filigrane
                  </span>
                </label>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(217,119,6,.1)', color: '#D97706' }}>
                  Plan Pro requis pour désactiver
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => router.push('/login')}>← Retour</Button>
            <Button variant="primary" onClick={() => router.push('/editor')}>
              Accéder à l&apos;éditeur
              <span>→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
