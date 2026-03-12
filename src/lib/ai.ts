export async function generateIntroduction(
  entityName: string,
  title: string
): Promise<string[]> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityName, title, action: 'intro' }),
  })
  if (!response.ok) throw new Error('API error')
  const data = await response.json()
  return data.paragraphs as string[]
}

export async function professionalizeText(text: string): Promise<string> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, action: 'professionalize' }),
  })
  if (!response.ok) throw new Error('API error')
  const data = await response.json()
  return data.text as string
}
