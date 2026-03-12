import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateDocId(): string {
  return 'EE-' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
