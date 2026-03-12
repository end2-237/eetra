import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, entityName, title, text } = body

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  if (action === 'intro') {
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
          content: `Rédige une introduction professionnelle en 3 paragraphes (séparés par ligne vide) pour un document corporate intitulé "${title}" pour l'entité "${entityName}". P1: contexte et enjeux. P2: objectifs du document. P3: structure et méthodologie. Commence directement le texte.`
        }],
      }),
    })
    const data = await response.json()
    const rawText = data.content?.[0]?.text?.trim() || ''
    const paragraphs = rawText.split(/\n\n+/).filter(Boolean)
    return NextResponse.json({ paragraphs })
  }

  if (action === 'professionalize') {
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
        messages: [{ role: 'user', content: `Reformule en langage formel: "${text}"` }],
      }),
    })
    const data = await response.json()
    const reformulated = data.content?.[0]?.text?.trim() || ''
    return NextResponse.json({ text: reformulated })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
