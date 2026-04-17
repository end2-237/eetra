import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

// ── Structure templates per doc type ──────────────────────────────────────────

const DOC_STRUCTURES: Record<string, (chapterCount: number) => string> = {
  'rapport-stage': (n) => `
Tu génères un RAPPORT DE STAGE de ${n} chapitres.
Structure obligatoire :
- Introduction générale : contexte de stage, présentation de l'entreprise d'accueil, motivations, objectifs du rapport, plan du document
- Chapitre 1 : Présentation de la structure d'accueil (historique, organisation, secteur d'activité, positionnement)
${Array.from({ length: n - 2 }, (_, i) => `- Chapitre ${i + 2} : contenu pertinent au thème du stage`).join('\n')}
- Dernier chapitre : Analyse critique, bilan des compétences acquises, difficultés rencontrées
- Conclusion générale : synthèse, apport personnel et professionnel, perspectives d'évolution`,

  'memoire': (n) => `
Tu génères un MÉMOIRE DE FIN D'ÉTUDES de ${n} chapitres.
Structure obligatoire :
- Introduction générale : contexte, énoncé de la problématique centrale, hypothèses de recherche, objectifs (général + spécifiques), justification, méthodologie, plan du mémoire
- Chapitre 1 : Revue de littérature — cadre théorique et conceptuel, état de l'art
- Chapitre 2 : Méthodologie de recherche — démarche, outils, population, collecte de données
${Array.from({ length: n - 3 }, (_, i) => `- Chapitre ${i + 3} : Résultats, analyse et discussion`).join('\n')}
- Conclusion générale : synthèse des résultats, vérification des hypothèses, limites, recommandations, perspectives`,

  'these': (n) => `
Tu génères une THÈSE DE DOCTORAT de ${n} parties.
Structure obligatoire :
- Introduction générale : contexte scientifique, problématique, hypothèses, objectifs, contributions originales, plan de la thèse
- Partie 1 : Fondements théoriques — revue systématique de littérature, cadre conceptuel
- Partie 2 : Cadre méthodologique — paradigme épistémologique, design de recherche, outils
${Array.from({ length: n - 3 }, (_, i) => `- Partie ${i + 3} : Résultats empiriques et discussion`).join('\n')}
- Conclusion générale : contributions théoriques et pratiques, limites, pistes de recherche futures`,

  'rapport-projet': (n) => `
Tu génères un RAPPORT DE PROJET de ${n} chapitres.
Structure obligatoire :
- Introduction : contexte du projet, problème identifié, objectifs SMART, périmètre et parties prenantes
- Chapitre 1 : Analyse des besoins et cahier des charges
- Chapitre 2 : Méthodologie et planification (Gantt, ressources)
${Array.from({ length: n - 3 }, (_, i) => `- Chapitre ${i + 3} : Réalisation, tests et résultats`).join('\n')}
- Conclusion : bilan du projet, livrables, recommandations`,

  'expose': (n) => `
Tu génères un EXPOSÉ ACADÉMIQUE de ${n} parties.
Structure obligatoire :
- Introduction : accroche, contextualisation, annonce de la problématique, plan de l'exposé
- Partie 1 : Cadre conceptuel — définitions, notions clés, état des connaissances
${Array.from({ length: n - 2 }, (_, i) => `- Partie ${i + 2} : développement argumenté avec exemples concrets`).join('\n')}
- Conclusion : synthèse, réponse à la problématique, ouverture`,
}

