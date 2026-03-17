import { DocBlock } from '@/types'
import { generateId } from '@/lib/utils'

export const WELCOME_PROFILE = {
  name: 'ACACIA CONSULTING',
  sector: 'Conseil & Stratégie',
  color: '#1B4FD8',
  email: 'contact@acacia.ci',
  city: 'Abidjan, Côte d\'Ivoire',
  signer: 'Directeur Général',
  tagline: 'Votre croissance, notre expertise',
  web: 'www.acacia-consulting.ci',
}

export const WELCOME_DOC = {
  title: 'PLAN DE DÉVELOPPEMENT STRATÉGIQUE',
  subtitle: '2026 — 2028 · Document Confidentiel',
  ref: 'BP-2026-001',
  destination: 'Comité Exécutif',
  confidentiality: 'CONFIDENTIEL' as const,
}

export function makeWelcomeBlocks(): DocBlock[] {
  return [
    {
      id: generateId(),
      type: 'section',
      content: 'SECTION 01 // RÉSUMÉ EXÉCUTIF',
    },
    {
      id: generateId(),
      type: 'text',
      content: 'Bienvenue sur EETRA ! Ce document exemple illustre les possibilités de la plateforme. Cliquez sur n\'importe quel texte pour l\'éditer directement. Utilisez le panneau gauche pour ajouter des blocs ou appliquer un Smart Template complet.',
    },
    {
      id: generateId(),
      type: 'kpi',
    },
    {
      id: generateId(),
      type: 'divider',
    },
    {
      id: generateId(),
      type: 'section',
      content: 'SECTION 02 // ANALYSE STRATÉGIQUE',
    },
    {
      id: generateId(),
      type: 'quote',
      content: '"L\'excellence opérationnelle et l\'innovation client sont les deux piliers de notre stratégie de croissance pour la période 2026-2028."',
    },
    {
      id: generateId(),
      type: 'text',
      content: 'Notre stratégie repose sur trois axes majeurs : l\'acquisition de nouveaux clients via un réseau de partenaires certifiés, la fidélisation de notre base existante par une expérience différenciante, et l\'expansion géographique progressive dans les marchés CEDEAO.',
    },
    {
      id: generateId(),
      type: 'table',
      tableData: {
        headers: ['Indicateur', 'Réf. 2025', 'Cible 2026', 'Variation'],
        rows: [
          ["Chiffre d'Affaires", "9 200 000 FCFA", "12 000 000 FCFA", "+30%"],
          ["Marge Opérationnelle", "16%", "21%", "+5pt"],
          ["Effectifs", "34", "47", "+38%"],
          ["Nouveaux Marchés", "2", "4", "+100%"],
        ],
      },
    },
    {
      id: generateId(),
      type: 'sign',
    },
  ]
}
