'use client'

/**
 * useStudentConfig — Hook that reads the student onboarding config
 * from sessionStorage and applies it to the DocumentContext + ProfileContext.
 *
 * Call this hook in your editor layout (src/app/editor/page.tsx or EditorLayout)
 * AFTER DocumentProvider and ProfileProvider are mounted.
 *
 * Usage:
 *   // In your editor component:
 *   import { useStudentConfig } from '@/hooks/useStudentConfig'
 *   ...
 *   function EditorPage() {
 *     useStudentConfig()
 *     ...
 *   }
 */

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { generateId } from '@/lib/utils'
import type { DocPage, DocBlock, OrientationZoneConfig } from '@/types'

interface StudentConfig {
  titre?: string
  type?: string
  entreprise?: string
  duree?: string
  niveau?: string
  pages?: string
  chapitres?: string
  couleur?: string
  template?: string
}

function parseDesiredPages(raw: string | undefined): number {
  if (!raw) return 20
  const numeric = Number.parseInt(raw.replace(/[^\d]/g, ''), 10)
  if (Number.isNaN(numeric)) return 20
  return Math.min(60, Math.max(8, numeric))
}

/** Map template name → CoverLayout */
const TEMPLATE_MAP: Record<string, string> = {
  classic: 'classic',
  minimal: 'minimal',
  bold: 'bold',
  split: 'split',
}

/** Map niveau → suggested document subtitle */
const NIVEAU_MAP: Record<string, string> = {
  L: 'Licence / BTS / DUT',
  M1: 'Master 1',
  M2: 'Master 2 / MBA',
  Ingénieur: 'École d\'ingénieur',
  Doctorat: 'Doctorat',
}

const CHAPTER_TEMPLATES: Record<string, string[]> = {
  stage: [
    'Présentation de la structure d’accueil',
    'Déroulement du stage',
    'Missions réalisées et compétences mobilisées',
    'Analyse critique et difficultés rencontrées',
    'Recommandations et perspectives',
  ],
  memoire: [
    'Contexte, problématique et objectifs',
    'Revue de littérature',
    'Méthodologie',
    'Résultats et discussion',
    'Conclusion générale et recommandations',
  ],
  projet: [
    'Contexte et cadrage du projet',
    'Objectifs, périmètre et parties prenantes',
    'Méthodologie et réalisation',
    'Résultats, livrables et évaluation',
    'Recommandations et suite du projet',
  ],
  expose: [
    'Introduction et problématique',
    'Cadre conceptuel',
    'Développement / argumentation',
    'Analyse critique',
    'Conclusion et ouverture',
  ],
}

function pickChapterTitles(type: string | undefined, chapterCount: number): string[] {
  const key = (type || 'expose') as keyof typeof CHAPTER_TEMPLATES
  const base = CHAPTER_TEMPLATES[key] || CHAPTER_TEMPLATES.expose
  if (chapterCount <= base.length) return base.slice(0, chapterCount)
  const extra = Array.from({ length: chapterCount - base.length }, (_, i) => `Chapitre complémentaire ${i + 1}`)
  return [...base, ...extra]
}

function buildStarterPages(config: StudentConfig): DocPage[] {
  const chapterCount = Math.min(7, Math.max(3, Number(config.chapitres || 4)))
  const targetPages = parseDesiredPages(config.pages)
  const chapterTitles = pickChapterTitles(config.type, chapterCount)

  const contentTargetPages = Math.max(6, targetPages - 1)
  const chapterTargetPages = Math.max(chapterCount, contentTargetPages - 2) // keep 1 intro + 1 conclusion
  const basePerChapter = Math.floor(chapterTargetPages / chapterCount)
  const remainder = chapterTargetPages % chapterCount

  const introPage: DocPage = {
    id: generateId(),
    blocks: [
      { id: generateId(), type: 'h2', content: 'Introduction générale' },
      {
        id: generateId(),
        type: 'text',
        content: `Ce rapport est préparé pour environ ${targetPages} pages, avec ${chapterCount} chapitres principaux.`,
      },
      {
        id: generateId(),
        type: 'text',
        content: 'Présente ici le contexte, la problématique, les objectifs, la méthode et le plan du document.',
      },
    ],
  }

  const chapterPages: DocPage[] = []
  chapterTitles.forEach((title, idx) => {
    const pagesForThisChapter = basePerChapter + (idx < remainder ? 1 : 0)
    for (let pageIdx = 0; pageIdx < pagesForThisChapter; pageIdx++) {
      const sectionNo = pageIdx + 1
      const isChapterOpening = pageIdx === 0
      chapterPages.push({
        id: generateId(),
        blocks: [
          ...(isChapterOpening ? [{ id: generateId(), type: 'h1' as const, content: `Chapitre ${idx + 1} — ${title}` }] : []),
          { id: generateId(), type: 'h2', content: `Section ${idx + 1}.${sectionNo}` },
          {
            id: generateId(),
            type: 'text',
            content: isChapterOpening
              ? 'Développe cette partie en présentant le cadre, les objectifs opérationnels et les points-clés à traiter.'
              : 'Complète cette section avec des analyses détaillées, des observations, des exemples chiffrés et une discussion critique.',
          },
          {
            id: generateId(),
            type: 'text',
            content: 'Ajoute ici des éléments de preuve: méthodologie, résultats, interprétations, limites et recommandations.',
          },
        ],
      })
    }
  })

  const conclusionPage: DocPage = {
    id: generateId(),
    blocks: [
      { id: generateId(), type: 'h2', content: 'Conclusion générale' },
      {
        id: generateId(),
        type: 'text',
        content: 'Récapitule les points clés, les limites et les recommandations finales.',
      },
    ],
  }

  return [introPage, ...chapterPages, conclusionPage]
}

