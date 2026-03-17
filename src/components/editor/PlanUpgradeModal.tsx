'use client'

import { usePlan, PLAN_CONFIGS, PlanId } from '@/contexts/PlanContext'
import { Check, X, Zap } from 'lucide-react'

const FEATURES = {
  starter: ['5 documents / mois', '2 pages max / doc', '3 templates', 'Export PDF', 'Filigrane EETRA'],
  pro: ['Documents illimités', 'Pages illimitées', '6 templates', 'IA rédactionnelle', 'Sans filigrane', 'Revue collaborative'],
  business: ['Tout le plan Pro', "Jusqu'à 10 membres", 'Espace partagé', 'Gestion des rôles', 'Analytics avancés', 'Support prioritaire'],
}

export function PlanUpgradeModal() {
  const { showUpgradeModal, upgradeReason, dismissUpgrade, planId, setPlanId } = usePlan()
  if (!showUpgradeModal) return null

  const handleUpgrade = (id: PlanId) => {
    setPlanId(id)
    dismissUpgrade()
  }

  return (
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
        <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
          <button
            onClick={dismissUpgrade}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: 24 }}>
          {(['starter', 'pro', 'business'] as PlanId[]).map(id => {
            const cfg = PLAN_CONFIGS[id]
            const isCurrent = id === planId
            const isPro = id === 'pro'
            return (
              <div
                key={id}
                style={{
                  borderRadius: 14, padding: '20px 16px',
                  border: isPro ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isPro ? 'var(--accentS)' : 'var(--bg2)',
                  position: 'relative',
                }}
              >
                {isPro && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 800,
                    letterSpacing: '.15em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
                  }}>
                    Recommandé
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: cfg.color, marginBottom: 8 }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: '-.02em', marginBottom: 2 }}>
                  {cfg.price === 'Gratuit' ? 'Gratuit' : cfg.price.split('/')[0]}
                </div>
                {cfg.price !== 'Gratuit' && (
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginBottom: 14 }}>FCFA / mois</div>
                )}
                <div style={{ marginTop: cfg.price === 'Gratuit' ? 14 : 0, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {FEATURES[id].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)' }}>
                      <Check size={11} color="var(--success)" />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleUpgrade(id)}
                  style={{
                    width: '100%', padding: '9px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, border: 'none', transition: 'all .15s',
                    background: isCurrent ? 'var(--bg3)' : isPro ? 'var(--accent)' : 'var(--border)',
                    color: isCurrent ? 'var(--text4)' : isPro ? '#fff' : 'var(--text2)',
                  }}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Plan actuel' : id === 'business' ? 'Choisir Business' : `Passer en ${cfg.label}`}
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ padding: '0 24px 20px', textAlign: 'center', fontSize: 11, color: 'var(--text4)' }}>
          Paiement par Orange Money · MTN MoMo · Wave · Virement bancaire · En FCFA
        </div>
      </div>
    </div>
  )
}
