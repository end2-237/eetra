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