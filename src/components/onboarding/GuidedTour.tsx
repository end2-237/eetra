'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  Compass,
  FileText,
  Wand2,
  Blocks,
  LayoutTemplate,
  Monitor,
  Wrench,
  Files,
  Download,
  Keyboard,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react'

const OPEN_EVENT = 'eetra-open-guide'
const TOUR_KEY_PREFIX = 'eetra-tour-v2'

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  targetId?: string
  targetSelector?: string
  position: 'center' | 'right' | 'left' | 'top' | 'bottom'
  shortcut?: string
}

const DESKTOP_STEPS: TourStep[] = [
  { id: 'welcome', title: 'Bienvenue', description: 'Voici le parcours complet: cadrer le document, structurer le contenu, verifier le rendu, puis exporter.', icon: <GraduationCap size={16} />, position: 'center' },
  { id: 'sidebar-nav', title: 'Navigation', description: 'Cette barre pilote tout: editeur, templates, mise en page, analyse, notes et orientation.', icon: <Compass size={16} />, targetSelector: '[data-tour="sidebar-nav"]', position: 'right' },
  { id: 'editor-panel', title: 'Parametres document', description: 'Commencez par le titre, le sous-titre, la reference et le destinataire.', icon: <FileText size={16} />, targetSelector: '[data-tour="editor-panel"]', position: 'right' },
  { id: 'quick-format', title: 'Formatage rapide', description: 'Clic droit, survol et glisser-deposer permettent d aller vite sans changer de panneau.', icon: <Wand2 size={16} />, targetSelector: '[data-tour="quick-format"]', position: 'right' },
  { id: 'blocks', title: 'Bibliotheque de blocs', description: 'Ajoutez sections, tableaux, graphiques, clauses et signatures selon votre besoin.', icon: <Blocks size={16} />, targetSelector: '[data-tour="block-library"]', position: 'right' },
  { id: 'templates', title: 'Templates', description: 'Appliquez une base metier en un clic, puis personnalisez votre contenu.', icon: <LayoutTemplate size={16} />, targetSelector: '[data-tour="templates-nav"]', position: 'right' },
  { id: 'canvas', title: 'Canvas A4', description: 'Le document s edite sur le rendu final. Vous voyez exactement ce qui sera exporte.', icon: <Monitor size={16} />, targetSelector: '#canvas', position: 'left' },
  { id: 'toolbar', title: 'Outils', description: 'Barre haute: annuler, retablir, zoom et statut de pages.', icon: <Wrench size={16} />, targetSelector: '[data-tour="document-toolbar"]', position: 'bottom' },
  { id: 'pages-panel', title: 'Navigation pages', description: 'Ajoutez des pages et naviguez rapidement dans les documents longs.', icon: <Files size={16} />, targetSelector: '[data-tour="pages-panel"]', position: 'left' },
  { id: 'export', title: 'Export PDF', description: 'Quand le document est pret, exportez en PDF depuis ce bouton.', icon: <Download size={16} />, targetSelector: '[data-tour="export-btn"]', position: 'top', shortcut: 'Conseil: dans la boite d impression, choisissez "Sauvegarder en PDF".' },
  { id: 'shortcuts', title: 'Raccourcis', description: 'Ctrl+Z / Ctrl+Y: annuler-retablir\nCtrl+S: sauvegarde manuelle\nLa sauvegarde auto tourne en continu.', icon: <Keyboard size={16} />, position: 'center' },
  { id: 'done', title: 'Pret a produire', description: 'Logique recommandee: cadrer, structurer, relire le rendu A4, puis exporter.', icon: <CheckCircle2 size={16} />, position: 'center' },
]

