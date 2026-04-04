import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utilitaire indispensable pour shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// L'utilitaire qu'il te manque pour ton TeamContext
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// Genere les initiales a partir d'un nom (ex: "John Doe" -> "JD")
export function getInitials(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Genere un ID unique pour les documents
export function generateDocId(): string {
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}
