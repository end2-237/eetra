import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { sanitizeField }             from '@/lib/sanitize'
import { rateLimit }                 from '@/lib/ratelimit'
import { prisma }                    from '@/lib/prisma'
import { generateText }              from 'ai'

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
  let remaining = dailyLimit
  if (dailyLimit !== Infinity) {
    const rateLimitKey = `ai-edit:user:${session.user.id}`
    const rl = await rateLimit(rateLimitKey, dailyLimit, RATE_WIN)
    
    if (!rl.allowed) {
      const hours = Math.ceil((rl.reset - Date.now()) / 3600000)
      return NextResponse.json(
        { 
          error: `Limite quotidienne atteinte (${dailyLimit}/${dailyLimit}). Réessayez dans ${hours}h.`,
          limitReached: true,
          remaining: 0,
        },
        { status: 429 }
      )
    }
    remaining = rl.remaining
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

  // Define system prompt
  const systemPrompt = `Tu es un assistant d'édition professionnel francophone. Ta mission est d'améliorer le texte fourni en:
1. Augmentant la CLARTÉ: reformule les phrases confuses, simplifie les structures complexes
2. Corrigeant les FAUTES: orthographe, grammaire, ponctuation, accords
3. Rendant le texte COHÉRENT: assure la fluidité entre les phrases, la logique du propos
4. Améliorant le STYLE: vocabulaire approprié, ton professionnel, formulations élégantes

IMPORTANT:
- Conserve le sens original du texte
- Garde la même longueur approximative
- Retourne UNIQUEMENT le texte amélioré, sans explication ni commentaire
- Ne change pas le format (listes, paragraphes, etc.)`

  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: `Améliore ce texte selon les 4 critères (clarté, fautes, cohérence, style):\n\n"${safeText}"`,
    })

    const improvedText = result.text?.trim() || ''

    return NextResponse.json({ 
      text: improvedText,
      remaining: dailyLimit === Infinity ? null : remaining - 1,
      limit: dailyLimit === Infinity ? null : dailyLimit,
    })
  } catch (err) {
    console.error('[EETRA AI Edit] Error:', err)
    return NextResponse.json({ error: 'Erreur du service IA.' }, { status: 503 })
  }
}
