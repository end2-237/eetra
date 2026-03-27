import { Template, TableData } from '@/types'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'

const KPI_TABLE: TableData = {
  headers: ['Indicateur', 'Réf. 2025', 'Cible 2026', 'Var.', 'Statut'],
  rows: [
    ["Chiffre d'Affaires", "9 200 000 FCFA", "12 000 000 FCFA", "+30%", "🟢 En cible"],
    ["Marge Opérationnelle", "16%", "21%", "+5pt", "🟡 En cours"],
    ["Effectifs", "34", "47", "+38%", "🟢 En cible"],
    ["Nouveaux Marchés", "2", "4", "+100%", "🔵 Planifié"],
    ["Score NPS", "42", "65", "+23pt", "🟡 En cours"],
  ],
}

const DEVIS_TABLE: TableData = {
  headers: ['Désignation', 'Unité', 'Qté', 'P.U. HT (FCFA)', 'Montant HT'],
  rows: [
    ['Prestation de conseil stratégique', 'Jour', '5', '150 000', '750 000'],
    ['Audit organisationnel', 'Forfait', '1', '500 000', '500 000'],
    ['Rapport final + livrables', 'Forfait', '1', '200 000', '200 000'],
    ['Formation équipe (2 jours)', 'Session', '2', '250 000', '500 000'],
    ['', '', '', 'Sous-total HT', '1 950 000'],
    ['', '', '', 'TVA (18%)', '351 000'],
    ['', '', '', 'TOTAL TTC', '2 301 000'],
  ],
}

const AUDIT_TABLE: TableData = {
  headers: ['Domaine', 'Risque', 'Impact', 'Probabilité', 'Recommandation'],
  rows: [
    ['Gouvernance', 'Concentration pouvoirs', 'Élevé', 'Moyenne', 'Délégation formalisée'],
    ['Finance', 'Délai recouvrement', 'Élevé', 'Haute', 'Procédure recouvrement'],
    ['SI', 'Accès non contrôlés', 'Moyen', 'Haute', 'Politique IAM'],
    ['Achats', 'Fournisseur unique', 'Élevé', 'Faible', 'Diversification'],
    ['RH', 'Turn-over cadres', 'Moyen', 'Moyenne', 'Plan rétention'],
  ],
}

const PLANNING_TABLE: TableData = {
  headers: ['Phase', 'Description', 'Début', 'Fin', 'Responsable', 'Statut'],
  rows: [
    ['Phase 1', 'Cadrage & diagnostic', '01/01/2026', '15/01/2026', 'Chef de projet', '✅ Terminé'],
    ['Phase 2', 'Analyse & conception', '16/01/2026', '15/02/2026', 'Équipe technique', '🔄 En cours'],
    ['Phase 3', 'Développement & tests', '16/02/2026', '31/03/2026', 'Équipe dev', '⬜ À venir'],
    ['Phase 4', 'Déploiement & formation', '01/04/2026', '15/04/2026', 'Direction', '⬜ À venir'],
    ['Phase 5', 'Suivi & optimisation', '16/04/2026', '30/06/2026', 'Direction', '⬜ À venir'],
  ],
}

// ─── Cover styles par template ────────────────────────────────────────────────

const COVER_BP: CoverStyle = {
  layout: 'classic',
  accentColor: '#1B4FD8',
  showLogo: true,
  showQr: true,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'xl',
}

const COVER_AO: CoverStyle = {
  layout: 'split',
  accentColor: '#059669',
  showLogo: true,
  showQr: true,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'lg',
}

const COVER_AUDIT: CoverStyle = {
  layout: 'bold',
  accentColor: '#7C3AED',
  showLogo: true,
  showQr: true,
  showGrid: true,
  backgroundStyle: 'solid',
  titleSize: 'lg',
}

const COVER_MEMO: CoverStyle = {
  layout: 'minimal',
  accentColor: '#0E7490',
  showLogo: true,
  showQr: false,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'md',
}

const COVER_CONTRAT: CoverStyle = {
  layout: 'minimal',
  accentColor: '#DC2626',
  showLogo: true,
  showQr: true,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'lg',
}

