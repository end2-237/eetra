'use client'

import { useState } from 'react'
import { X, CreditCard, Check, Loader2, ExternalLink } from 'lucide-react'

const MOBILE_OPERATORS = [
  { id: 'orange', label: 'Orange Money',  emoji: '🟠', countries: ['CM', 'CI', 'SN', 'ML', 'BF'] },
  { id: 'mtn',    label: 'MTN MoMo',      emoji: '🟡', countries: ['CM', 'CI', 'GH', 'UG', 'RW'] },
  { id: 'wave',   label: 'Wave',           emoji: '🔵', countries: ['CI', 'SN', 'ML', 'BF']       },
]

const COUNTRY_OPTIONS = [
  { code: 'CM', label: 'Cameroun',            prefix: '+237' },
  { code: 'CI', label: "Côte d'Ivoire",       prefix: '+225' },
  { code: 'SN', label: 'Sénégal',             prefix: '+221' },
  { code: 'ML', label: 'Mali',                prefix: '+223' },
  { code: 'BF', label: 'Burkina Faso',        prefix: '+226' },
  { code: 'GH', label: 'Ghana',               prefix: '+233' },
  { code: 'UG', label: 'Ouganda',             prefix: '+256' },
]

interface Props {
  planId:  'pro' | 'business'
  billing: 'monthly' | 'annual'
  onClose: () => void
  onSuccess?: () => void
}

const PLAN_PRICES = {
  pro:      { monthly: 14_900,  annual: 142_800,  label: 'Plan Pro'      },
  business: { monthly: 39_900,  annual: 382_800,  label: 'Plan Business' },
}

export function MonetbilModal({ planId, billing, onClose, onSuccess }: Props) {
  const [country, setCountry] = useState('CM')
  const [phone,   setPhone]   = useState('')
  const [step,    setStep]    = useState<'form' | 'loading' | 'redirect' | 'demo'>('form')
  const [error,   setError]   = useState('')

  const plan   = PLAN_PRICES[planId]
  const amount = billing === 'annual' ? plan.annual : plan.monthly
  const prefix = COUNTRY_OPTIONS.find(c => c.code === country)?.prefix || '+237'
  const availableOps = MOBILE_OPERATORS.filter(op => op.countries.includes(country))

  async function handlePay() {
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setError('Veuillez saisir un numéro de téléphone valide.')
      return
    }
    setError('')
    setStep('loading')

    try {
      const res  = await fetch('/api/payments/monetbil/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId, billing, phone: `${prefix}${phone.replace(/\D/g, '')}`, country }),
      })
      const data = await res.json()

      if (data.demo) {
        setStep('demo')
        return
      }

      if (data.payment_url) {
        setStep('redirect')
        setTimeout(() => { window.location.href = data.payment_url }, 800)
      } else {
        setError(data.error || 'Erreur de paiement. Réessayez.')
        setStep('form')
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
      setStep('form')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9100,
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,.25)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={15} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Paiement Mobile Money</div>
              <div style={{ fontSize: 11, color: 'var(--text4)' }}>{plan.label} · {amount.toLocaleString('fr-FR')} FCFA/{billing === 'annual' ? 'an' : 'mois'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
            <X size={13} />
          </button>
        </div>

        <div style={{ padding: 22 }}>

          {/* FORM */}
          {step === 'form' && (
            <>
              {/* Country */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text4)', marginBottom: 5 }}>
                  Pays
                </label>
                <select value={country} onChange={e => { setCountry(e.target.value); setPhone('') }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: 13, color: 'var(--text)', outline: 'none' }}>
                  {COUNTRY_OPTIONS.map(c => (
                    <option key={c.code} value={c.code}>{c.label} ({c.prefix})</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text4)', marginBottom: 5 }}>
                  Numéro Mobile Money
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 13, color: 'var(--text3)', flexShrink: 0 }}>
                    {prefix}
                  </div>
                  <input
                    type="tel"
                    placeholder="6 XX XX XX XX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: 13, color: 'var(--text)', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              {/* Operators */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {availableOps.map(op => (
                  <div key={op.id} style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>
                    {op.emoji} {op.label}
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', color: '#DC2626', fontSize: 12, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <button onClick={handlePay}
                style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Payer {amount.toLocaleString('fr-FR')} FCFA →
              </button>

              <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text4)', marginTop: 10, lineHeight: 1.5 }}>
                Vous serez redirigé vers la page Monetbil sécurisée.<br/>
                Votre plan sera activé immédiatement après confirmation.
              </p>
            </>
          )}

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--accentS)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Initiation du paiement…</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* REDIRECT */}
          {step === 'redirect' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <ExternalLink size={32} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Redirection en cours…</div>
              <div style={{ fontSize: 12, color: 'var(--text4)' }}>Page Monetbil sécurisée</div>
            </div>
          )}

          {/* DEMO */}
          {step === 'demo' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(5,150,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={24} color="#059669" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Mode démo activé !</div>
              <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 20 }}>
                En production, vous seriez redirigé vers Monetbil.<br/>
                Configurez <code style={{ fontSize: 11, color: 'var(--accent)' }}>MONETBIL_SERVICE_KEY</code> dans .env.
              </div>
              <button onClick={() => { onSuccess?.(); onClose() }}
                style={{ padding: '10px 24px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                Activer le plan (démo)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
