import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sanitizeField } from '@/lib/sanitize'
import { rateLimit, getClientIp } from '@/lib/ratelimit'
import { prisma } from '@/lib/prisma'

const RATE_LIMIT = 10 // per window
const RATE_WIN = 3600 // 1 hour in seconds

export async function POST(req: NextRequest) {
  // ── Authentication & Authorization ─────────────────────────────────────────
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Check PRO plan
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
  const { allowed, remaining, reset, source } = await rateLimit(rateLimitKey, RATE_LIMIT, RATE_WIN)

  const rlHeaders = {
    'X-RateLimit-Limit': String(RATE_LIMIT),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
    'X-RateLimit-Source': source,
    'Cache-Control': 'no-store',
  }

  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429, headers: { ...rlHeaders, 'Retry-After': '3600' } }
    )
  }

  // ── Parse multipart form data ──────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const imageBlob = formData.get('image') as Blob | null
  const description = (formData.get('description') as string) || ''
  const currentTitle = (formData.get('currentTitle') as string) || ''

  if (!imageBlob || imageBlob.size === 0) {
    return NextResponse.json({ error: 'Image is required' }, { status: 400 })
  }

  if (!description || description.trim().length < 10) {
    return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 })
  }

  const safeDesc = sanitizeField(description).slice(0, 500)
  const safeTitle = sanitizeField(currentTitle).slice(0, 200)

  // ── Convert blob to base64 ─────────────────────────────────────────────────
  const buffer = await imageBlob.arrayBuffer()
  const base64Image = Buffer.from(buffer).toString('base64')
  const imageMediaType = imageBlob.type || 'image/jpeg'

  // ── Call AI to generate cover style ────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

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
        max_tokens: 1500,
        system: `Tu es un expert en design de couvertures de documents professionnels. Analyze l'image fournie et la description pour générer un style de couverture cohérent.

Réponds UNIQUEMENT avec un objet JSON valide (pas de texte avant/après). Le JSON doit avoir cette structure exacte:
{
  "layout": "classic" | "bold" | "minimal" | "split",
  "accentColor": "#XXXXXX (couleur hex)",
  "suggestedTitle": "Titre professionnel basé sur la description ou conservation du titre existant",
  "rationale": "Brève explication du choix"
}

Règles:
- layout: Choisir selon le style de l'image. 'classic' = élégant avec barre latérale, 'bold' = design fort avec fond coloré, 'minimal' = épuré, 'split' = biparti
- accentColor: Extraire une couleur dominante de l'image, cohérente avec le contexte professionnel
- suggestedTitle: Si le titre existant est bon, le conserver. Sinon, créer un titre professionnel basé sur la description
- Assurer que le résultat est du JSON valide`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageMediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Description du document: "${safeDesc}"
${safeTitle ? `Titre existant: "${safeTitle}" (peut être conservé si approprié)` : ''}

Génère un style de couverture professionnelle basé sur cette image d'inspiration.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('[EETRA AI Cover] Anthropic error:', response.status)
      return NextResponse.json(
        { error: 'AI service error' },
        { status: 502, headers: rlHeaders }
      )
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text?.trim() || '{}'

    // Try to parse JSON response
    let coverData
    try {
      // Extract JSON if there's surrounding text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : rawText
      coverData = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('[EETRA AI Cover] JSON parse error:', parseErr)
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 502, headers: rlHeaders }
      )
    }

    // Validate response structure
    if (!coverData.layout || !coverData.accentColor || !coverData.suggestedTitle) {
      return NextResponse.json(
        { error: 'Incomplete AI response' },
        { status: 502, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      {
        layout: coverData.layout,
        accentColor: coverData.accentColor,
        suggestedTitle: coverData.suggestedTitle,
        rationale: coverData.rationale || '',
      },
      { headers: rlHeaders }
    )
  } catch (err) {
    console.error('[EETRA AI Cover] Error:', err)
    return NextResponse.json(
      { error: 'Network error' },
      { status: 503, headers: rlHeaders }
    )
  }
}
