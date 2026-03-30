import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'
import { prisma } from '@/lib/prisma'

const RATE_LIMIT = 10
const RATE_WIN = 3600

export async function POST(req: NextRequest) {
  // ── Authentication ────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Check PRO plan ────────────────────────────────────────────────────────
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { planId: true },
  })
  const planId = profile?.planId ?? 'starter'
  const PRO_PLANS = ['pro', 'business', 'enterprise']
  if (!PRO_PLANS.includes(planId)) {
    return NextResponse.json(
      { error: 'Cette fonctionnalité est réservée aux utilisateurs PRO' },
      { status: 403 }
    )
  }

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const rateLimitKey = `ai:cover:${session.user.id}`
  const { allowed, remaining, reset } = await rateLimit(rateLimitKey, RATE_LIMIT, RATE_WIN)

  const rlHeaders = {
    'X-RateLimit-Limit': String(RATE_LIMIT),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
  }

  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429, headers: { ...rlHeaders, 'Retry-After': '3600' } }
    )
  }

  // ── Parse request ──────────────────────────────────────────────────────────
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { imageBase64, description, currentTitle } = body

  if (!imageBase64 || !description) {
    return NextResponse.json(
      { error: 'Image and description are required' },
      { status: 400 }
    )
  }

  try {
    // Call OpenAI API with vision to analyze the image
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Tu es un expert en design de couvertures de documents professionnels.

Analyse l'image d'inspiration fournie et la description pour générer un style de couverture professionnel.

Description: ${description}
Titre actuel: ${currentTitle || 'Titre du Document'}

Réponds UNIQUEMENT avec un objet JSON valide (pas de texte avant/après):
{
  "layout": "classic",
  "accentColor": "#1B4FD8",
  "suggestedTitle": "Titre Professionnel",
  "showLogo": true,
  "showQr": true,
  "titleSize": "lg",
  "rationale": "Explication brève"
}

Règles:
- layout: classic (élégant), bold (fort), minimal (épuré), split (biparti)
- accentColor: Couleur dominante professionnelle en format hex
- suggestedTitle: Titre amélioré ou conserve le titre existant
- showLogo/showQr: true ou false
- titleSize: sm, md, lg ou xl
- Valide JSON uniquement`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[EETRA AI Cover] OpenAI error:', error)
      return NextResponse.json(
        { error: 'AI service error' },
        { status: 502, headers: rlHeaders }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    
    // Parse JSON from response
    let coverData
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      coverData = JSON.parse(jsonStr)
    } catch (e) {
      console.error('[EETRA AI Cover] JSON parse error:', e)
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 502, headers: rlHeaders }
      )
    }

    // Validate response
    if (!coverData.layout || !coverData.accentColor || !coverData.suggestedTitle) {
      return NextResponse.json(
        { error: 'Incomplete response from AI' },
        { status: 502, headers: rlHeaders }
      )
    }

    return NextResponse.json(coverData, { headers: rlHeaders })
  } catch (error) {
    console.error('[EETRA AI Cover] Error:', error)
    return NextResponse.json(
      { error: 'Network error' },
      { status: 503, headers: rlHeaders }
    )
  }
}
