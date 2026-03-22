import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { sanitizeField }             from '@/lib/sanitize'
import { rateLimit, getClientIp }    from '@/lib/ratelimit'
import { prisma }                    from '@/lib/prisma'

const RATE_LIMIT = 20       // per window
const RATE_WIN   = 3600     // 1 hour in seconds

export async function POST(req: NextRequest) {
  // ── Rate limiting (Redis-distributed) ──────────────────────────────────────
  const session = await getServerSession(authOptions)

  // Use userId when logged in (better precision), else IP
  const rateLimitKey = session?.user?.id
    ? `ai:user:${session.user.id}`
    : `ai:ip:${getClientIp(req)}`

  const { allowed, remaining, reset, source } = await rateLimit(rateLimitKey, RATE_LIMIT, RATE_WIN)

  const rlHeaders = {
    'X-RateLimit-Limit':     String(RATE_LIMIT),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset':     String(Math.ceil(reset / 1000)),
    'X-RateLimit-Source':    source,
    'Cache-Control':         'no-store',
  }

  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une heure.' },
      { status: 429, headers: { ...rlHeaders, 'Retry-After': '3600' } },
    )
  }

  // ── Server-side AI access check ────────────────────────────────────────────
  // Anonymous users can use AI up to the rate limit, but logged-in users
  // without a Pro/Business plan get a specific error after 3 requests/hour.
  if (session?.user?.id) {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { planId: true },
    })
    const planId = profile?.planId ?? 'starter'
    const AI_PLANS = ['pro', 'business', 'enterprise']

    if (!AI_PLANS.includes(planId)) {
      // Allow 3 free AI calls per hour for starter users
      const freeKey = `ai:free:${session.user.id}`
      const freeLimitResult = await rateLimit(freeKey, 3, RATE_WIN)
      if (!freeLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Limite gratuite atteinte (3/heure). Passez au Plan Pro pour l\'IA illimitée.' },
          { status: 403, headers: rlHeaders },
        )
      }
    }
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, entityName, title, text } = body

  if (!action || typeof action !== 'string') {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 })
  }

  const safeEntityName = sanitizeField(entityName || 'l\'entreprise')
  const safeTitle      = sanitizeField(title      || 'ce document')
  const safeText       = text ? sanitizeField(text).slice(0, 2000) : ''

  // ── Action: intro ──────────────────────────────────────────────────────────
  if (action === 'intro') {
    if (!safeEntityName || !safeTitle) {
      return NextResponse.json({ error: 'Entity name and title required' }, { status: 400 })
    }
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-api-key':       apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 900,
          system:     'Expert en rédaction corporate francophone. Rédige uniquement le contenu demandé, style formel et professionnel, sans preamble, sans HTML.',
          messages: [{
            role:    'user',
            content: `Rédige une introduction professionnelle en 3 paragraphes (séparés par ligne vide) pour un document corporate intitulé "${safeTitle}" pour l'entité "${safeEntityName}". P1: contexte et enjeux. P2: objectifs du document. P3: structure et méthodologie. Commence directement le texte.`,
          }],
        }),
      })

      if (!response.ok) {
        console.error('[EETRA AI] Anthropic error:', response.status)
        return NextResponse.json({ error: 'AI service error' }, { status: 502, headers: rlHeaders })
      }

      const data       = await response.json()
      const rawText    = data.content?.[0]?.text?.trim() || ''
      const paragraphs = rawText.split(/\n\n+/).filter(Boolean)
      return NextResponse.json({ paragraphs }, { headers: rlHeaders })
    } catch (err) {
      console.error('[EETRA AI] Network error:', err)
      return NextResponse.json({ error: 'Network error' }, { status: 503, headers: rlHeaders })
    }
  }

  // ── Action: professionalize ────────────────────────────────────────────────
  if (action === 'professionalize') {
    if (!safeText || safeText.length < 10) {
      return NextResponse.json({ error: 'Text too short (min 10 chars)' }, { status: 400 })
    }
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-api-key':       apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 600,
          system:     'Expert rédactionnel corporate francophone. Reformule en langage formel d\'entreprise. Retourne uniquement le texte reformulé.',
          messages: [{ role: 'user', content: `Reformule en langage formel: "${safeText}"` }],
        }),
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'AI service error' }, { status: 502, headers: rlHeaders })
      }

      const data        = await response.json()
      const reformulated = data.content?.[0]?.text?.trim() || ''
      return NextResponse.json({ text: reformulated }, { headers: rlHeaders })
    } catch {
      return NextResponse.json({ error: 'Network error' }, { status: 503, headers: rlHeaders })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
