import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'EETRA, une plateforme de création de documents professionnels pour l'Afrique de l'Ouest.

Tu aides les utilisateurs avec:
- La création de documents (Business Plans, Appels d'Offres, Rapports d'Audit, Devis, Contrats OHADA, Notes de Direction)
- L'utilisation de l'éditeur et des différents designs disponibles
- L'exportation en PDF et Word (.docx)
- Les fonctionnalités IA de rédaction
- La gestion de l'équipe et la collaboration
- Les templates et la personnalisation
- La gestion du compte et des plans tarifaires

Réponds toujours de manière claire, concise et professionnelle en français.
Si tu ne connais pas la réponse, invite l'utilisateur à contacter le support.
Sois amical et utilise un ton professionnel mais accessible.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
