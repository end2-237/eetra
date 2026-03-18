'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react'

const TOUR_KEY = 'eetra-tour-v1'

interface TourStep {
  id: string
  title: string
  description: string
  targetId?: string // element ID to highlight
  targetSelector?: string // CSS selector fallback
  position: 'center' | 'right' | 'left' | 'top' | 'bottom'
  shortcut?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Bienvenue sur EETRA',
    description: 'Créez des documents professionnels de grade exécutif en quelques minutes. Ce guide de 2 minutes vous montre l\'essentiel.',
    position: 'center',
  },
  {
    id: 'editor-tab',
    title: '✏️ Panneau Éditeur',
    description: 'Renseignez les métadonnées du document (titre, référence, destinataire) et ajoutez des blocs de contenu depuis la bibliothèque.',
    targetSelector: '[data-tour="editor-panel"]',
    position: 'right',
  },
  {
    id: 'blocks',
    title: '🧱 Bibliothèque de Blocs',
    description: '9 types de blocs disponibles : texte, tableau, KPIs, clause juridique, signature... Cliquez sur un type pour l\'ajouter à la page courante.',
    targetSelector: '[data-tour="block-library"]',
    position: 'right',
  },
  {
    id: 'ai-panel',
    title: '✨ IA Rédactionnelle',
    description: 'Générez automatiquement une introduction professionnelle en 3 paragraphes, ou reformulez le texte sélectionné en style formel d\'entreprise.',
    targetSelector: '[data-tour="ai-panel"]',
    position: 'right',
  },
  {
    id: 'templates',
    title: '📑 Smart Templates',
    description: '6 templates métier enrichis (Business Plan, Audit, Appel d\'Offre, Contrat...) remplis avec votre charte corporate en un clic.',
    targetSelector: '[data-tour="templates-nav"]',
    position: 'right',
  },
  {
    id: 'canvas',
    title: '📄 Aperçu A4 en temps réel',
    description: 'Le canvas affiche votre document tel qu\'il sera imprimé. Cliquez directement sur le texte pour l\'éditer. Glissez-déposez les blocs pour les réordonner.',
    targetSelector: '#canvas',
    position: 'left',
  },
  {
    id: 'pages-panel',
    title: '📚 Gestion des Pages',
    description: 'Ajoutez des pages, naviguez entre elles et supprimez-les depuis ce panneau. Le document se pagine automatiquement quand le contenu dépasse la hauteur A4.',
    targetSelector: '[data-tour="pages-panel"]',
    position: 'left',
  },
  {
    id: 'export',
    title: '⬇️ Export PDF',
    description: 'Exportez votre document en PDF haute qualité depuis la barre du haut ou la sidebar. Le navigateur imprime directement — activez "Sauvegarder en PDF" dans la boîte de dialogue.',
    targetSelector: '[data-tour="export-btn"]',
    position: 'bottom',
    shortcut: '→ Activez "Sauvegarder en PDF" dans la boîte de dialogue d\'impression',
  },
  {
    id: 'shortcuts',
    title: '⌨️ Raccourcis Clavier',
    description: 'Ctrl+Z / Ctrl+Y : Annuler/Rétablir\nCtrl+S : Sauvegarder\nLe document se sauvegarde aussi automatiquement toutes les 5 secondes.',
    position: 'center',
  },
  {
    id: 'done',
    title: '🎉 Vous êtes prêt !',
    description: 'Créez votre premier document professionnel. Commencez par le panneau Éditeur pour renseigner le titre, puis ajoutez des blocs ou appliquez un template.',
    position: 'center',
  },
]

