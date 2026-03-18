export async function generateIntroduction(entityName: string, title: string): Promise<string[]> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityName, title, action: 'intro' }),
  })
  if (!response.ok) {
    if (response.status === 429) throw new Error('Limite de requêtes atteinte. Réessayez dans une heure.')
    throw new Error('Erreur API IA')
  }
  const data = await response.json()
  return data.paragraphs as string[]
}

export async function professionalizeText(text: string): Promise<string> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, action: 'professionalize' }),
  })
  if (!response.ok) {
    if (response.status === 429) throw new Error('Limite de requêtes atteinte.')
    throw new Error('Erreur API IA')
  }
  const data = await response.json()
  return data.text as string
}