const MOBILE_STEPS: TourStep[] = [
  { id: 'mobile-welcome', title: 'Bienvenue mobile', description: 'Version mobile: vue document, edition par panneaux, puis export rapide.', icon: <Smartphone size={16} />, position: 'center' },
  { id: 'mobile-toolbar', title: 'Barre du haut', description: 'Vous trouvez ici retour, zoom et export PDF.', icon: <Wrench size={16} />, targetSelector: '[data-tour="mobile-toolbar"]', position: 'bottom' },
  { id: 'mobile-tabbar', title: 'Barre d outils mobile', description: 'Les onglets en bas ouvrent les panneaux: blocs, templates, mise en page, etc.', icon: <Compass size={16} />, targetSelector: '[data-tour="mobile-tabbar"]', position: 'top' },
  { id: 'mobile-editor-panel', title: 'Panneau d edition', description: 'Ouvrez un onglet en bas pour afficher ce panneau. Il reprend la meme logique que desktop.', icon: <FileText size={16} />, targetSelector: '[data-tour="mobile-tabbar"]', position: 'top' },
  { id: 'mobile-canvas', title: 'Vue document', description: 'Revenez sur "Doc" pour verifier le rendu reel de vos pages.', icon: <Monitor size={16} />, targetSelector: '[data-tour="mobile-canvas"]', position: 'center' },
  { id: 'mobile-pages', title: 'Ajouter des pages', description: 'Ajoutez des pages au fil de la redaction.', icon: <Files size={16} />, targetSelector: '[data-tour="mobile-pages-panel"]', position: 'top' },
  { id: 'mobile-export', title: 'Export mobile', description: 'Exportez en PDF depuis la barre du haut.', icon: <Download size={16} />, targetSelector: '[data-tour="mobile-export-btn"]', position: 'bottom' },
  { id: 'mobile-done', title: 'Termine', description: 'Le meme flux que desktop, optimise pour un usage tactile.', icon: <CheckCircle2 size={16} />, position: 'center' },
]

