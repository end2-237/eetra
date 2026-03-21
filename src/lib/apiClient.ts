// Helper générique pour les appels API depuis les contextes
// Gère les erreurs silencieusement (localStorage reste la source immédiate)

export async function apiFetch<T>(
    url: string,
    options?: RequestInit
  ): Promise<T | null> {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      })
      if (!res.ok) return null
      return res.json()
    } catch {
      return null
    }
  }
  
  // Debounce pour éviter trop d'appels lors d'éditions rapides
  export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), ms)
    }
  }