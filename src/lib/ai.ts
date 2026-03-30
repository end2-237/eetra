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

export async function generateCoverStyle(
  imageBlob: Blob,
  description: string,
  currentTitle: string
): Promise<{ layout: string; accentColor: string; suggestedTitle: string; rationale: string }> {
  const formData = new FormData()
  formData.append('image', imageBlob)
  formData.append('description', description)
  formData.append('currentTitle', currentTitle)

  const response = await fetch('/api/ai/generate-cover', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    if (response.status === 403) throw new Error('Cette fonctionnalité est réservée aux utilisateurs PRO')
    if (response.status === 429) throw new Error('Limite de requêtes atteinte. Réessayez dans une heure.')
    throw new Error(error.error || 'Erreur lors de la génération')
  }

  const data = await response.json()
  return data as { layout: string; accentColor: string; suggestedTitle: string; rationale: string }
}