export function GuidedTour() {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [isMobile, setIsMobile] = useState(false)

  const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS
  const step = steps[currentStep] || steps[0]

  const getTourKey = useCallback(() => {
    const userId = session?.user?.id || 'guest'
    return `${TOUR_KEY_PREFIX}:${userId}:editor-first-visit`
  }, [session?.user?.id])

  const computeTooltipPosition = useCallback((rect: DOMRect | null, position: TourStep['position']) => {
    if (window.innerWidth < 1024) {
      return {
        position: 'fixed' as const,
        left: 10,
        right: 10,
        bottom: `calc(10px + env(safe-area-inset-bottom, 0px))`,
        width: 'auto',
        maxWidth: 'none',
      }
    }

    const margin = 16
    const maxWidth = Math.min(360, window.innerWidth - margin * 2)
    const tooltipW = maxWidth
    const tooltipH = 220
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

    if (!rect || position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: tooltipW,
        maxWidth,
      }
    }

    const centeredX = clamp(rect.left + rect.width / 2 - tooltipW / 2, margin, window.innerWidth - tooltipW - margin)
    const centeredY = clamp(rect.top + rect.height / 2 - tooltipH / 2, margin, window.innerHeight - tooltipH - margin)
    const canPlaceBottom = rect.bottom + margin + tooltipH <= window.innerHeight - margin
    const canPlaceTop = rect.top - margin - tooltipH >= margin

    if (position === 'bottom') {
      return {
        position: 'fixed' as const,
        top: canPlaceBottom ? rect.bottom + margin : clamp(rect.top - tooltipH - margin, margin, window.innerHeight - tooltipH - margin),
        left: centeredX,
        width: tooltipW,
        maxWidth,
      }
    }

    if (position === 'top') {
      return {
        position: 'fixed' as const,
        top: canPlaceTop ? rect.top - tooltipH - margin : clamp(rect.bottom + margin, margin, window.innerHeight - tooltipH - margin),
        left: centeredX,
        width: tooltipW,
        maxWidth,
      }
    }

    if (position === 'right') {
      const left = rect.right + margin
      const fallbackLeft = clamp(rect.left - tooltipW - margin, margin, window.innerWidth - tooltipW - margin)
      return {
        position: 'fixed' as const,
        top: centeredY,
        left: left + tooltipW <= window.innerWidth - margin ? left : fallbackLeft,
        width: tooltipW,
        maxWidth,
      }
    }

    if (position === 'left') {
      const left = rect.left - tooltipW - margin
      const fallbackLeft = clamp(rect.right + margin, margin, window.innerWidth - tooltipW - margin)
      return {
        position: 'fixed' as const,
        top: centeredY,
        left: left >= margin ? left : fallbackLeft,
        width: tooltipW,
        maxWidth,
      }
    }

    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: tooltipW,
      maxWidth,
    }
  }, [])

  const updateTarget = useCallback(() => {
    const s = steps[currentStep]
    if (!s) return

    let el: Element | null = null
    if (s.targetId) el = document.getElementById(s.targetId)
    if (!el && s.targetSelector) el = document.querySelector(s.targetSelector)

    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
      setTooltipStyle(computeTooltipPosition(rect, s.position))
      return
    }

    setTargetRect(null)
    setTooltipStyle(computeTooltipPosition(null, 'center'))
  }, [steps, currentStep, computeTooltipPosition])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isVisible) return
    updateTarget()
    window.addEventListener('resize', updateTarget)
    window.addEventListener('scroll', updateTarget, true)
    return () => {
      window.removeEventListener('resize', updateTarget)
      window.removeEventListener('scroll', updateTarget, true)
    }
  }, [isVisible, updateTarget])

  useEffect(() => {
    setCurrentStep(0)
  }, [isMobile])

  useEffect(() => {
    if (!session) return
    try {
      const done = localStorage.getItem(getTourKey())
      if (!done) {
        setTimeout(() => setIsVisible(true), 900)
      }
    } catch {}
  }, [session, getTourKey])

  useEffect(() => {
    const openGuide = () => {
      setCurrentStep(0)
      setIsVisible(true)
    }
    window.addEventListener(OPEN_EVENT, openGuide)
    return () => window.removeEventListener(OPEN_EVENT, openGuide)
  }, [])

  const closeTour = () => {
    setIsVisible(false)
    try {
      localStorage.setItem(getTourKey(), '1')
    } catch {}
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
    else closeTour()
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  if (!isVisible) return null

  const mobileTooltipStyles: React.CSSProperties = isMobile
    ? {
        maxHeight: '58dvh',
        overflowY: 'auto',
        borderRadius: 12,
        padding: 14,
      }
    : {}

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none' }}>
        {targetRect ? (
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <mask id="spotlight">
                <rect width="100%" height="100%" fill="white" />
                <rect x={targetRect.left - 6} y={targetRect.top - 6} width={targetRect.width + 12} height={targetRect.height + 12} rx="8" fill="black" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#spotlight)" />
            <rect x={targetRect.left - 6} y={targetRect.top - 6} width={targetRect.width + 12} height={targetRect.height + 12} rx="8" fill="none" stroke="rgba(59,130,246,0.9)" strokeWidth="2" />
          </svg>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
        )}
      </div>

      <div
        style={{
          ...tooltipStyle,
          zIndex: 9991,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 18,
          boxShadow: '0 18px 52px rgba(0,0,0,.32)',
          pointerEvents: 'all',
          animation: 'fadeUp .2s ease both',
          ...mobileTooltipStyles,
        }}
      >
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                height: 4,
                flex: i === currentStep ? 2 : 1,
                borderRadius: 2,
                cursor: 'pointer',
                background: i === currentStep ? 'var(--accent)' : i < currentStep ? 'var(--accentS2)' : 'var(--border)',
                transition: 'all .2s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accentS)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {step.icon}
          </span>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.01em' }}>{step.title}</div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.55, whiteSpace: 'pre-wrap', marginBottom: step.shortcut ? 8 : 14 }}>
          {step.description}
        </p>

        {step.shortcut && (
          <div style={{ fontSize: 11, color: 'var(--text4)', background: 'var(--bg2)', borderRadius: 6, padding: '6px 10px', marginBottom: 14 }}>
            {step.shortcut}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
          <button onClick={closeTour} style={{ fontSize: 11, color: 'var(--text4)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            Fermer le guide
          </button>

          <div style={{ display: 'flex', gap: 6, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
            {currentStep > 0 && (
              <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, fontWeight: 600, flex: isMobile ? 1 : undefined, justifyContent: 'center' }}>
                <ChevronLeft size={13} />
                Precedent
              </button>
            )}
            <button onClick={nextStep} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, flex: isMobile ? 1 : undefined, justifyContent: 'center' }}>
              {currentStep < steps.length - 1 ? (
                <>
                  Suivant <ChevronRight size={13} />
                </>
              ) : (
                <>
                  Terminer
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text4)', marginTop: 9 }}>
          Etape {currentStep + 1} sur {steps.length}
        </div>
      </div>
    </>
  )
}
