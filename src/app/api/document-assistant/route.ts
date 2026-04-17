import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

// --- TEMPLATES SIMPLIFIÉS POUR ÉCONOMISER DES TOKENS ---
const DOC_STRUCTURES: Record<string, (chapterCount: number) => string> = {
  'rapport-stage': (n) => `Rapport de stage (${n} chap). Intro, Présentation entreprise, ${n-2} chapitres techniques, Bilan, Conclusion.`,
  'memoire': (n) => `Mémoire (${n} chap). Intro, Revue littérature, Méthodologie, ${n-3} chapitres résultats, Conclusion.`,
  'rapport-projet': (n) => `Rapport projet (${n} chap). Intro, Analyse besoins, Planification, ${n-3} chapitres réalisation, Conclusion.`,
  'expose': (n) => `Exposé (${n} parties). Intro, Cadre théorique, ${n-2} parties développement, Conclusion.`,
}

function buildPrompt(theme: string, docType: string, niveau: string, chapterCount: number): string {
  const structure = (DOC_STRUCTURES[docType] || DOC_STRUCTURES['expose'])(chapterCount)

  return `Tu es un expert académique. Génère un document structuré en JSON.
THÈME : "${theme}"
TYPE : ${docType}
NIVEAU : ${niveau}
STRUCTURE : ${structure}

CONSIGNES :
1. Génère exactement ${chapterCount} chapitres entre l'intro et la conclusion.
2. Chaque paragraphe ("text") doit être de 3-4 phrases denses. 
3. Réponds EXCLUSIVEMENT en JSON pur sans texte autour.`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const rl = await rateLimit(`doc-assistant:${session.user.id}`, 10, 3600)
  if (!rl.allowed) return NextResponse.json({ error: 'Limite atteinte' }, { status: 429 })

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ error: 'Configuration manquante' }, { status: 503 })

  try {
    const { theme, docType = 'rapport-stage', niveau = 'Licence', chapterCount = 4 } = await req.json()
    
    // IMPORTANT : On limite à 4 chapitres max pour Groq pour éviter les coupures de texte
    const safeCount = Math.min(4, Math.max(2, Number(chapterCount) || 3))
    const promptText = buildPrompt(theme, docType, niveau, safeCount)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4096,
        temperature: 0.3, // Température basse pour un JSON parfait
        response_format: { type: "json_object" }, // FORCE Groq à sortir du JSON
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant qui génère uniquement des objets JSON. Pas de texte, pas de markdown.',
          },
          { role: 'user', content: promptText },
        ],
      }),
    })

    if (!response.ok) throw new Error('Groq Down')

    const data = await response.json()
    const rawText = data.choices?.[0]?.message?.content || '{}'

    // Parsing sécurisé
    let parsedData: any
    try {
      parsedData = JSON.parse(rawText)
    } catch (parseError) {
      // Tentative de récupération si le JSON est légèrement mal formé
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) {
        parsedData = JSON.parse(match[0])
      } else {
        throw new Error('Format JSON irrécupérable')
      }
    }

    return NextResponse.json({
      ...parsedData,
      remaining: rl.remaining
    })

  } catch (error) {
    console.error('[Assistant] Error:', error)
    return NextResponse.json({ 
      error: 'Le document est trop volumineux. Essayez de réduire le nombre de chapitres.' 
    }, { status: 502 })
  }
}