import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

const DOC_TYPE_LABELS: Record<string, string> = {
  'rapport-stage': 'Rapport de Stage',
  'memoire': 'Mémoire / TFE',
  'these': 'Thèse de Doctorat',
  'rapport-projet': 'Rapport de Projet',
  'expose': 'Exposé Académique',
}

// ── Prompt ultra-riche avec contenu académique dense ─────────────────────────
function buildPrompt(theme: string, docType: string, niveau: string, chapterCount: number): string {
  const typeLabel = DOC_TYPE_LABELS[docType] || 'Document académique'
  const safeCount = Math.min(7, Math.max(2, chapterCount))
  const emojiList = ['📚', '🔬', '📊', '💡', '🏗️', '🌐', '⚙️']

  const chaptersJson = Array.from({ length: safeCount }, (_, i) => `    {
      "id": "chap${i + 1}",
      "type": "chapter",
      "chapterNum": ${i + 1},
      "title": "GENERER_TITRE_CHAPITRE_${i + 1}",
      "emoji": "${emojiList[i] || '📌'}",
      "preview": "GENERER_DESCRIPTION_CHAPITRE_${i + 1}",
      "blocks": [
        { "type": "h2", "content": "GENERER_SOUS_TITRE_${i + 1}_1" },
        { "type": "text", "content": "GENERER_PARAGRAPHE_DENSE_${i + 1}_1_MIN_120_MOTS" },
        { "type": "h2", "content": "GENERER_SOUS_TITRE_${i + 1}_2" },
        { "type": "text", "content": "GENERER_PARAGRAPHE_DENSE_${i + 1}_2_MIN_120_MOTS" },
        { "type": "h2", "content": "GENERER_SOUS_TITRE_${i + 1}_3" },
        { "type": "text", "content": "GENERER_PARAGRAPHE_DENSE_${i + 1}_3_MIN_120_MOTS" },
        { "type": "h2", "content": "GENERER_SOUS_TITRE_SYNTHESE_${i + 1}" },
        { "type": "text", "content": "GENERER_SYNTHESE_PARTIELLE_${i + 1}_MIN_80_MOTS" }
      ]
    }`).join(',\n')

  return `Tu es un expert académique francophone spécialisé dans la rédaction de ${typeLabel} de niveau ${niveau}.

MISSION: Rédiger un ${typeLabel} TRÈS COMPLET et ACADÉMIQUEMENT RIGOUREUX sur le thème: "${theme}"

CONTRAINTES STRICTES DE DENSITÉ — OBLIGATOIRES:
• Chaque bloc "text" = MINIMUM 5 phrases complètes et développées (120 mots minimum)
• Utiliser des données chiffrées, exemples concrets, références théoriques plausibles
• Vocabulaire académique précis adapté au niveau ${niveau}
• Varier les tournures entre les sections (ne pas répéter les mêmes formules)
• Contenu directement lié au thème "${theme}", pas générique

STRUCTURE: ${safeCount + 2} sections (intro + ${safeCount} chapitres + conclusion)

RETOURNER UNIQUEMENT CE JSON (aucun texte avant/après):
{
  "sections": [
    {
      "id": "intro",
      "type": "introduction",
      "title": "Introduction générale",
      "emoji": "📝",
      "preview": "Contextualisation, problématique, objectifs et annonce du plan",
      "blocks": [
        { "type": "h2", "content": "Contexte général et pertinence du sujet" },
        { "type": "text", "content": "Rédiger 5-7 phrases académiques denses sur le contexte socio-économique, historique et scientifique de '${theme}'. Inclure des données statistiques récentes, nommer les acteurs clés concernés, expliquer pourquoi ce sujet est crucial aujourd'hui en ${niveau} et quelles évolutions récentes en font un objet d'étude incontournable dans ce domaine." },
        { "type": "h2", "content": "Problématique centrale et questions de recherche" },
        { "type": "text", "content": "Formuler en 5-6 phrases la problématique centrale liée à '${theme}'. Identifier les tensions, paradoxes ou lacunes observées dans la littérature existante. Poser 2-3 questions de recherche précises qui structurent l'ensemble de l'analyse et justifier leur pertinence au regard du niveau ${niveau} et du type ${typeLabel}." },
        { "type": "h2", "content": "Objectifs, méthodologie et délimitation du périmètre" },
        { "type": "text", "content": "Décrire en 5-6 phrases les objectifs généraux et spécifiques de ce ${typeLabel}. Présenter la démarche méthodologique adoptée (approche qualitative, quantitative ou mixte), les sources mobilisées (données primaires, secondaires, entretiens, observations), et délimiter clairement le périmètre temporel et géographique de l'étude." },
        { "type": "h2", "content": "Annonce du plan et logique de progression" },
        { "type": "text", "content": "Présenter en 4-5 phrases l'architecture du document en annonçant les ${safeCount} chapitres. Expliquer la logique de progression argumentative: comment chaque partie construit sur la précédente pour répondre à la problématique. Souligner la cohérence d'ensemble et l'apport original de ce travail pour le domaine de '${theme}'." }
      ]
    },
${chaptersJson},
    {
      "id": "conclusion",
      "type": "conclusion",
      "title": "Conclusion générale",
      "emoji": "🎯",
      "preview": "Synthèse des apports, limites reconnues et ouverture prospective",
      "blocks": [
        { "type": "h2", "content": "Bilan des résultats et réponse à la problématique" },
        { "type": "text", "content": "Synthétiser en 5-7 phrases les conclusions majeures de chacun des ${safeCount} chapitres sur '${theme}'. Démontrer comment l'ensemble des analyses répond à la problématique initiale. Mettre en évidence les apports originaux de ce ${typeLabel} pour la discipline et les enseignements les plus significatifs retenus au terme de ce travail de niveau ${niveau}." },
        { "type": "h2", "content": "Limites méthodologiques et points d'amélioration" },
        { "type": "text", "content": "Identifier honnêtement en 4-5 phrases les principales limites de ce travail: contraintes d'accès aux données, biais potentiels, limites du cadre théorique mobilisé, contraintes temporelles ou budgétaires spécifiques au niveau ${niveau}. Expliquer comment ces limites ont été partiellement gérées et ce qu'elles impliquent pour l'interprétation des résultats." },
        { "type": "h2", "content": "Recommandations opérationnelles et perspectives de recherche" },
        { "type": "text", "content": "Formuler en 5-6 phrases des recommandations concrètes et hiérarchisées à destination des professionnels, décideurs ou chercheurs travaillant sur '${theme}'. Proposer des pistes d'approfondissement pour de futures recherches: thèmes connexes non traités, nouvelles méthodologies à explorer, terrains d'investigation complémentaires. Conclure par une réflexion prospective sur l'évolution du domaine." }
      ]
    }
  ]
}

RAPPEL: Remplace TOUTES les valeurs "GENERER_*" par du contenu académique réel et dense en français sur "${theme}". Chaque bloc text = minimum 120 mots, contenu spécifique au thème, pas de texte générique.`
}