const COVER_DEVIS: CoverStyle = {
  layout: 'classic',
  accentColor: '#DC2626',
  showLogo: true,
  showQr: false,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'md',
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [
  {
    id: 'bp',
    icon: 'bp',
    name: 'Business Plan',
    desc: 'Plan stratégique complet 5 ans avec projections financières',
    tags: ['Finances', 'Vision', 'Stratégie'],
    coverStyle: COVER_BP,
    blocks: [
      { type: 'section', content: 'SECTION 01 // RÉSUMÉ EXÉCUTIF' },
      { type: 'text', content: 'Ce résumé présente les points saillants du plan stratégique. Notre vision est de devenir le leader de notre segment sur les marchés d\'Afrique de l\'Ouest d\'ici 2028, avec une croissance annuelle soutenue de 30%.' },
      { type: 'kpi' },
      { type: 'quote', content: '"Notre mission est de créer de la valeur durable pour toutes nos parties prenantes, en plaçant l\'innovation au cœur de chacune de nos décisions stratégiques."' },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 02 // PRÉSENTATION DE L\'ENTREPRISE' },
      { type: 'text', content: 'Notre entreprise est spécialisée dans [secteur]. Notre mission est d\'offrir des solutions innovantes à nos clients tout en créant de la valeur durable pour nos parties prenantes. Nous opérons sur les marchés d\'Afrique de l\'Ouest avec une équipe de professionnels expérimentés.' },
      { type: 'text', content: 'Fondée en [année], notre organisation dispose d\'une expertise reconnue dans le secteur. Nos valeurs fondamentales — excellence, intégrité et innovation — guident l\'ensemble de nos actions et décisions au quotidien.' },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 03 // ANALYSE DU MARCHÉ' },
      { type: 'text', content: 'Le marché adressable total (TAM) de notre secteur est estimé à 180 milliards FCFA en 2026, avec un taux de croissance annuel composé (CAGR) de 12,4%. Notre segment de marché disponible (SAM) représente environ 32 milliards FCFA.' },
      { type: 'table', tableData: KPI_TABLE },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 04 // STRATÉGIE COMMERCIALE & OFFRE' },
      { type: 'text', content: 'Notre stratégie commerciale repose sur trois axes majeurs : l\'acquisition de nouveaux clients via un réseau de partenaires certifiés, la fidélisation de notre base existante par une expérience client différenciante, et l\'expansion géographique progressive dans les marchés CEDEAO prioritaires.' },
      { type: 'quote', content: '"L\'excellence opérationnelle et l\'innovation client sont les deux piliers de notre stratégie de croissance pour la période 2026-2030."' },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 05 // PROJECTIONS FINANCIÈRES (FCFA)' },
      { type: 'text', content: 'Les projections financières établies sur 5 ans reposent sur des hypothèses conservatrices validées par notre comité d\'audit. Le point d\'équilibre (break-even) est atteint au Q3 2026, avec un retour sur investissement complet prévu pour fin 2027.' },
      { type: 'table', tableData: {
        headers: ['Exercice', 'CA (FCFA)', 'Charges', 'EBITDA', 'Marge', 'Effectifs'],
        rows: [
          ['2025 (réel)', '9 200 000', '7 750 000', '1 450 000', '15.8%', '34'],
          ['2026 (proj.)', '12 000 000', '9 600 000', '2 400 000', '20%', '47'],
          ['2027 (proj.)', '15 600 000', '11 700 000', '3 900 000', '25%', '58'],
          ['2028 (proj.)', '20 280 000', '14 196 000', '6 084 000', '30%', '72'],
          ['2029 (proj.)', '26 364 000', '17 037 000', '9 327 000', '35.4%', '89'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'SECTION 06 // PLAN D\'ACTIONS & JALONS' },
      { type: 'table', tableData: PLANNING_TABLE },
      { type: 'sign' },
    ],
  },
  {
    id: 'ao',
    icon: 'ao',
    name: "Appel d'Offre",
    desc: 'Réponse structurée avec méthodologie et proposition commerciale',
    tags: ['Proposition', 'Planning', 'Contrat'],
    coverStyle: COVER_AO,
    blocks: [
      { type: 'section', content: "SECTION 01 // LETTRE DE COUVERTURE" },
      { type: 'text', content: "Madame, Monsieur,\n\nNous avons l'honneur de vous soumettre notre réponse à l'appel d'offres réf. [N°AO] lancé le [date]. Après analyse approfondie du cahier des charges, nous sommes convaincus de disposer des compétences, de l'expérience et des ressources nécessaires pour répondre à vos attentes avec le niveau d'excellence que votre organisation exige." },
      { type: 'divider' },
      { type: 'section', content: "SECTION 02 // COMPRÉHENSION DU BESOIN" },
      { type: 'text', content: "Notre équipe a conduit une analyse approfondie des spécifications techniques et fonctionnelles. Nous avons identifié trois enjeux majeurs : la performance opérationnelle, la conformité réglementaire et la maîtrise des coûts." },
      { type: 'quote', content: '"Notre approche centrée sur vos besoins spécifiques garantit une solution sur mesure, livrée dans les délais et le budget impartis."' },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 03 // RÉFÉRENCES & CAPACITÉS' },
      { type: 'text', content: "Depuis notre création, nous avons conduit plus de 40 missions similaires auprès d'acteurs publics et privés de la sous-région. Notre équipe projet est composée de consultants certifiés disposant d'une expertise sectorielle reconnue." },
      { type: 'kpi' },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 04 // PROPOSITION TECHNIQUE DÉTAILLÉE' },
      { type: 'text', content: 'Notre proposition technique s\'articule autour d\'une méthodologie éprouvée en 5 phases. Chaque phase est assortie de livrables précis, validés conjointement avec votre équipe selon un processus de revue formalisé.' },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 05 // MÉTHODOLOGIE & PLANNING DÉTAILLÉ' },
      { type: 'table', tableData: PLANNING_TABLE },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 06 // ÉQUIPE PROJET DÉDIÉE' },
      { type: 'text', content: 'L\'équipe dédiée à votre projet est constituée de professionnels sélectionnés pour leur expertise spécifique au contexte de votre appel d\'offre.' },
      { type: 'table', tableData: {
        headers: ['Poste', 'Nom', 'Expérience', 'Certification', 'Taux occupation'],
        rows: [
          ['Chef de projet', 'À définir', '8 ans', 'PMP®', '100%'],
          ['Expert technique', 'À définir', '6 ans', 'ISO 27001', '80%'],
          ['Analyste senior', 'À définir', '5 ans', 'CISA', '60%'],
          ['Chargé de compte', 'À définir', '4 ans', '—', '40%'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'SECTION 07 // PROPOSITION COMMERCIALE (FCFA HT)' },
      { type: 'clause', content: "Article 1. — Conditions de Paiement\nLes paiements s'effectueront selon l'échéancier suivant : 40% à la signature de l'ordre de service, 40% à la livraison du rapport intermédiaire, et le solde de 20% à l'acceptation du livrable final." },
      { type: 'sign' },
    ],
  },
  {
    id: 'audit',
    icon: 'audit',
    name: "Rapport d'Audit",
    desc: 'Constatations, analyse des risques & recommandations',
    tags: ['Risques', 'Constatations', 'KPIs'],
    coverStyle: COVER_AUDIT,
    blocks: [
      { type: 'section', content: 'SECTION 01 // SYNTHÈSE EXÉCUTIVE' },
      { type: 'quote', content: '"Le présent rapport constitue une évaluation exhaustive et indépendante des processus organisationnels et financiers sur la période de référence 2025."' },
      { type: 'kpi' },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 02 // PÉRIMÈTRE & MÉTHODOLOGIE' },
      { type: 'text', content: "L'audit a été conduit conformément aux normes ISA et aux référentiels COSO sur la période du 1er janvier au 31 décembre 2025. Le périmètre couvre les fonctions Finances, RH, Achats et Systèmes d'Information." },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 03 // CONSTATATIONS PRINCIPALES' },
      { type: 'table', tableData: {
        headers: ['N°', 'Constatation', 'Impact', 'Catégorie', 'Priorité'],
        rows: [
          ['C-01', 'Séparation des fonctions insuffisante', 'Élevé', 'Gouvernance', '🔴 Urgent'],
          ['C-02', 'Délai recouvrement créances > 78j', 'Élevé', 'Finance', '🔴 Urgent'],
          ['C-03', 'Politique IAM absente', 'Moyen', 'Systèmes Info.', '🟡 Important'],
          ['C-04', 'Mono-fournisseur (43% achats)', 'Élevé', 'Achats', '🟡 Important'],
          ['C-05', 'Absence PCA documenté', 'Moyen', 'Opérations', '🟢 Standard'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'SECTION 04 // ANALYSE DÉTAILLÉE DES RISQUES' },
      { type: 'table', tableData: AUDIT_TABLE },
      { type: 'divider' },
      { type: 'section', content: 'SECTION 05 // RECOMMANDATIONS STRATÉGIQUES' },
      { type: 'table', tableData: {
        headers: ['Recommandation', 'Priorité', 'Délai', 'Coût estimé', 'Responsable'],
        rows: [
          ['Formaliser délégation de signature', '🔴 Urgent', '30 jours', 'Faible', 'DG'],
          ['Mettre en place procédure de recouvrement', '🔴 Urgent', '45 jours', 'Moyen', 'DAF'],
          ['Déployer politique de gestion des accès', '🟡 Important', '60 jours', 'Moyen', 'DSI'],
          ['Diversifier panel fournisseurs', '🟡 Important', '90 jours', 'Faible', 'DAC'],
          ['Rédiger et tester le PCA', '🟢 Standard', '6 mois', 'Élevé', 'COMEX'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'SECTION 06 // CONCLUSION & OPINION' },
      { type: 'text', content: "Sur la base de nos travaux, nous émettons une opinion avec réserves sur l'efficacité du contrôle interne de l'entité pour l'exercice 2025." },
      { type: 'sign' },
    ],
  },
  {
    id: 'memo',
    icon: 'memo',
    name: 'Note de Direction',
    desc: 'Communication interne formelle avec décisions et plan d\'actions',
    tags: ['Mémo', 'Décision', 'Interne'],
    coverStyle: COVER_MEMO,
    blocks: [
      { type: 'section', content: 'OBJET // NOTE DE SERVICE N°[X]/2026' },
      { type: 'text', content: `La présente note a pour objet de porter à la connaissance de l'ensemble du personnel de Direction les décisions prises en Comité Exécutif.` },
      { type: 'table', tableData: {
        headers: ['Émetteur', 'Destinataires', 'Date', 'Priorité', 'Diffusion'],
        rows: [
          ['Direction Générale', 'Tous Directeurs', new Date().toLocaleDateString('fr-FR'), '🔴 Urgent', 'Restreinte'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'CONTEXTE & MOTIVATION' },
      { type: 'text', content: 'La présente note fait suite à l\'examen des indicateurs de performance du trimestre écoulé et aux orientations stratégiques définies par le Conseil d\'Administration.' },
      { type: 'quote', content: '"La cohérence de nos décisions opérationnelles est le socle de notre performance collective."' },
      { type: 'divider' },
      { type: 'section', content: 'DÉCISIONS & DISPOSITIONS' },
      { type: 'table', tableData: {
        headers: ['N°', 'Décision', 'Responsable', 'Échéance', 'Statut'],
        rows: [
          ['D-01', 'Restructuration du département commercial', 'DG', '31/03/2026', '🔄 En cours'],
          ['D-02', 'Adoption du nouvel ERP', 'DSI', '30/06/2026', '⬜ Planifié'],
          ['D-03', 'Révision grille salariale cadres', 'DRH', '30/04/2026', '🔄 En cours'],
          ['D-04', 'Ouverture bureau régional', 'DG', '30/09/2026', '⬜ Planifié'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'MISE EN ŒUVRE & CALENDRIER' },
      { type: 'table', tableData: PLANNING_TABLE },
      { type: 'divider' },
      { type: 'clause', content: "Disposition finale\nLa présente note annule et remplace toute communication antérieure portant sur les sujets traités. Elle est valable jusqu'à publication d'une note subséquente." },
      { type: 'sign' },
    ],
  },
  {
    id: 'contrat',
    icon: 'contrat',
    name: 'Contrat / Convention',
    desc: 'Cadre contractuel complet avec clauses OHADA',
    tags: ['Clauses', 'OHADA', 'Signature'],
    coverStyle: COVER_CONTRAT,
    blocks: [
      { type: 'section', content: 'ENTRE LES SOUSSIGNÉS' },
      { type: 'text', content: "D'une part, [Entité], société [forme juridique] au capital de [capital] FCFA, immatriculée au RCCM sous le numéro [RCCM], dont le siège social est sis à [adresse], représentée par [signataire], agissant en qualité de Directeur Général, ci-après désignée « le Prestataire ».\n\nD'autre part, [Nom Client], [forme juridique], immatriculée sous le numéro [N°], sise à [adresse client], représentée par [nom], ci-après désignée « le Client »." },
      { type: 'divider' },
      { type: 'section', content: 'ARTICLE 1 — OBJET DU CONTRAT' },
      { type: 'clause', content: "Article 1. — Objet\nLe présent contrat a pour objet de définir les conditions et modalités dans lesquelles le Prestataire s'engage à fournir au Client les prestations de services définies à l'Annexe I." },
      { type: 'section', content: 'ARTICLE 2 — CONDITIONS FINANCIÈRES (FCFA)' },
      { type: 'clause', content: "Article 2. — Rémunération\nEn contrepartie des prestations réalisées, le Client versera au Prestataire la somme forfaitaire définie dans le devis annexé." },
      { type: 'table', tableData: {
        headers: ['Tranche', 'Événement déclencheur', 'Montant (FCFA)', 'Délai paiement'],
        rows: [
          ['Acompte (40%)', 'Signature du contrat', 'À définir', '7 jours ouvrés'],
          ['Intermédiaire (40%)', 'Livraison rapport intermédiaire', 'À définir', '15 jours ouvrés'],
          ['Solde (20%)', 'Réception définitive', 'À définir', '30 jours ouvrés'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'ARTICLES 3 À 6 — CLAUSES GÉNÉRALES' },
      { type: 'clause', content: "Article 3. — Durée & Résiliation\nLe présent contrat prend effet à compter de sa signature par les deux parties pour une durée déterminée de [durée]." },
      { type: 'clause', content: "Article 4. — Confidentialité\nLes parties s'engagent à maintenir strictement confidentielle toute information dont elles pourraient avoir connaissance dans le cadre du présent contrat, et ce pendant une durée de 5 ans après son expiration." },
      { type: 'clause', content: "Article 5. — Propriété Intellectuelle\nL'ensemble des livrables produits dans le cadre du présent contrat devient la propriété exclusive du Client à compter du paiement intégral du prix convenu." },
      { type: 'clause', content: "Article 6. — Droit Applicable & Juridiction\nLe présent contrat est régi par le droit OHADA et la législation nationale applicable." },
      { type: 'divider' },
      { type: 'sign' },
    ],
  },
  {
    id: 'devis',
    icon: 'devis',
    name: 'Devis / Facture Pro',
    desc: 'Devis professionnel avec tableau détaillé et conditions',
    tags: ['Devis', 'Facturation', 'FCFA'],
    coverStyle: COVER_DEVIS,
    blocks: [
      { type: 'section', content: 'DEVIS N° [DEV-2026-001]' },
      { type: 'table', tableData: {
        headers: ['Émis le', 'Valable jusqu\'au', 'Client', 'Référence client', 'Commercial'],
        rows: [
          [new Date().toLocaleDateString('fr-FR'), new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('fr-FR'), '[Nom client]', '[Réf. client]', '[Commercial]'],
        ],
      }},
      { type: 'divider' },
      { type: 'section', content: 'DÉSIGNATION DES PRESTATIONS' },
      { type: 'table', tableData: DEVIS_TABLE },
      { type: 'divider' },
      { type: 'section', content: 'RÉCAPITULATIF FINANCIER' },
      { type: 'kpi' },
      { type: 'divider' },
      { type: 'section', content: 'CONDITIONS GÉNÉRALES DE VENTE' },
      { type: 'clause', content: "Conditions de paiement\nLe règlement s'effectue par virement bancaire ou Mobile Money. Un acompte de 40% est requis à la validation du devis." },
      { type: 'clause', content: "Validité & Acceptation\nLe présent devis est valable 30 jours à compter de sa date d'émission." },
      { type: 'clause', content: "Annulation & Remboursement\nEn cas d'annulation par le Client après versement de l'acompte, celui-ci reste acquis au Prestataire à titre d'indemnité de dédit." },
      { type: 'divider' },
      { type: 'sign' },
    ],
  },
]

export const PALETTE = [
  '#1B4FD8', '#0F172A', '#1A3C5E', '#14532D',
  '#4A1D96', '#7C2D12', '#1E3A5F', '#374151',
  '#065F46', '#7F1D1D', '#B45309', '#0E7490',
]

export const TEMPLATE_COVER_LAYOUT_MAP: Record<string, string> = {
  // Business documents — classic sidebar style
  'bp':              'classic',
  'ao':              'classic',
  'note-politique':  'classic',
  'memo':            'pv',
 
  // Audit — bold colored cover
  'audit':                'bold',
  'audit-financier':      'bold',
  'audit-conformite':     'classic',
 
  // Legal — split style
  'contrat':              'split',
  'contrat-bail':         'split',
 
  // Invoice / billing — invoice style (compact, single-page optimized)
  'facture':              'invoice',
  'facture-proforma':     'invoice',
  'devis':                'invoice',
  'devis-professionnel':  'invoice',
 
  // PV & Minutes — pv style
  'pv-conseil':           'pv',
  'pv-ag':                'pv',
  'pv-reunion':           'pv',
  'compte-rendu':         'pv',
  'compte-rendu-visite':  'pv',
 
  // Academic — academic style
  'rapport-stage-licence': 'academic',
  'rapport-stage-master':  'academic',
  'rapport-td':            'academic',
  'memoire-master':        'academic',
  'these-doctorat':        'academic',
  'expose-licence':        'academic',
  'expose-master':         'academic',
 
  // Research / publication
  'article-recherche':    'bold',
}
export function applyLayoutOverrides<T extends { id: string; coverStyle?: any }>(templates: T[]): T[] {
  return templates.map(t => ({
    ...t,
    coverStyle: {
      ...t.coverStyle,
      layout: TEMPLATE_COVER_LAYOUT_MAP[t.id] || t.coverStyle?.layout || 'classic',
    },
  }))
}