export function useStudentConfig() {
  const searchParams = useSearchParams()
  const { setTitle, setSubtitle, setDestination, setCoverStyle, setRef, setOrientationZone } = useDocument()
  const { updateProfile } = useProfile()

  useEffect(() => {
    const from = searchParams.get('from')

    let config: StudentConfig = {}
    try {
      const raw =
        sessionStorage.getItem('eetra-student-config') ||
        localStorage.getItem('eetra-student-config')

      // Apply if user came from onboarding OR if payload exists (redirect/login flows may drop query).
      if (from !== 'student-onboarding' && !raw) return
      if (!raw) return
      config = JSON.parse(raw)
      // Clear so it doesn't apply again on refresh/navigation.
      sessionStorage.removeItem('eetra-student-config')
      localStorage.removeItem('eetra-student-config')
    } catch {
      return
    }

    // ── Apply title ────────────────────────────────────────────────────────────
    if (config.titre) {
      setTitle(config.titre)
    }

    // ── Apply subtitle based on type + niveau ──────────────────────────────────
    const typeLabel =
      config.type === 'stage'
        ? 'Rapport de Stage'
        : config.type === 'memoire'
        ? 'Mémoire de Fin d\'Études'
        : config.type === 'projet'
        ? 'Rapport de Projet'
        : 'Exposé Académique'

    const niveauLabel = config.niveau ? NIVEAU_MAP[config.niveau] || config.niveau : ''
    const volumeLabel = config.pages ? `${config.pages} pages` : ''
    const structureLabel = config.chapitres ? `${config.chapitres} chapitres` : ''
    const subtitle = [typeLabel, niveauLabel, volumeLabel, structureLabel].filter(Boolean).join(' — ')
    setSubtitle(subtitle)

    // ── Apply ref ──────────────────────────────────────────────────────────────
    const year = new Date().getFullYear()
    const typeCode =
      config.type === 'stage' ? 'RS' : config.type === 'memoire' ? 'TFE' : 'RPT'
    setRef(`${typeCode}-${year}-001`)

    // ── Apply destination (entreprise for stage) ───────────────────────────────
    if (config.entreprise) {
      setDestination(config.entreprise)
    }

    // ── Apply accent color to profile ──────────────────────────────────────────
    if (config.couleur) {
      updateProfile({ color: config.couleur })
    }

    // ── Apply cover style ──────────────────────────────────────────────────────
    const layout = TEMPLATE_MAP[config.template || 'classic'] || 'classic'
    setCoverStyle({
      layout: layout as any,
      accentColor: config.couleur || '#1B4FD8',
      showLogo: true,
      showQr: true,
      showGrid: false,
      backgroundStyle: 'solid',
      titleSize: 'lg',
      coverBlocks: [],
    })

    const chapterCount = Math.min(7, Math.max(3, Number(config.chapitres || 4)))
    const orientationConfig: OrientationZoneConfig = {
      enabled: true,
      position: 'after-cover',
      afterPageIndex: null,
      showTOC: true,
      tocLevels: [1, 2],
      numberStyle: 'numeric',
      showPageNumbers: true,
      tocTitle: 'Plan du rapport',
      showTableList: false,
      tableListTitle: 'Liste des Tableaux',
      showIllustrationList: false,
      illustrationListTitle: 'Liste des Illustrations',
    }
    setOrientationZone(orientationConfig)

    // Keep document draft in sync so EditorContext restore doesn't override onboarding values.
    try {
      const draftRaw = localStorage.getItem('eetra-document-draft')
      const draft = draftRaw ? JSON.parse(draftRaw) : {}
      const year = new Date().getFullYear()
      const typeCode =
        config.type === 'stage' ? 'RS' : config.type === 'memoire' ? 'TFE' : 'RPT'
      const subtitleForDraft = [typeLabel, niveauLabel, volumeLabel, structureLabel].filter(Boolean).join(' — ')

      const mergedDraft = {
        ...draft,
        title: config.titre || draft.title || '',
        subtitle: subtitleForDraft || draft.subtitle || '',
        ref: `${typeCode}-${year}-001`,
        destination: config.entreprise || draft.destination || '',
        pages: buildStarterPages(config),
        coverStyle: {
          ...(draft.coverStyle || {}),
          layout,
          accentColor: config.couleur || '#1B4FD8',
          showLogo: true,
          showQr: true,
          showGrid: false,
          backgroundStyle: 'solid',
          titleSize: 'lg',
          coverBlocks: [],
        },
        orientationZone: {
          ...(draft.orientationZone || {}),
          ...orientationConfig,
        },
      }
      localStorage.setItem('eetra-document-draft', JSON.stringify(mergedDraft))
    } catch {}
  }, [searchParams, setTitle, setSubtitle, setDestination, setCoverStyle, setRef, setOrientationZone, updateProfile])
}