function buildPrompt(theme: string, docType: string, niveau: string, chapterCount: number): string {
  const structure = (DOC_STRUCTURES[docType] || DOC_STRUCTURES['expose'])(chapterCount)

  return `Tu es un expert académique africain spécialisé dans la rédaction de documents universitaires et professionnels pour la zone CEMAC/UEMOA.

THÈME DU DOCUMENT : "${theme}"
TYPE : ${docType}
NIVEAU ACADÉMIQUE : ${niveau}
NOMBRE DE CHAPITRES/PARTIES : ${chapterCount}

${structure}

Génère un contenu académique COMPLET et DÉTAILLÉ pour chaque section. Chaque paragraphe doit faire au minimum 5 phrases substantielles avec du contenu concret (données, exemples, analyses). Adapte au contexte africain quand c'est pertinent.

Réponds UNIQUEMENT avec ce JSON (pas de markdown, pas de texte avant ou après) :

{
  "sections": [
    {
      "id": "intro",
      "type": "introduction",
      "title": "Introduction générale",
      "emoji": "📝",
      "preview": "Résumé en 1 phrase de ce que contient cette introduction",
      "blocks": [
        { "type": "h2", "content": "Titre de sous-section 1.1" },
        { "type": "text", "content": "Paragraphe développé (5+ phrases)" },
        { "type": "h2", "content": "Titre de sous-section 1.2" },
        { "type": "text", "content": "Paragraphe développé (5+ phrases)" },
        { "type": "h2", "content": "Plan du document" },
        { "type": "text", "content": "Le présent document s'articule autour de..." }
      ]
    },
    {
      "id": "chap1",
      "type": "chapter",
      "chapterNum": 1,
      "title": "Titre complet et descriptif du chapitre 1",
      "emoji": "📊",
      "preview": "Résumé en 1 phrase de ce que contient ce chapitre",
      "blocks": [
        { "type": "section", "content": "CHAPITRE 1 // TITRE EN MAJUSCULES" },
        { "type": "h2", "content": "Section 1.1 : Titre" },
        { "type": "text", "content": "Contenu développé (5+ phrases)" },
        { "type": "h2", "content": "Section 1.2 : Titre" },
        { "type": "text", "content": "Contenu développé (5+ phrases)" },
        { "type": "h3", "content": "Sous-section si pertinent" },
        { "type": "text", "content": "Contenu (3+ phrases)" }
      ]
    },
    {
      "id": "conclusion",
      "type": "conclusion",
      "title": "Conclusion générale",
      "emoji": "🎯",
      "preview": "Résumé en 1 phrase de la conclusion",
      "blocks": [
        { "type": "h2", "content": "Synthèse des principaux résultats" },
        { "type": "text", "content": "Contenu (5+ phrases)" },
        { "type": "h2", "content": "Limites et recommandations" },
        { "type": "text", "content": "Contenu (4+ phrases)" },
        { "type": "h2", "content": "Perspectives" },
        { "type": "text", "content": "Contenu (3+ phrases)" }
      ]
    }
  ]
}

RÈGLES IMPÉRATIVES :
1. Génère EXACTEMENT ${chapterCount} chapitres/parties entre l'introduction et la conclusion
2. Le contenu doit être RÉEL, détaillé, académiquement rigoureux — pas de placeholders
3. Adapte le vocabulaire au thème : "${theme}"
4. Pour chaque chapitre, génère au minimum 3 sections H2 avec des paragraphes substantiels
5. JSON valide uniquement`
}

// ── Groq API call (free, fast, powerful — llama-3.3-70b) ─────────────────────

async function callGroq(prompt: string, apiKey: string | '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'): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert académique. Tu réponds UNIQUEMENT en JSON valide sans markdown ni texte avant/après le JSON. Pas de markdown, pas de commentaires.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Groq API error ${response.status}: ${JSON.stringify(err)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || '{}'
}

// ── Google Gemini Flash fallback (also free) ──────────────────────────────────

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
        },
        systemInstruction: {
          parts: [{ text: 'Tu es un expert académique. Tu réponds UNIQUEMENT en JSON valide sans markdown ni texte avant/après.' }],
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(err)}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}'
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const rl = await rateLimit(`doc-assistant:${session.user.id}`, 8, 3600)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Limite atteinte (8 générations/heure). Réessayez plus tard.' },
      { status: 429 }
    )
  }

  // ── Pick available API key (Groq first, Gemini fallback, Anthropic last) ────
  const groqKey    = process.env.GROQ_API_KEY
  const geminiKey  = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!groqKey && !geminiKey && !anthropicKey) {
    return NextResponse.json(
      {
        error: 'Service IA non configuré. Ajoutez GROQ_API_KEY (gratuit sur console.groq.com) dans vos variables d\'environnement.',
      },
      { status: 503 }
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const {
    theme,
    docType = 'rapport-stage',
    niveau = 'Licence',
    chapterCount = 4,
  } = body

  if (!theme || String(theme).trim().length < 5) {
    return NextResponse.json({ error: 'Thème trop court (min. 5 caractères)' }, { status: 400 })
  }

  const safeChapterCount = Math.min(7, Math.max(2, Number(chapterCount) || 4))
  const promptText = buildPrompt(String(theme).trim(), docType, niveau, safeChapterCount)

  let rawText = '{}'

  try {
    // Try Groq first (fastest + most capable free tier)
    if (groqKey) {
      rawText = await callGroq(promptText, groqKey)
    }
    // Fallback to Gemini
    else if (geminiKey) {
      rawText = await callGemini(promptText, geminiKey)
    }
    // Last resort: Anthropic
    else if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          system: 'Tu es un expert académique. Tu réponds UNIQUEMENT en JSON valide sans markdown ni texte avant/après le JSON.',
          messages: [{ role: 'user', content: promptText }],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(`Anthropic error: ${JSON.stringify(err)}`)
      }

      const data = await response.json()
      rawText = data.content?.[0]?.text?.trim() || '{}'
    }
  } catch (error) {
    console.error('[Document Assistant] API error:', error)
    return NextResponse.json({ error: 'Erreur du service IA. Vérifiez votre clé GROQ_API_KEY.' }, { status: 502 })
  }

  let parsed: any
  try {
    const match = rawText.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(match ? match[0] : rawText)
  } catch (e) {
    console.error('[Document Assistant] JSON parse error:', rawText.slice(0, 300))
    return NextResponse.json({ error: 'Format de réponse invalide' }, { status: 502 })
  }

  return NextResponse.json({
    ...parsed,
    remaining: rl.remaining,
  })
}