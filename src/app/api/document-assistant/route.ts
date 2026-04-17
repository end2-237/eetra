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

function buildPrompt(theme: string, docType: string, niveau: string, chapterCount: number): string {
  const typeLabel = DOC_TYPE_LABELS[docType] || 'Document académique'
  const safeCount = Math.min(4, Math.max(2, chapterCount))

  return `Tu es un expert académique francophone. Génère un plan structuré pour un document académique.

PARAMÈTRES:
- Thème: "${theme}"
- Type: ${typeLabel}
- Niveau: ${niveau}
- Nombre de chapitres: ${safeCount} (hors intro et conclusion)

INSTRUCTIONS STRICTES:
1. Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou après.
2. La structure doit contenir exactement une clé "sections" qui est un tableau.
3. Le tableau doit avoir: 1 introduction + ${safeCount} chapitres + 1 conclusion = ${safeCount + 2} éléments.
4. Chaque section doit avoir exactement les champs: id, type, title, emoji, preview, blocks.
5. Chaque bloc dans "blocks" doit avoir: type (h2 ou text) et content (string non vide).
6. Chaque paragraphe "text" doit faire 2-3 phrases denses et informatives sur le thème.

FORMAT JSON ATTENDU:
{
  "sections": [
    {
      "id": "intro",
      "type": "introduction",
      "title": "Introduction générale",
      "emoji": "📝",
      "preview": "Courte description de la section",
      "blocks": [
        { "type": "h2", "content": "Contexte et problématique" },
        { "type": "text", "content": "Paragraphe de 2-3 phrases sur le contexte du thème." },
        { "type": "h2", "content": "Objectifs du document" },
        { "type": "text", "content": "Paragraphe de 2-3 phrases sur les objectifs." }
      ]
    },
    {
      "id": "chap1",
      "type": "chapter",
      "chapterNum": 1,
      "title": "Titre du chapitre 1",
      "emoji": "📊",
      "preview": "Description du chapitre",
      "blocks": [
        { "type": "h2", "content": "Première section du chapitre" },
        { "type": "text", "content": "Contenu dense de 2-3 phrases." },
        { "type": "h2", "content": "Deuxième section du chapitre" },
        { "type": "text", "content": "Contenu dense de 2-3 phrases." }
      ]
    },
    {
      "id": "conclusion",
      "type": "conclusion",
      "title": "Conclusion générale",
      "emoji": "🎯",
      "preview": "Synthèse et perspectives",
      "blocks": [
        { "type": "h2", "content": "Synthèse des résultats" },
        { "type": "text", "content": "Bilan de 2-3 phrases." },
        { "type": "h2", "content": "Perspectives et recommandations" },
        { "type": "text", "content": "Perspectives de 2-3 phrases." }
      ]
    }
  ]
}

Génère maintenant le JSON complet pour le thème "${theme}". IMPORTANT: retourne uniquement le JSON, rien d'autre.`
}

