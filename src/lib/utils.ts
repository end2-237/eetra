import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { 
  return twMerge(clsx(inputs)) 
}
export function generateDocId(): string { return 'EE-' + Math.random().toString(36).slice(2, 7).toUpperCase() }
export function generateId(): string { return Math.random().toString(36).slice(2, 10) }
export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
export function generateSignature(docId: string, entityName: string, timestamp: number): string {
  const input = `${docId}:${entityName}:${timestamp}`
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const abs = Math.abs(hash)
  const part1 = abs.toString(16).padStart(8, '0').toUpperCase()
  const part2 = (abs * 31337 & 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase()
  const part3 = ((abs ^ 0xDEADBEEF) & 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase()
  return `EESIG-${part1}-${part2}-${part3}`
}
export function buildQrUrl(docId: string, signature: string, size = 80): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eetra.app'
  const data = encodeURIComponent(`${appUrl}/verify/${docId}?sig=${signature}`)
  return `https://api.qrserver.com/v1/create-qr-code/?data=${data}&size=${size}x${size}&bgcolor=ffffff&color=111111&margin=4`
}
