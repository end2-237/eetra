// Client-side plan token utilities
// Tokens are signed server-side via /api/plan/token
// and validated by the API — never trust client-side state alone

export interface PlanToken {
  plan: string
  iat: number   // issued at (unix ms)
  exp: number   // expires at (unix ms)
  sig: string   // HMAC-SHA256 hex
}

const TOKEN_KEY = 'eetra_plan_token'

export function getPlanToken(): PlanToken | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    const token = JSON.parse(raw) as PlanToken
    // Basic expiry check (server will double-check)
    if (Date.now() > token.exp) {
      sessionStorage.removeItem(TOKEN_KEY)
      return null
    }
    return token
  } catch {
    return null
  }
}

export function setPlanToken(token: PlanToken): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token))
  } catch {}
}

export function clearPlanToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {}
}

// Request a new signed token from the server
export async function requestPlanToken(planId: string): Promise<PlanToken | null> {
  try {
    const res = await fetch('/api/plan/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.token) {
      setPlanToken(data.token)
      return data.token
    }
    return null
  } catch {
    return null
  }
}

// Verify token is valid by calling server
export async function verifyPlanToken(token: PlanToken): Promise<boolean> {
  try {
    const res = await fetch('/api/plan/token', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.valid === true
  } catch {
    return false
  }
}
