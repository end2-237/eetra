'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'
import { 
  CheckCircle2, XCircle, AlertTriangle, Info, 
  Loader2, Bell, Download, Upload, Save,
  Trash2, Copy, Share2, Mail, Zap
} from 'lucide-react'

// Custom toaster component with EETRA styling
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontFamily: 'var(--font-bricolage, Bricolage Grotesque, sans-serif)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          borderRadius: '14px',
          padding: '14px 16px',
        },
        classNames: {
          toast: 'sonner-toast',
          title: 'sonner-title',
          description: 'sonner-description',
          actionButton: 'sonner-action',
          cancelButton: 'sonner-cancel',
          closeButton: 'sonner-close',
          success: 'sonner-success',
          error: 'sonner-error',
          warning: 'sonner-warning',
          info: 'sonner-info',
          loading: 'sonner-loading',
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />,
        error: <XCircle className="w-5 h-5 text-[var(--danger)]" />,
        warning: <AlertTriangle className="w-5 h-5 text-[var(--warn)]" />,
        info: <Info className="w-5 h-5 text-[var(--accent)]" />,
        loading: <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />,
      }}
      closeButton
      richColors
      expand
      visibleToasts={4}
      duration={4000}
    />
  )
}

// Custom notification functions for common EETRA actions
export const notify = {
  // Basic notifications
  success: (message: string, description?: string) => {
    toast.success(message, { description })
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, { description })
  },
  
  warning: (message: string, description?: string) => {
    toast.warning(message, { description })
  },
  
  info: (message: string, description?: string) => {
    toast.info(message, { description })
  },
  
  // Loading with promise
  loading: (message: string) => {
    return toast.loading(message)
  },
  
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
  
  // Promise-based notifications (great for async operations)
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },

  // Document-specific notifications
  document: {
    saved: () => toast.success('Document sauvegarde', {
      description: 'Vos modifications ont ete enregistrees.',
      icon: <Save className="w-5 h-5 text-[var(--success)]" />,
    }),
    
    exported: (format: 'pdf' | 'docx') => toast.success(`Export ${format.toUpperCase()} reussi`, {
      description: 'Votre document est pret au telechargement.',
      icon: <Download className="w-5 h-5 text-[var(--success)]" />,
    }),
    
    deleted: () => toast.success('Document supprime', {
      description: 'Le document a ete deplace vers la corbeille.',
      icon: <Trash2 className="w-5 h-5 text-[var(--text3)]" />,
    }),
    
    copied: () => toast.success('Copie effectuee', {
      description: 'Le contenu a ete copie dans le presse-papiers.',
      icon: <Copy className="w-5 h-5 text-[var(--accent)]" />,
    }),
    
    shared: () => toast.success('Lien copie', {
      description: 'Le lien de partage a ete copie.',
      icon: <Share2 className="w-5 h-5 text-[var(--accent)]" />,
    }),
    
    autoSaved: () => toast('Sauvegarde automatique', {
      description: 'Document sauvegarde il y a quelques secondes.',
      icon: <Save className="w-4 h-4 text-[var(--text4)]" />,
      duration: 2000,
    }),
    
    exportStarted: (format: 'pdf' | 'docx') => toast.loading(`Generation du ${format.toUpperCase()} en cours...`, {
      icon: <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />,
    }),
    
    uploadStarted: () => toast.loading('Telechargement en cours...', {
      icon: <Upload className="w-5 h-5 text-[var(--accent)]" />,
    }),
  },

  // Team & collaboration notifications
  team: {
    memberAdded: (name: string) => toast.success(`${name} a rejoint l'equipe`, {
      description: 'Un nouveau membre a ete ajoute.',
      icon: <Bell className="w-5 h-5 text-[var(--accent)]" />,
    }),
    
    memberRemoved: (name: string) => toast.info(`${name} a quitte l'equipe`, {
      icon: <Bell className="w-5 h-5 text-[var(--text3)]" />,
    }),
    
    inviteSent: (email: string) => toast.success('Invitation envoyee', {
      description: `Un email a ete envoye a ${email}.`,
      icon: <Mail className="w-5 h-5 text-[var(--accent)]" />,
    }),
  },

  // Plan & subscription notifications
  plan: {
    upgraded: (planName: string) => toast.success(`Plan ${planName} active !`, {
      description: 'Profitez de toutes les fonctionnalites.',
      icon: <Zap className="w-5 h-5 text-[var(--accent)]" />,
      duration: 5000,
    }),
    
    limitReached: () => toast.warning('Limite atteinte', {
      description: 'Passez au plan superieur pour continuer.',
      icon: <AlertTriangle className="w-5 h-5 text-[var(--warn)]" />,
      action: {
        label: 'Upgrader',
        onClick: () => window.location.href = '/settings#plan',
      },
    }),
    
    trialEnding: (days: number) => toast.info(`Essai gratuit`, {
      description: `Il vous reste ${days} jour${days > 1 ? 's' : ''} d'essai.`,
      icon: <Info className="w-5 h-5 text-[var(--accent)]" />,
    }),
  },

  // AI-specific notifications
  ai: {
    generating: () => toast.loading('L\'IA genere votre contenu...', {
      icon: <Zap className="w-5 h-5 text-[var(--accent)] animate-pulse" />,
    }),
    
    generated: () => toast.success('Contenu genere', {
      description: 'L\'IA a termine la generation.',
      icon: <Zap className="w-5 h-5 text-[var(--success)]" />,
    }),
    
    error: () => toast.error('Erreur de generation', {
      description: 'Veuillez reessayer dans quelques instants.',
      icon: <XCircle className="w-5 h-5 text-[var(--danger)]" />,
    }),
  },

  // Custom notification with action
  withAction: (
    message: string,
    actionLabel: string,
    actionFn: () => void,
    options?: { description?: string; type?: 'success' | 'error' | 'warning' | 'info' }
  ) => {
    const toastFn = options?.type ? toast[options.type] : toast
    toastFn(message, {
      description: options?.description,
      action: {
        label: actionLabel,
        onClick: actionFn,
      },
    })
  },

  // Undoable action
  undoable: (
    message: string,
    undoFn: () => void,
    options?: { description?: string; duration?: number }
  ) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: {
        label: 'Annuler',
        onClick: undoFn,
      },
    })
  },
}

// Re-export toast for direct usage
export { toast }
