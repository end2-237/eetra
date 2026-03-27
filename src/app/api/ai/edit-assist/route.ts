import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { sanitizeField }             from '@/lib/sanitize'
import { rateLimit, getClientIp }    from '@/lib/ratelimit'
import { prisma }                    from '@/lib/prisma'

// Daily limits per plan
const DAILY_LIMITS: Record<string, number> = {
  starter:  0,    // Inaccessible
  student:  3,    // 3 messages/day
  pro:      10,   // 10 messages/day
  business: Infinity, // Unlimited
  enterprise: Infinity,
}

const RATE_WIN = 86400 // 24 hours in seconds

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // Must be logged in
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Connexion requise pour utiliser cette fonctionnalité.' },
      { status: 401 }
    )
  }

  // Get user's plan
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { planId: true },
  })
  const planId = profile?.planId ?? 'starter'
  
  // Check if plan has access
  const dailyLimit = DAILY_LIMITS[planId] ?? 0
  
  if (dailyLimit === 0) {
    return NextResponse.json(
      { 
        error: 'Cette fonctionnalité n\'est pas disponible sur le plan Gratuit. Passez au plan Étudiant ou supérieur.',
        needsUpgrade: true,
        currentPlan: planId,
      },
      { status: 403 }
    )
  }

  // Rate limit by user (daily)
  if (dailyLimit !== Infinity) {
    const rateLimitKey = `ai-edit:user:${session.user.id}`
    const { allowed, remaining, reset } = await rateLimit(rateLimitKey, dailyLimit, RATE_WIN)
    
    if (!allowed) {
      const resetDate = new Date(reset)
      const hours = Math.ceil((reset - Date.now()) / 3600000)
      return NextResponse.json(
        { 
          error: `Limite quotidienne atteinte (${dailyLimit}/${dailyLimit}). Réessayez dans ${hours}h.`,
          limitReached: true,
          remaining: 0,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } }
      )
    }

    // Add remaining count to response headers
    const headers = {
      'X-RateLimit-Limit': String(dailyLimit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
    }
  }

  // Parse body
  let body: { text?: string; action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { text, action = 'improve' } = body

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return NextResponse.json({ error: 'Le texte doit contenir au moins 5 caractères.' }, { status: 400 })
  }

  const safeText = sanitizeField(text).slice(0, 3000)
  
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Service IA non configuré.' }, { status: 503 })
  }

  // Define system prompt based on action
  const systemPrompts: Record<string, string> = {
    improve: `Tu es un assistant d'édition professionnel francophone. Ta mission est d'améliorer le texte fourni en:
1. Augmentant la CLARTÉ: reformule les phrases confuses, simplifie les structures complexes
2. Corrigeant les FAUTES: orthographe, grammaire, ponctuation, accords
3. Rendant le texte COHÉRENT: assure la fluidité entre les phrases, la logique du propos
4. Améliorant le STYLE: vocabulaire approprié, ton professionnel, formulations élégantes

IMPORTANT:
- Conserve le sens original du texte
- Garde la même longueur approximative
- Retourne UNIQUEMENT le texte amélioré, sans explication ni commentaire
- Ne change pas le format (listes, paragraphes, etc.)`,
  }

  const userPrompts: Record<string, string> = {
    improve: `Améliore ce texte selon les 4 critères (clarté, fautes, cohérence, style):\n\n"${safeText}"`,
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
        system: systemPrompts[action] || systemPrompts.improve,
        messages: [{ role: 'user', content: userPrompts[action] || userPrompts.improve }],
      }),
    })

    if (!response.ok) {
      console.error('[EETRA AI Edit] Anthropic error:', response.status)
      return NextResponse.json({ error: 'Erreur du service IA.' }, { status: 502 })
    }

    const data = await response.json()
    const improvedText = data.content?.[0]?.text?.trim() || ''
    
    // Get updated remaining count
    const rateLimitKey = `ai-edit:user:${session.user.id}`
    const { remaining } = await rateLimit(rateLimitKey, dailyLimit, RATE_WIN)

    return NextResponse.json({ 
      text: improvedText,
      remaining: dailyLimit === Infinity ? null : remaining,
      limit: dailyLimit === Infinity ? null : dailyLimit,
    })
  } catch (err) {
    console.error('[EETRA AI Edit] Network error:', err)
    return NextResponse.json({ error: 'Erreur réseau.' }, { status: 503 })
  }
}
