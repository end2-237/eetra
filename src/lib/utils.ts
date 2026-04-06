import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitaire indispensable pour fusionner les classes Tailwind (Shadcn UI)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Affiche une notification (Toast)
 * @param message - Le texte à afficher
 * @param type - Le style du toast ('ok' pour succès, 'error' pour erreur)
 */
export function showToast(message: string, type: 'ok' | 'error' = 'ok') {
  // On utilise un CustomEvent pour communiquer avec le composant Toast global
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-toast', { 
      detail: { message, type } 
    });
    window.dispatchEvent(event);
  }
  
  // Log de secours en console
  if (type === 'error') {
    console.error(`[Toast]: ${message}`);
  } else {
    console.log(`[Toast]: ${message}`);
  }
}

/**
 * Génère un ID aléatoire court (ex: pour TeamContext)
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Génère les initiales à partir d'un nom (ex: "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Génère un ID unique pour les documents (ex: doc_kzi4p9m_2j8s)
 */
export function generateDocId(): string {
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}