import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Rate limit: 10 research/hour per user
  const rl = await rateLimit(`radar:${session.user.id}`, 10, 3600)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Limite de recherches atteinte (10/heure). Réessayez plus tard.' },
      { status: 429 }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Service IA non configuré' }, { status: 503 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const {
    title = 'Document sans titre',
    subtitle = '',
    entityName = 'Entreprise',
    chapters = 4,
    pages = 20,
    query = '',
    sector = '',
    type = 'general',
  } = body

  const contextPrompt = `
Tu es un expert consultant en stratégie d'entreprise, analyste sectoriel et chercheur académique spécialisé en Afrique de l'Ouest et marchés émergents. Tu dois produire une analyse documentaire complète et sourcée.

**CONTEXTE DU DOCUMENT :**
- Titre : "${title}"
- Sous-titre / objet : "${subtitle}"
- Entreprise / institution : "${entityName}"
- Secteur : "${sector || 'Non précisé'}"
- Type de document : "${type}"
- Structure cible : ${chapters} chapitres sur environ ${pages} pages
${query ? `- Angle de recherche spécifique : "${query}"` : ''}

**MISSION :**
Génère un rapport de recherche structuré et complet en JSON. Ce rapport doit contenir des données réelles, des statistiques pertinentes, des analyses sectorielles et une structure de document prête à être utilisée.

**RÈGLES ABSOLUES :**
1. Les données chiffrées doivent être crédibles et contextualisées pour le marché africain/UEMOA/CEMAC
2. Les tableaux doivent avoir des données réalistes (pas des placeholders générics)
3. Chaque section doit avoir du contenu substantiel et professionnel
4. Les sources doivent être réelles (organisations officielles, banques de données, etc.)
5. Adapter le registre au type de document (BP = stratégique, Audit = analytique, etc.)

**FORMAT DE RÉPONSE (JSON strict, sans markdown) :**
{
  "overview": {
    "title": "titre de l'analyse",
    "summary": "résumé exécutif de 2-3 phrases sur le contexte et l'opportunité",
    "keyInsight": "insight principal à retenir"
  },
  "sections": [
    {
      "id": "s1",
      "title": "Titre de la section",
      "icon": "emoji",
      "description": "description courte de la section",
      "blocks": [
        {
          "type": "h2",
          "content": "Titre du sous-bloc"
        },
        {
          "type": "text",
          "content": "Paragraphe de texte analytique professionnel avec données chiffrées. Au moins 3-4 phrases substantielles."
        },
        {
          "type": "table",
          "headers": ["Col1", "Col2", "Col3", "Col4"],
          "rows": [
            ["données", "données", "données", "données"],
            ["données", "données", "données", "données"],
            ["données", "données", "données", "données"]
          ]
        },
        {
          "type": "kpi",
          "items": [
            {"val": "valeur", "label": "indicateur"},
            {"val": "valeur", "label": "indicateur"},
            {"val": "valeur", "label": "indicateur"},
            {"val": "valeur", "label": "indicateur"}
          ]
        },
        {
          "type": "quote",
          "content": "Citation pertinente d'expert ou d'institution"
        }
      ]
    }
  ],
  "suggestedStructure": [
    {
      "chapter": 1,
      "title": "Titre chapitre 1",
      "sections": ["Section A", "Section B", "Section C"]
    }
  ],
  "sources": [
    {
      "name": "Nom complet de la source",
      "org": "Organisation émettrice",
      "year": "2024",
      "type": "officielle|académique|sectorielle|médias",
      "relevance": "pourquoi cette source est pertinente"
    }
  ]
}

Génère ${chapters} sections minimum avec des données très spécifiques au contexte "${title}" dans le secteur "${sector || 'général'}". Inclus au moins ${Math.min(pages, 8)} sources crédibles.
`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: 'Tu es un expert analyste. Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après le JSON. Pas de markdown, pas de commentaires.',
        messages: [{ role: 'user', content: contextPrompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('[Radar AI] Anthropic error:', err)
      return NextResponse.json({ error: 'Erreur du service IA' }, { status: 502 })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text?.trim() || '{}'

    let parsed: any
    try {
      // Extract JSON from response (handle potential text wrapping)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : rawText
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.error('[Radar AI] JSON parse error:', e, rawText.slice(0, 500))
      return NextResponse.json({ error: 'Format de réponse invalide' }, { status: 502 })
    }

    return NextResponse.json(
      {
        ...parsed,
        remaining: rl.remaining,
        meta: { title, chapters, pages, query },
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rl.reset / 1000)),
        },
      }
    )
  } catch (error) {
    console.error('[Radar AI] Network error:', error)
    return NextResponse.json({ error: 'Erreur réseau' }, { status: 503 })
  }
}