function buildFallbackSections(theme: string, docType: string, niveau: string, chapterCount: number) {
  const safeCount = Math.min(4, Math.max(2, chapterCount))
  const typeLabel = DOC_TYPE_LABELS[docType] || 'Document académique'

  const sections = [
    {
      id: 'intro',
      type: 'introduction',
      title: 'Introduction générale',
      emoji: '📝',
      preview: `Présentation du contexte et des objectifs du ${typeLabel.toLowerCase()}`,
      blocks: [
        { type: 'h2', content: 'Contexte et problématique' },
        { type: 'text', content: `Ce ${typeLabel.toLowerCase()} porte sur le thème "${theme}", un sujet d'une grande pertinence dans le contexte académique et professionnel actuel. La compréhension approfondie de cette thématique est essentielle pour tout étudiant de niveau ${niveau}.` },
        { type: 'h2', content: 'Objectifs du document' },
        { type: 'text', content: `Les objectifs de ce travail sont multiples : analyser les concepts fondamentaux liés à "${theme}", identifier les enjeux actuels, et proposer des pistes de réflexion adaptées au niveau ${niveau}. Ce document vise à offrir une vision claire et structurée du sujet.` },
        { type: 'h2', content: 'Plan du document' },
        { type: 'text', content: `Ce document est organisé en ${safeCount} chapitres principaux, précédés de cette introduction et suivis d'une conclusion générale. Chaque chapitre aborde un aspect spécifique du thème afin d'en offrir une compréhension complète et progressive.` },
      ],
    },
    ...Array.from({ length: safeCount }, (_, i) => ({
      id: `chap${i + 1}`,
      type: 'chapter',
      chapterNum: i + 1,
      title: `Chapitre ${i + 1} — ${['Fondements théoriques', 'Analyse et méthodologie', 'Résultats et discussion', 'Recommandations et perspectives'][i] || `Développement ${i + 1}`}`,
      emoji: ['📚', '🔬', '📊', '💡'][i] || '📌',
      preview: `Développement de l'aspect ${i + 1} du thème`,
      blocks: [
        { type: 'h2', content: `Présentation de la partie ${i + 1}` },
        { type: 'text', content: `Dans ce chapitre ${i + 1}, nous abordons un aspect essentiel de "${theme}". Cette partie développe les éléments clés nécessaires à la compréhension approfondie du sujet, en s'appuyant sur des références adaptées au niveau ${niveau}.` },
        { type: 'h2', content: 'Développement et analyse' },
        { type: 'text', content: `L'analyse menée dans cette section met en lumière les relations entre les différents éléments constitutifs du thème. Les observations issues de cette étude permettent d'établir des constats pertinents et de dégager des enseignements applicables dans le contexte professionnel.` },
        { type: 'h2', content: 'Synthèse partielle' },
        { type: 'text', content: `En synthèse, ce chapitre a permis d'explorer en détail les dimensions importantes de "${theme}". Les éléments présentés constituent un apport significatif à la compréhension globale du sujet et préparent le terrain pour les analyses suivantes.` },
      ],
    })),
    {
      id: 'conclusion',
      type: 'conclusion',
      title: 'Conclusion générale',
      emoji: '🎯',
      preview: 'Bilan, limites et perspectives du travail',
      blocks: [
        { type: 'h2', content: 'Synthèse des résultats' },
        { type: 'text', content: `Ce travail a permis d'explorer de manière approfondie le thème "${theme}" à travers ${safeCount} chapitres complémentaires. Les analyses conduites ont mis en évidence les enjeux majeurs et les dynamiques à l'œuvre dans ce domaine, offrant une vision structurée et documentée du sujet.` },
        { type: 'h2', content: 'Limites et perspectives' },
        { type: 'text', content: `Ce travail présente certaines limites inhérentes au cadre académique de niveau ${niveau}, notamment en termes d'accès aux données et de profondeur d'analyse. Des recherches futures pourraient approfondir certains aspects et explorer de nouvelles dimensions de cette thématique.` },
        { type: 'h2', content: 'Recommandations finales' },
        { type: 'text', content: `Au terme de cette étude, plusieurs recommandations peuvent être formulées pour les praticiens et chercheurs intéressés par "${theme}". Ces pistes d'action constituent des orientations concrètes pour enrichir la compréhension et la mise en pratique des enseignements issus de ce travail.` },
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

  const safeCount = Math.min(4, Math.max(2, Number(chapterCount) || 3))
  const promptText = buildPrompt(theme.trim(), docType, niveau, safeCount)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4096,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant académique expert. Tu génères UNIQUEMENT des objets JSON valides et complets, sans aucun texte avant ou après. Tu ne tronques jamais ta réponse.',
          },
          { role: 'user', content: promptText },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'unknown error')
      console.error('[Assistant] Groq error:', response.status, errText)
      // Return fallback instead of error
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

    // Tentative 1: parse direct
    let parsed: any = null
    try {
      parsed = JSON.parse(rawText)
    } catch {
      // Tentative 2: extraire le JSON avec regex
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch (e2) {
          console.error('[Assistant] JSON parse failed after regex:', e2)
        }
      }
    }

    // Vérifier que la structure contient des sections valides
    if (
      !parsed ||
      !Array.isArray(parsed.sections) ||
      parsed.sections.length === 0
    ) {
      console.error('[Assistant] Invalid structure, using fallback. Raw:', rawText.slice(0, 200))
      const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
      return NextResponse.json({ sections: fallback, remaining: rl.remaining, fallback: true })
    }

    // Valider et nettoyer chaque section
    const cleanedSections = parsed.sections
      .filter((s: any) => s && typeof s === 'object' && s.title)
      .map((s: any, idx: number) => ({
        id: s.id || `section-${idx}`,
        type: s.type || 'chapter',
        chapterNum: s.chapterNum,
        title: String(s.title || `Section ${idx + 1}`),
        emoji: s.emoji || '📌',
        preview: String(s.preview || ''),
        blocks: Array.isArray(s.blocks)
          ? s.blocks
              .filter((b: any) => b && b.type && b.content)
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

    return NextResponse.json({
      sections: cleanedSections,
      remaining: rl.remaining,
    })

  } catch (error) {
    console.error('[Assistant] Network/unexpected error:', error)
    // Toujours retourner un fallback utilisable plutôt qu'une erreur
    const fallback = buildFallbackSections(theme.trim(), docType, niveau, safeCount)
    return NextResponse.json({ sections: fallback, remaining: rl.remaining, fallback: true })
  }
}