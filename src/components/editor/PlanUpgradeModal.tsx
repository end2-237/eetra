'use client'

import { useState } from 'react'
import { usePlan, PLAN_CONFIGS, type PlanId } from '@/contexts/PlanContext'
import { MonetbilModal }                      from '@/components/ui/MonetbilModal'
import { Check, X, Zap, CreditCard }          from 'lucide-react'

const FEATURES: Record<PlanId, string[]> = {
  starter: [
    '5 documents / mois',
    '2 pages max / doc',
    '3 templates',
    'Export PDF',
    'Filigrane EETRA',
  ],
  pro: [
    'Documents illimités',
    'Pages illimitées',
    '6 templates',
    'IA rédactionnelle',
    'Sans filigrane',
    'Revue collaborative',
  ],
  business: [
    'Tout le plan Pro',
    "Jusqu'à 10 membres",
    'Espace partagé',
    'Gestion des rôles',
    'Analytics avancés',
    'Support prioritaire',
  ],
}

export function PlanUpgradeModal() {
  const { showUpgradeModal, upgradeReason, dismissUpgrade, planId, setPlanId, refreshPlan } = usePlan()
  const [pendingPlan, setPendingPlan] = useState<'pro' | 'business' | null>(null)
  const [billing, setBilling]         = useState<'monthly' | 'annual'>('monthly')

  if (!showUpgradeModal) return null

  const handleUpgrade = (id: PlanId) => {
    if (id === 'starter') { setPlanId('starter'); dismissUpgrade(); return }
    setPendingPlan(id as 'pro' | 'business')
  }

  return (
    <>
      {/* ── Main upgrade modal ── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9500,
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
        onClick={e => { if (e.target === e.currentTarget) dismissUpgrade() }}
      >
        <div style={{
          background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 680,
          border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,.3)',
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em' }}>
                  Passez au niveau supérieur
                </div>
                <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 2 }}>
                  {upgradeReason || 'Débloquez toutes les fonctionnalités EETRA'}
                </div>
              </div>
            </div>
            <button onClick={dismissUpgrade} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>

          {/* Billing toggle */}
          <div style={{ padding: '14px 28px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text4)' }}>Facturation :</span>
            <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
              {(['monthly', 'annual'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all .15s', background: billing === b ? 'var(--accent)' : 'transparent', color: billing === b ? '#fff' : 'var(--text4)' }}>
                  {b === 'monthly' ? 'Mensuel' : 'Annuel (−20%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: 24 }}>
            {(['starter', 'pro', 'business'] as PlanId[]).map(id => {
              const cfg      = PLAN_CONFIGS[id]
              const isCurrent = id === planId
              const isPro     = id === 'pro'
              const monthly   = id === 'pro' ? 14900 : id === 'business' ? 39900 : 0
              const price     = billing === 'annual' && monthly > 0 ? Math.round(monthly * 0.8) : monthly

              return (
                <div key={id} style={{
                  borderRadius: 14, padding: '20px 16px',
                  border: isPro ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isPro ? 'var(--accentS)' : 'var(--bg2)',
                  position: 'relative',
                }}>
                  {isPro && (
                    <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '.15em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Recommandé
                    </div>
                  )}

                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: cfg.color, marginBottom: 8 }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: price === 0 ? 22 : 18, fontWeight: 900, color: 'var(--text)', marginBottom: 2 }}>
                    {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
                  </div>
                  {price > 0 && (
                    <div style={{ fontSize: 10, color: 'var(--text4)', marginBottom: 14 }}>
                      / mois{billing === 'annual' ? ' (facturé annuellement)' : ''}
                    </div>
                  )}

                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                    {FEATURES[id].map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'var(--text3)' }}>
                        <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'rgba(5,150,105,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Check size={9} color="#059669" strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(id)}
                    disabled={isCurrent}
                    style={{
                      width: '100%', padding: '9px', borderRadius: 8, cursor: isCurrent ? 'default' : 'pointer',
                      fontSize: 11, fontWeight: 700, border: 'none', transition: 'all .15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      background: isCurrent ? 'var(--bg3)' : isPro ? 'var(--accent)' : 'var(--border)',
                      color:      isCurrent ? 'var(--text4)' : isPro ? '#fff' : 'var(--text2)',
                      opacity:    isCurrent ? 1 : undefined,
                    }}
                  >
                    {isCurrent ? 'Plan actuel' : (
                      id !== 'starter' ? (
                        <><CreditCard size={11} /> Passer au {cfg.label}</>
                      ) : 'Rétrograder'
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '0 24px 18px', textAlign: 'center', fontSize: 11, color: 'var(--text4)' }}>
            Paiement par Orange Money · MTN MoMo · Wave · Virement · En FCFA
          </div>
        </div>
      </div>

      {/* ── Monetbil payment flow ── */}
      {pendingPlan && (
        <MonetbilModal
          planId={pendingPlan}
          billing={billing}
          onClose={() => setPendingPlan(null)}
          onSuccess={async () => {
            await refreshPlan()
            dismissUpgrade()
          }}
        />
      )}
    </>
  )
}
