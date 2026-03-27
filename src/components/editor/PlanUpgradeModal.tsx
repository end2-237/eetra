'use client'

import { useState } from 'react'
import { usePlan, PLAN_CONFIGS, type PlanId } from '@/contexts/PlanContext'
import { MonetbilModal }                      from '@/components/ui/MonetbilModal'
import { Check, X, Zap, CreditCard, GraduationCap, Users }          from 'lucide-react'

const FEATURES: Record<PlanId, string[]> = {
  starter: [
    '5 documents / mois',
    '2 pages max / doc',
    'Templates intégrés inclus',
    'Export PDF',
    'Filigrane EETRA',
  ],
  student: [
    '20 documents / mois',
    '2 pages max / doc',
    'Templates intégrés inclus',
    'Modèles personnalisés',
    'Export PDF + Word',
    'Filigrane EETRA',
  ],
  pro: [
    'Documents illimités',
    'Pages illimitées',
    '6 templates avancés',
    'IA rédactionnelle',
    'Templates communauté',
    'Sans filigrane',
    'Export PDF + Word',
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
  const [pendingPlan, setPendingPlan] = useState<'pro' | 'business' | 'student' | null>(null)
  const [billing, setBilling]         = useState<'monthly' | 'annual'>('monthly')

  if (!showUpgradeModal) return null

  const handleUpgrade = (id: PlanId) => {
    if (id === 'starter') { setPlanId('starter'); dismissUpgrade(); return }
    setPendingPlan(id as 'pro' | 'business' | 'student')
  }

  const planOrder: PlanId[] = ['starter', 'student', 'pro', 'business']
  const planIcons: Record<PlanId, React.ReactNode> = {
    starter: <span style={{ fontSize: 14 }}>🆓</span>,
    student: <GraduationCap size={14} />,
    pro: <Zap size={14} />,
    business: <Users size={14} />,
  }
  const planMonthly: Record<PlanId, number | null> = {
    starter: 0,
    student: 2000,
    pro: 14900,
    business: 39900,
  }
  const planAnnual: Record<PlanId, number | null> = {
    starter: 0,
    student: 1700,
    pro: 11900,
    business: 31900,
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9500,
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto',
        }}
        onClick={e => { if (e.target === e.currentTarget) dismissUpgrade() }}
      >
        <div style={{
          background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 780,
          border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,.3)',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em' }}>
                  Passez au niveau supérieur
                </div>
                <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 2 }}>
                  {upgradeReason || 'Débloquez toutes les fonctionnalités EETRA'}
                </div>
              </div>
            </div>
            <button onClick={dismissUpgrade} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>

          {/* Billing toggle */}
          <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text4)' }}>Facturation :</span>
            <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
              {(['monthly', 'annual'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all .15s', background: billing === b ? 'var(--accent)' : 'transparent', color: billing === b ? '#fff' : 'var(--text4)' }}>
                  {b === 'monthly' ? 'Mensuel' : 'Annuel (−15%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Plans — 4 col scrollable */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '16px 24px', overflowX: 'auto' }}>
            {planOrder.map(id => {
              const cfg      = PLAN_CONFIGS[id]
              const isCurrent = id === planId
              const isPro     = id === 'pro'
              const isStudent = id === 'student'
              const monthly = planMonthly[id]!
              const price = billing === 'annual' ? planAnnual[id]! : monthly

              return (
                <div key={id} style={{
                  borderRadius: 14, padding: '16px 14px',
                  border: isPro ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isPro ? 'var(--accentS)' : isStudent ? 'rgba(5,150,105,.05)' : 'var(--bg2)',
                  position: 'relative', minWidth: 140,
                }}>
                  {isPro && (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontSize: 8, fontWeight: 800, letterSpacing: '.12em', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Recommandé
                    </div>
                  )}
                  {isStudent && (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#059669', color: '#fff', fontSize: 8, fontWeight: 800, letterSpacing: '.12em', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Étudiant
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: cfg.color, marginBottom: 8 }}>
                    {planIcons[id]} {cfg.label}
                  </div>

                  <div style={{ fontSize: price === 0 ? 20 : 16, fontWeight: 900, color: 'var(--text)', marginBottom: 2 }}>
                    {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
                  </div>
                  {price > 0 && (
                    <div style={{ fontSize: 9, color: 'var(--text4)', marginBottom: 10 }}>
                      / mois{billing === 'annual' ? ' (facturé/an)' : ''}
                    </div>
                  )}
                  {price === 0 && <div style={{ marginBottom: 10 }} />}

                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
                    {FEATURES[id].map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 10, color: 'var(--text3)' }}>
                        <div style={{ width: 13, height: 13, borderRadius: '50%', background: 'rgba(5,150,105,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Check size={8} color="#059669" strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(id)}
                    disabled={isCurrent}
                    style={{
                      width: '100%', padding: '8px', borderRadius: 8, cursor: isCurrent ? 'default' : 'pointer',
                      fontSize: 10, fontWeight: 700, border: 'none', transition: 'all .15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      background: isCurrent ? 'var(--bg3)' : isPro ? 'var(--accent)' : isStudent ? '#059669' : 'var(--border)',
                      color: isCurrent ? 'var(--text4)' : (isPro || isStudent) ? '#fff' : 'var(--text2)',
                    }}
                  >
                    {isCurrent ? 'Plan actuel' : (
                      id !== 'starter' ? (
                        <><CreditCard size={10} /> {id === 'student' ? 'Choisir' : `Passer au ${cfg.label}`}</>
                      ) : 'Rétrograder'
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '0 24px 16px', textAlign: 'center', fontSize: 10, color: 'var(--text4)' }}>
            Paiement par Orange Money · MTN MoMo · Wave · Virement · En FCFA
          </div>
        </div>
      </div>

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