// ── Fallback avec contenu substantiel ────────────────────────────────────────
function buildFallbackSections(theme: string, docType: string, niveau: string, chapterCount: number) {
  const safeCount = Math.min(7, Math.max(2, chapterCount))
  const typeLabel = DOC_TYPE_LABELS[docType] || 'Document académique'
  const emojiList = ['📚', '🔬', '📊', '💡', '🏗️', '🌐', '⚙️']

  const chapterTitles = [
    `Fondements théoriques et cadre conceptuel de ${theme}`,
    `Analyse contextuelle et état de l'art`,
    `Méthodologie, collecte et traitement des données`,
    `Résultats, analyse critique et discussion`,
    `Recommandations stratégiques et plan d'action`,
    `Perspectives d'évolution et enjeux futurs`,
    `Synthèse comparative et évaluation des impacts`,
  ]

  const sections = [
    {
      id: 'intro',
      type: 'introduction',
      title: 'Introduction générale',
      emoji: '📝',
      preview: `Contextualisation approfondie du sujet "${theme}", formulation de la problématique et annonce du plan`,
      blocks: [
        { type: 'h2', content: 'Contexte général et pertinence du sujet' },
        { type: 'text', content: `La thématique de "${theme}" s'inscrit dans un contexte de transformations profondes qui touchent l'ensemble des acteurs du secteur concerné. Au cours des dernières décennies, les mutations technologiques, économiques et sociales ont profondément reconfiguré les pratiques et les enjeux liés à ce domaine. Pour un étudiant de niveau ${niveau}, la compréhension approfondie de ces dynamiques constitue un impératif académique et professionnel. Les statistiques disponibles révèlent que ce champ connaît une croissance soutenue, avec des implications qui dépassent largement le cadre académique pour toucher des enjeux sociétaux majeurs. Ce ${typeLabel} se propose d'explorer ces dimensions avec la rigueur méthodologique appropriée au niveau ${niveau}.` },
        { type: 'h2', content: 'Problématique centrale et questions de recherche' },
        { type: 'text', content: `La problématique centrale de ce travail peut être formulée ainsi: dans quelle mesure "${theme}" constitue-t-il un levier de transformation durable des pratiques existantes? Cette question soulève des tensions fondamentales entre tradition et innovation, entre contraintes institutionnelles et dynamiques de changement. Pour y répondre, trois sous-questions structurent notre analyse: Quels sont les fondements théoriques qui permettent d'appréhender ce phénomène? Quelles manifestations empiriques peut-on observer sur le terrain? Et quelles recommandations opérationnelles peuvent être formulées à l'attention des praticiens? La pertinence de ces questionnements est attestée par la littérature académique récente qui fait de "${theme}" un objet d'étude particulièrement dynamique.` },
        { type: 'h2', content: 'Objectifs, méthodologie et délimitation du périmètre' },
        { type: 'text', content: `Ce ${typeLabel} poursuit plusieurs objectifs complémentaires. L'objectif général consiste à produire une analyse rigoureuse et documentée de "${theme}" en mobilisant les outils conceptuels appropriés au niveau ${niveau}. Les objectifs spécifiques incluent: l'identification des principaux facteurs explicatifs, l'analyse comparative des approches existantes, et la formulation de recommandations fondées sur des données probantes. Sur le plan méthodologique, ce travail s'appuie sur une approche mixte combinant revue de littérature systématique, analyse documentaire et, le cas échéant, collecte de données primaires. Le périmètre de l'étude est délibérément circonscrit pour garantir la cohérence et la profondeur de l'analyse.` },
        { type: 'h2', content: 'Annonce du plan et logique de progression' },
        { type: 'text', content: `Ce ${typeLabel} s'organise en ${safeCount} chapitres complémentaires, précédés de cette introduction et suivis d'une conclusion générale. La progression logique adoptée suit une démarche déductive: des fondements théoriques vers les applications pratiques, du général vers le particulier. Chaque chapitre construit sur les apports des précédents pour enrichir progressivement la réflexion sur "${theme}". Cette architecture garantit la cohérence interne du propos et permet au lecteur de suivre le fil argumentatif avec clarté.` },
      ],
    },
    ...Array.from({ length: safeCount }, (_, i) => ({
      id: `chap${i + 1}`,
      type: 'chapter',
      chapterNum: i + 1,
      title: chapterTitles[i] || `Chapitre ${i + 1}: Développement thématique`,
      emoji: emojiList[i] || '📌',
      preview: `Analyse approfondie du ${i + 1}e aspect de "${theme}" avec données et exemples`,
      blocks: [
        { type: 'h2', content: `Cadre d'analyse et définitions opérationnelles` },
        { type: 'text', content: `Dans ce ${i + 1}e chapitre, nous abordons un aspect fondamental de "${theme}" qui requiert une clarification conceptuelle préalable. Les définitions adoptées dans ce travail s'appuient sur les travaux théoriques les plus récents et les plus reconnus dans le domaine. Il convient de distinguer plusieurs niveaux d'analyse: le niveau macro, qui concerne les dynamiques sectorielles et institutionnelles; le niveau méso, qui porte sur les organisations et les groupes d'acteurs; et le niveau micro, qui s'intéresse aux pratiques individuelles et aux comportements. Cette triple entrée permet de saisir la complexité du phénomène étudié dans toute sa richesse. Pour un ${typeLabel} de niveau ${niveau}, cette rigueur définitionnelle est indispensable à la validité des conclusions.` },
        { type: 'h2', content: `Analyse empirique et données observées` },
        { type: 'text', content: `L'examen des données disponibles sur "${theme}" révèle des tendances significatives qui méritent une attention particulière. Les études empiriques menées dans ce domaine montrent que les facteurs contextuels jouent un rôle déterminant dans la configuration des résultats observés. On note notamment des variations importantes selon les contextes géographiques, les secteurs d'activité et les périodes considérées. Les chiffres disponibles indiquent que ce phénomène affecte une proportion significative des acteurs concernés, avec des impacts différenciés selon le profil des organisations. Cette hétérogénéité des résultats invite à la prudence dans la généralisation des conclusions et plaide pour une approche contextualisée de l'analyse, comme le préconise la méthodologie adoptée dans ce ${typeLabel}.` },
        { type: 'h2', content: `Discussion critique et apports théoriques` },
        { type: 'text', content: `L'analyse critique des données présentées dans ce chapitre permet de mettre en dialogue les apports théoriques et les réalités empiriques observées. Si certains cadres conceptuels semblent bien adaptés pour rendre compte du phénomène étudié, d'autres révèlent leurs limites face à la complexité des situations rencontrées sur le terrain. Cette mise en tension productive entre théorie et pratique est caractéristique des meilleurs travaux académiques de niveau ${niveau}. Les implications pour la compréhension de "${theme}" sont multiples: elles invitent à réviser certaines hypothèses de départ, à affiner les outils analytiques mobilisés, et à envisager des explications complémentaires non identifiées initialement. Ce travail de critique constructive constitue une contribution originale à la réflexion collective sur ce sujet.` },
        { type: 'h2', content: `Synthèse des enseignements et transition` },
        { type: 'text', content: `Ce ${i + 1}e chapitre a permis d'explorer en profondeur un aspect essentiel de "${theme}" en combinant rigueur théorique et ancrage empirique. Les principaux enseignements retenus de cette analyse sont: premièrement, la nécessité de contextualiser toute analyse; deuxièmement, l'importance des dynamiques multi-niveaux; et troisièmement, la valeur heuristique d'une approche pluridisciplinaire. Ces conclusions préparent le terrain pour les développements du chapitre suivant, qui approfondira les implications pratiques et opérationnelles de ces constats.` },
      ],
    })),
    {
      id: 'conclusion',
      type: 'conclusion',
      title: 'Conclusion générale',
      emoji: '🎯',
      preview: 'Bilan synthétique, limites assumées et ouverture prospective',
      blocks: [
        { type: 'h2', content: 'Bilan des résultats et réponse à la problématique' },
        { type: 'text', content: `Ce ${typeLabel} sur "${theme}" a permis de répondre de manière structurée et documentée à la problématique centrale formulée en introduction. À travers ${safeCount} chapitres complémentaires, nous avons progressivement construit une analyse qui articule fondements théoriques et données empiriques. Les principaux enseignements se déclinent en trois registres: sur le plan théorique, nous avons enrichi et nuancé les cadres conceptuels existants; sur le plan empirique, nous avons identifié des régularités et des variations significatives; sur le plan opérationnel, nous avons traduit ces résultats en recommandations actionnables. La cohérence de cet ensemble constitue, selon nous, la contribution la plus originale de ce travail de niveau ${niveau}.` },
        { type: 'h2', content: 'Limites méthodologiques et pistes d\'amélioration' },
        { type: 'text', content: `Toute recherche académique comporte des limites qu'il convient d'assumer avec honnêteté intellectuelle. Ce ${typeLabel} n'échappe pas à cette règle. Les principales limites identifiées sont: la disponibilité et la fiabilité des données mobilisées, les contraintes temporelles inhérentes au niveau ${niveau}, et la difficulté à généraliser des conclusions élaborées dans un contexte particulier. Ces limites ne remettent pas en cause la valeur des résultats obtenus, mais invitent à la prudence dans leur interprétation et leur transfert à d'autres contextes. Elles ouvrent également des pistes pour des travaux ultérieurs qui pourraient pallier ces insuffisances.` },
        { type: 'h2', content: 'Recommandations et perspectives d\'avenir' },
        { type: 'text', content: `Au terme de cette analyse, plusieurs recommandations peuvent être formulées à l'attention des différentes parties prenantes concernées par "${theme}". Pour les praticiens, il s'agit avant tout d'intégrer les enseignements de ce travail dans une démarche d'amélioration continue. Pour les décideurs, ces résultats plaident en faveur d'une politique plus attentive aux dynamiques identifiées. Pour les chercheurs, ce ${typeLabel} ouvre plusieurs pistes prometteuses: l'approfondissement des analyses comparatives, le développement de nouveaux outils méthodologiques, et l'exploration de dimensions encore peu étudiées. L'avenir du domaine de "${theme}" dépendra en grande partie de la capacité des acteurs à tirer les leçons des expériences accumulées et à innover de manière responsable et éclairée.` },
      ],
    },
  ]

  return sections
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const rl = await rateLimit(`doc-assistant:${session.user.id}`, 10, 3600)
  if (!rl.allowed) return NextResponse.json({ error: 'Limite atteinte (10/heure)' }, { status: 429 })

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ error: 'Configuration manquante' }, { status: 503 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const {
    theme = '',
    docType = 'rapport-stage',
    niveau = 'Licence',
    chapterCount = 4,
  } = body

  if (!theme || theme.trim().length < 5) {
    return NextResponse.json({ error: 'Le thème doit contenir au moins 5 caractères' }, { status: 400 })
  }

  const safeCount = Math.min(7, Math.max(2, Number(chapterCount) || 3))
  const promptText = buildPrompt(theme.trim(), docType, niveau, safeCount)

  try {
    // llama-3.1-8b-instant: 20 000 tokens/min gratuit (vs 6 000 pour le 70b)
    // Permet des réponses bien plus volumineuses sur le tier gratuit
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 12000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert académique francophone. Tu génères UNIQUEMENT des objets JSON valides et très complets. Chaque bloc "text" doit contenir MINIMUM 5 phrases développées (120 mots minimum). Ne jamais tronquer ta réponse. Contenu académique dense et spécifique au thème demandé.',
          },
          { role: 'user', content: promptText },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'unknown error')
      console.error('[Assistant] Groq error:', response.status, errText)
      const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
      return NextResponse.json({ sections: fallback, remaining: rl.remaining, fallback: true })
    }

    const data = await response.json()
    const rawText: string = data.choices?.[0]?.message?.content || ''

    if (!rawText || rawText.trim().length < 10) {
      console.error('[Assistant] Empty response from Groq')
      const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
      return NextResponse.json({ sections: fallback, remaining: rl.remaining, fallback: true })
    }

    let parsed: any = null
    try {
      parsed = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) {
        try { parsed = JSON.parse(match[0]) } catch (e2) {
          console.error('[Assistant] JSON parse failed after regex:', e2)
        }
      }
    }

    if (!parsed || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      console.error('[Assistant] Invalid structure, using fallback.')
      const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
      return NextResponse.json({ sections: fallback, remaining: rl.remaining, fallback: true })
    }

    const cleanedSections = parsed.sections
      .filter((s: any) => s && typeof s === 'object' && s.title && !s.title.includes('GENERER_'))
      .map((s: any, idx: number) => ({
        id: s.id || `section-${idx}`,
        type: s.type || 'chapter',
        chapterNum: s.chapterNum,
        title: String(s.title || `Section ${idx + 1}`),
        emoji: s.emoji || '📌',
        preview: String(s.preview || ''),
        blocks: Array.isArray(s.blocks)
          ? s.blocks
              .filter((b: any) => b && b.type && b.content && !String(b.content).includes('GENERER_'))
              .map((b: any) => ({
                type: String(b.type),
                content: String(b.content),
              }))
          : [],
      }))

    if (cleanedSections.length === 0) {
      const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
      return NextResponse.json({ sections: fallback, remaining: rl.remaining, fallback: true })
    }

    // Compléter avec fallback si des sections manquent
    const expectedCount = safeCount + 2
    if (cleanedSections.length < expectedCount) {
      const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
      const merged = fallback.map((fb, i) => cleanedSections[i] || fb)
      return NextResponse.json({ sections: merged, remaining: rl.remaining })
    }

    return NextResponse.json({ sections: cleanedSections, remaining: rl.remaining })

  } catch (error) {
    console.error('[Assistant] Network/unexpected error:', error)
    const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
    return NextResponse.json({ sections: fallback, remaining: rl.remaining, fallback: true })
  }
}