export function GuidedTour() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = TOUR_STEPS[currentStep]

  const computeTooltipPosition = useCallback((rect: DOMRect | null, position: TourStep['position']) => {
    if (!rect || position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 400,
      }
    }

    const margin = 16
    const tooltipW = 340
    const tooltipH = 180

    switch (position) {
      case 'right':
        return {
          position: 'fixed' as const,
          top: Math.max(16, rect.top + rect.height / 2 - tooltipH / 2),
          left: rect.right + margin,
          maxWidth: tooltipW,
        }
      case 'left':
        return {
          position: 'fixed' as const,
          top: Math.max(16, rect.top + rect.height / 2 - tooltipH / 2),
          right: window.innerWidth - rect.left + margin,
          maxWidth: tooltipW,
        }
      case 'bottom':
        return {
          position: 'fixed' as const,
          top: rect.bottom + margin,
          left: Math.max(16, rect.left + rect.width / 2 - tooltipW / 2),
          maxWidth: tooltipW,
        }
      case 'top':
        return {
          position: 'fixed' as const,
          bottom: window.innerHeight - rect.top + margin,
          left: Math.max(16, rect.left + rect.width / 2 - tooltipW / 2),
          maxWidth: tooltipW,
        }
      default:
        return { position: 'fixed' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: tooltipW }
    }
  }, [])

  const updateTarget = useCallback(() => {
    const s = TOUR_STEPS[currentStep]
    let el: Element | null = null

    if (s.targetId) el = document.getElementById(s.targetId)
    if (!el && s.targetSelector) el = document.querySelector(s.targetSelector)

    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
      setTooltipStyle(computeTooltipPosition(rect, s.position))
    } else {
      setTargetRect(null)
      setTooltipStyle(computeTooltipPosition(null, 'center'))
    }
  }, [currentStep, computeTooltipPosition])

  useEffect(() => {
    if (!isVisible) return
    updateTarget()
    window.addEventListener('resize', updateTarget)
    return () => window.removeEventListener('resize', updateTarget)
  }, [isVisible, updateTarget])

  // Check if first visit
  useEffect(() => {
    try {
      const done = localStorage.getItem(TOUR_KEY)
      if (!done) {
        setTimeout(() => setIsVisible(true), 1200)
      }
    } catch {}
  }, [])

  const closeTour = () => {
    setIsVisible(false)
    try { localStorage.setItem(TOUR_KEY, '1') } catch {}
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      closeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => { setCurrentStep(0); setIsVisible(true) }}
        title="Lancer le guide interactif"
        className="pdf-hidden"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--accent)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,79,216,.4)',
          transition: 'transform .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Lightbulb size={18} color="#fff" />
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          pointerEvents: 'none',
        }}
      >
        {/* Dark overlay with spotlight cutout */}
        {targetRect ? (
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <mask id="spotlight">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - 6}
                  y={targetRect.top - 6}
                  width={targetRect.width + 12}
                  height={targetRect.height + 12}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#spotlight)" />
            {/* Highlight border */}
            <rect
              x={targetRect.left - 6}
              y={targetRect.top - 6}
              width={targetRect.width + 12}
              height={targetRect.height + 12}
              rx="8"
              fill="none"
              stroke="rgba(59,130,246,0.8)"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          ...tooltipStyle,
          zIndex: 9991,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          minWidth: 300,
          pointerEvents: 'all',
          animation: 'fadeUp .3s ease both',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                height: 4, flex: i === currentStep ? 2 : 1,
                borderRadius: 2, cursor: 'pointer',
                background: i === currentStep ? 'var(--accent)' : i < currentStep ? 'var(--accentS2)' : 'var(--border)',
                transition: 'all .25s',
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-.01em' }}>
          {step.title}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: step.shortcut ? 8 : 16 }}>
          {step.description}
        </p>
        {step.shortcut && (
          <div style={{ fontSize: 11, color: 'var(--text4)', background: 'var(--bg2)', borderRadius: 6, padding: '6px 10px', marginBottom: 16 }}>
            {step.shortcut}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button
            onClick={closeTour}
            style={{ fontSize: 11, color: 'var(--text4)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            Ignorer le guide
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
              >
                <ChevronLeft size={13} /> Précédent
              </button>
            )}
            <button
              onClick={nextStep}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
            >
              {currentStep < TOUR_STEPS.length - 1 ? (
                <>Suivant <ChevronRight size={13} /></>
              ) : (
                <>Commencer ✓</>
              )}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text4)', marginTop: 10 }}>
          Étape {currentStep + 1} sur {TOUR_STEPS.length}
        </div>
      </div>
    </>
  )
}
