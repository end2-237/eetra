'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Settings, User, Bell, Shield, CreditCard, Palette, FileText,
  ArrowLeft, Check, Eye, EyeOff, Save, Trash2, Download, Globe,
  Zap, ChevronRight, ExternalLink
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePlan } from '@/contexts/PlanContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { PALETTE } from '@/lib/templates'

type Tab = 'profile' | 'notifications' | 'security' | 'plan' | 'appearance'

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: 'profile', icon: <User size={14} />, label: 'Profil & Entreprise' },
  { id: 'appearance', icon: <Palette size={14} />, label: 'Apparence' },
  { id: 'notifications', icon: <Bell size={14} />, label: 'Notifications' },
  { id: 'security', icon: <Shield size={14} />, label: 'Sécurité' },
  { id: 'plan', icon: <CreditCard size={14} />, label: 'Plan & Facturation' },
]

const SECTORS = ['', 'Technologie / SaaS', 'Finance & Investissement', 'Conseil & Stratégie', 'Industrie', 'Immobilier', 'Santé & Biotech', 'Commerce', 'BTP', 'Agriculture', 'Autre']
const LEGALS = ['', 'SA', 'SARL', 'SAS', 'GIE', 'ONG', 'EI', 'Autre']

export default function SettingsPage() {
  const router = useRouter()
  const { profile, updateProfile } = useProfile()
  const { notifications, clearAll, markAllAsRead } = useNotifications()
  const { plan, planId } = usePlan()
  const { toast, showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({
    exports: true, comments: true, team: true, updates: false, marketing: false,
  })
  const logoRef = useRef<HTMLInputElement>(null)

  const inputClass = "w-full rounded-xl px-3.5 py-2.5 text-[13px] border outline-none font-sans transition-all"
  const inputStyle = { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--accent)'
    e.target.style.background = 'var(--surface)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.background = 'var(--bg2)'
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = ev => updateProfile({ logoDataUrl: ev.target?.result as string })
    r.readAsDataURL(f)
  }

  const sectionTitle = (t: string) => (
    <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text4)' }}>{t}</div>
  )

  const labelStyle = { color: 'var(--text3)' }
  const lbl = "block text-[10px] font-bold uppercase tracking-widest mb-1.5"

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 h-14 border-b flex items-center justify-between px-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-[12px] cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text4)' }}>
            <ArrowLeft size={14} /> Tableau de bord
          </button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-2">
            <Settings size={15} color="var(--accent)" />
            <span className="text-[15px] font-black tracking-tight" style={{ color: 'var(--text)' }}>Paramètres</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex flex-1">
        {/* Sidebar tabs */}
        <div className="w-56 flex-shrink-0 border-r p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer border-none text-left w-full transition-all"
                style={activeTab === tab.id
                  ? { background: 'var(--accentS)', color: 'var(--accent)' }
                  : { background: 'transparent', color: 'var(--text3)' }
                }
                onMouseEnter={e => { if (activeTab !== tab.id) { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; } }}
                onMouseLeave={e => { if (activeTab !== tab.id) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; } }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[700px] mx-auto px-8 py-8">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-[22px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>Profil & Entreprise</h2>
                  <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Ces informations apparaissent sur tous vos documents.</p>
                </div>

                {/* Logo + Name */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Identité Visuelle')}
                  <div className="flex gap-6 items-start">
                    <div>
                      <div
                        onClick={() => logoRef.current?.click()}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all"
                        style={{ borderColor: 'var(--border2)', background: 'var(--bg2)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; }}
                      >
                        {profile.logoDataUrl
                          ? <img src={profile.logoDataUrl} alt="logo" className="w-full h-full object-contain p-2" />
                          : <div className="text-center p-2">
                              <FileText size={20} color="var(--text4)" style={{ margin: '0 auto 4px' }} />
                              <span className="text-[9px]" style={{ color: 'var(--text4)' }}>Logo</span>
                            </div>
                        }
                      </div>
                      <input type="file" ref={logoRef} accept="image/*" className="hidden" onChange={handleLogoChange} />
                      {profile.logoDataUrl && (
                        <button onClick={() => updateProfile({ logoDataUrl: null })} className="mt-2 text-[10px] cursor-pointer border-none bg-transparent block text-center w-full" style={{ color: 'var(--danger)' }}>
                          Retirer
                        </button>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-1 gap-3">
                      <div>
                        <label className={lbl} style={labelStyle}>Raison Sociale</label>
                        <input className={inputClass} style={inputStyle} placeholder="Ex : QUANTUM INDUSTRIES SAS"
                          value={profile.name} onChange={e => updateProfile({ name: e.target.value })}
                          onFocus={focusStyle} onBlur={blurStyle} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl} style={labelStyle}>Secteur</label>
                          <select className={inputClass} style={inputStyle} value={profile.sector}
                            onChange={e => updateProfile({ sector: e.target.value })} onFocus={focusStyle} onBlur={blurStyle}>
                            {SECTORS.map(s => <option key={s} value={s}>{s || 'Sélectionner...'}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl} style={labelStyle}>Forme Juridique</label>
                          <select className={inputClass} style={inputStyle} value={profile.legal}
                            onChange={e => updateProfile({ legal: e.target.value })} onFocus={focusStyle} onBlur={blurStyle}>
                            {LEGALS.map(l => <option key={l} value={l}>{l || 'Sélectionner...'}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Coordonnées')}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Adresse', key: 'address', ph: '12 rue de la Paix' },
                      { label: 'Ville', key: 'city', ph: "Abidjan, Côte d'Ivoire" },
                      { label: 'Email', key: 'email', ph: 'contact@entreprise.com' },
                      { label: 'Site Web', key: 'web', ph: 'www.entreprise.com' },
                      { label: 'RCCM / N° Fiscal', key: 'siret', ph: 'CI-ABJ-2024-B-0001' },
                      { label: 'Capital Social', key: 'capital', ph: '5 000 000 FCFA' },
                    ].map(({ label, key, ph }) => (
                      <div key={key}>
                        <label className={lbl} style={labelStyle}>{label}</label>
                        <input className={inputClass} style={inputStyle} placeholder={ph}
                          value={(profile as Record<string, string>)[key] || ''}
                          onChange={e => updateProfile({ [key]: e.target.value })}
                          onFocus={focusStyle} onBlur={blurStyle} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document options */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Options Document')}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={lbl} style={labelStyle}>Slogan / Tagline</label>
                      <input className={inputClass} style={inputStyle} placeholder="Votre devise corporate"
                        value={profile.tagline} onChange={e => updateProfile({ tagline: e.target.value })}
                        onFocus={focusStyle} onBlur={blurStyle} />
                    </div>
                    <div>
                      <label className={lbl} style={labelStyle}>Signataire par défaut</label>
                      <input className={inputClass} style={inputStyle} placeholder="Directeur Général"
                        value={profile.signer} onChange={e => updateProfile({ signer: e.target.value })}
                        onFocus={focusStyle} onBlur={blurStyle} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-[13px] font-bold mb-1" style={{ color: 'var(--text)' }}>Filigrane EETRA</div>
                      <p className="text-[11px]" style={{ color: 'var(--text3)' }}>Afficher "Généré par EETRA" en pied de page</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => updateProfile({ watermark: !profile.watermark })}
                        className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
                        style={profile.watermark ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : { background: 'transparent', borderColor: 'var(--border2)' }}>
                        {profile.watermark && <Check size={11} color="#fff" strokeWidth={3} />}
                      </div>
                    </label>
                  </div>
                </div>

                <Button variant="primary" size="md" onClick={() => showToast('Profil sauvegardé', 'ok')}>
                  <Save size={13} /> Enregistrer les modifications
                </Button>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-[22px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>Apparence</h2>
                  <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Personnalisez l'interface et la couleur corporate.</p>
                </div>

                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Thème Interface')}
                  <div className="flex gap-3">
                    {[{ id: 'light', label: 'Clair' }, { id: 'dark', label: 'Sombre' }].map(t => (
                      <div key={t.id} className="flex-1 rounded-xl border-2 p-4 cursor-pointer text-center"
                        style={{ borderColor: 'var(--border)' }}>
                        <div className="text-[13px] font-bold mb-1" style={{ color: 'var(--text)' }}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Basculement thème</span>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Couleur Corporate')}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {PALETTE.map(c => (
                      <button key={c} onClick={() => updateProfile({ color: c })}
                        className="w-10 h-10 rounded-xl border-2 cursor-pointer transition-all flex-shrink-0"
                        style={{ background: c, borderColor: profile.color === c ? 'var(--text)' : 'transparent', transform: profile.color === c ? 'scale(1.15)' : '' }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={profile.color} onChange={e => updateProfile({ color: e.target.value })}
                      className="w-10 h-10 rounded-xl border cursor-pointer p-1" style={{ borderColor: 'var(--border)' }} />
                    <span className="text-[13px]" style={{ color: 'var(--text3)' }}>Couleur personnalisée</span>
                    <span className="font-mono text-[12px]" style={{ color: 'var(--accent)' }}>{profile.color}</span>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[22px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>Notifications</h2>
                    <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Gérez vos préférences de notification.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>Tout marquer lu</Button>
                    <Button variant="danger" size="sm" onClick={clearAll}>Effacer tout</Button>
                  </div>
                </div>

                <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle && <div className="px-6 pt-5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text4)' }}>Préférences Email</div>}
                  <div className="p-6 pt-3">
                    {[
                      { key: 'exports', label: 'Exports de documents', desc: 'Recevoir une confirmation à chaque export PDF' },
                      { key: 'comments', label: 'Nouveaux commentaires', desc: 'Être notifié lors de nouvelles annotations' },
                      { key: 'team', label: 'Activité équipe', desc: 'Modifications et ajouts de membres' },
                      { key: 'updates', label: 'Mises à jour produit', desc: 'Nouvelles fonctionnalités et améliorations' },
                      { key: 'marketing', label: 'Communications marketing', desc: 'Conseils, tutoriels et promotions' },
                    ].map(pref => (
                      <div key={pref.key} className="flex items-center justify-between py-3.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <div>
                          <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{pref.label}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text4)' }}>{pref.desc}</div>
                        </div>
                        <div
                          onClick={() => setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key as keyof typeof notifPrefs] }))}
                          className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
                          style={notifPrefs[pref.key as keyof typeof notifPrefs]
                            ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                            : { background: 'transparent', borderColor: 'var(--border2)' }
                          }>
                          {notifPrefs[pref.key as keyof typeof notifPrefs] && <Check size={11} color="#fff" strokeWidth={3} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="primary" size="md" onClick={() => showToast('Préférences sauvegardées', 'ok')}>
                  <Save size={13} /> Enregistrer
                </Button>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-[22px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>Sécurité</h2>
                  <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Gérez votre mot de passe et la sécurité de votre compte.</p>
                </div>

                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Mot de Passe')}
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Mot de passe actuel', ph: '••••••••' },
                      { label: 'Nouveau mot de passe', ph: '8 caractères minimum' },
                      { label: 'Confirmer le nouveau', ph: 'Répétez le nouveau mot de passe' },
                    ].map(({ label, ph }) => (
                      <div key={label}>
                        <label className={lbl} style={labelStyle}>{label}</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} className={inputClass} style={{ ...inputStyle, paddingRight: 40 }} placeholder={ph}
                            onFocus={focusStyle} onBlur={blurStyle} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent"
                            style={{ color: 'var(--text4)' }}>
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" size="sm" style={{ marginTop: 16 }} onClick={() => showToast('Mot de passe mis à jour', 'ok')}>
                    Changer le mot de passe
                  </Button>
                </div>

                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Sessions Actives')}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg2)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accentS)' }}>
                      <Globe size={16} color="var(--accent)" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Session actuelle</div>
                      <div className="text-[11px]" style={{ color: 'var(--text4)' }}>Navigateur web · Abidjan, CI · En cours</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>Actif</span>
                  </div>
                </div>

                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Zone de Danger')}
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(220,38,38,.05)', border: '1px solid rgba(220,38,38,.2)' }}>
                    <div>
                      <div className="text-[13px] font-bold" style={{ color: '#DC2626' }}>Supprimer le compte</div>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text4)' }}>Action irréversible — toutes les données seront supprimées</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => window.confirm('Êtes-vous sûr ? Cette action est irréversible.')}>
                      <Trash2 size={12} /> Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PLAN TAB */}
            {activeTab === 'plan' && (
              <div className="flex flex-col gap-6" id="plan">
                <div>
                  <h2 className="text-[22px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>Plan & Facturation</h2>
                  <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Gérez votre abonnement et vos moyens de paiement.</p>
                </div>

                {/* Current plan */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Abonnement Actuel')}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[24px] font-black tracking-tight" style={{ color: 'var(--text)' }}>
                        Plan {plan.label}
                      </div>
                      <div className="text-[13px] mt-1" style={{ color: 'var(--text3)' }}>{plan.price}</div>
                    </div>
                    {planId === 'starter' ? (
                      <Button variant="primary" size="md">
                        <Zap size={13} /> Passer au Pro
                      </Button>
                    ) : (
                      <span className="text-[11px] px-3 py-1.5 rounded-full font-bold" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>
                        ✓ Actif
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Pages par document', value: plan.maxPagesPerDoc === Infinity ? 'Illimitées' : String(plan.maxPagesPerDoc) },
                      { label: 'Documents / mois', value: plan.maxDocsPerMonth === Infinity ? 'Illimités' : String(plan.maxDocsPerMonth) },
                      { label: 'IA rédactionnelle', value: plan.ai ? 'Inclus' : 'Non inclus' },
                      { label: 'Sans filigrane', value: plan.canRemoveWatermark ? 'Disponible' : 'Non disponible' },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--bg2)' }}>
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--text4)' }}>{label}</div>
                        <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment methods */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Moyens de Paiement Acceptés')}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Orange Money', flag: '🟠', desc: 'CI, SN, ML, BF, CM' },
                      { name: 'MTN Mobile Money', flag: '🟡', desc: 'CI, GH, UG, RW' },
                      { name: 'Wave', flag: '🔵', desc: 'CI, SN, ML, BF' },
                      { name: 'Virement Bancaire', flag: '🏦', desc: 'Zone UEMOA' },
                    ].map(pm => (
                      <div key={pm.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                        <span className="text-xl">{pm.flag}</span>
                        <div>
                          <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{pm.name}</div>
                          <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{pm.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] mt-4" style={{ color: 'var(--text4)' }}>
                    Pour toute demande de facturation ou de remboursement, contactez-nous à billing@eetra.app
                  </p>
                </div>

                {/* Invoice history */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {sectionTitle('Historique de Facturation')}
                  <div className="text-center py-6">
                    <Download size={28} style={{ color: 'var(--text4)', margin: '0 auto 8px' }} />
                    <p className="text-[12px]" style={{ color: 'var(--text4)' }}>Aucune facture disponible</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast {...toast} />
    </div>
  )
}
