import { NextRequest, NextResponse } from 'next/server'
import { sanitizeField } from '@/lib/sanitize'

// Simple in-memory rate limiter (per-IP, resets every hour)
// Replace with Redis-based limiter in production
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20       // max requests per window
const RATE_WINDOW = 60 * 60 * 1000  // 1 hour in ms

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count }
}

// Cleanup old entries every 1000 requests to prevent memory leak
let requestCount = 0
function maybeCleanup() {
  requestCount++
  if (requestCount % 1000 === 0) {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }
}

export async function POST(req: NextRequest) {
  maybeCleanup()

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req)
  const { allowed, remaining } = checkRateLimit(rateLimitKey)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une heure.' },
      {
        status: 429,
        headers: {
          'Retry-After': '3600',
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, entityName, title, text } = body

  // Input validation
  if (!action || typeof action !== 'string') {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 })
  }

  // Sanitize inputs
  const safeEntityName = sanitizeField(entityName || 'l\'entreprise')
  const safeTitle = sanitizeField(title || 'ce document')
  const safeText = text ? sanitizeField(text).slice(0, 2000) : ''

  const responseHeaders = {
    'X-RateLimit-Limit': String(RATE_LIMIT),
    'X-RateLimit-Remaining': String(remaining),
    'Cache-Control': 'no-store',
  }

  if (action === 'intro') {
    // Validate entity name and title are non-empty after sanitization
    if (!safeEntityName || !safeTitle) {
      return NextResponse.json({ error: 'Entity name and title required' }, { status: 400 })
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
          max_tokens: 900,
          system: 'Expert en rédaction corporate francophone. Rédige uniquement le contenu demandé, style formel et professionnel, sans preamble, sans HTML.',
          messages: [{
            role: 'user',
            content: `Rédige une introduction professionnelle en 3 paragraphes (séparés par ligne vide) pour un document corporate intitulé "${safeTitle}" pour l'entité "${safeEntityName}". P1: contexte et enjeux. P2: objectifs du document. P3: structure et méthodologie. Commence directement le texte.`
          }],
        }),
      })

      if (!response.ok) {
        const errBody = await response.text()
        console.error('[EETRA AI] Anthropic error:', response.status, errBody)
        return NextResponse.json({ error: 'AI service error' }, { status: 502, headers: responseHeaders })
      }

      const data = await response.json()
      const rawText = data.content?.[0]?.text?.trim() || ''
      const paragraphs = rawText.split(/\n\n+/).filter(Boolean)
      return NextResponse.json({ paragraphs }, { headers: responseHeaders })
    } catch (err) {
      console.error('[EETRA AI] Network error:', err)
      return NextResponse.json({ error: 'Network error' }, { status: 503, headers: responseHeaders })
    }
  }

  if (action === 'professionalize') {
    if (!safeText || safeText.length < 10) {
      return NextResponse.json({ error: 'Text too short (min 10 chars)' }, { status: 400 })
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
          max_tokens: 600,
          system: 'Expert rédactionnel corporate francophone. Reformule en langage formel d\'entreprise. Retourne uniquement le texte reformulé.',
          messages: [{ role: 'user', content: `Reformule en langage formel: "${safeText}"` }],
        }),
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'AI service error' }, { status: 502, headers: responseHeaders })
      }

      const data = await response.json()
      const reformulated = data.content?.[0]?.text?.trim() || ''
      return NextResponse.json({ text: reformulated }, { headers: responseHeaders })
    } catch {
      return NextResponse.json({ error: 'Network error' }, { status: 503, headers: responseHeaders })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
