'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  FileText, Sparkles, Download, Users, BarChart3, 
  Palette, Layers, Shield, Zap, Clock, Lightbulb,
  CheckCircle2, Target, TrendingUp, Award
} from 'lucide-react'

// Tips grouped by context
const TIPS = {
  general: [
    {
      icon: FileText,
      title: 'Documents professionnels',
      description: 'Creez des business plans, audits et contrats conformes aux standards OHADA.',
    },
    {
      icon: Sparkles,
      title: 'IA Redactionnelle',
      description: 'Utilisez l\'assistant IA pour generer des introductions et reformuler vos textes.',
    },
    {
      icon: Palette,
      title: 'Charte graphique',
      description: 'Personnalisez vos documents avec votre logo, couleurs et coordonnees.',
    },
    {
      icon: Download,
      title: 'Export multi-formats',
      description: 'Exportez en PDF haute resolution ou Word .docx editable.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Invitez votre equipe et travaillez ensemble sur vos documents.',
    },
    {
      icon: BarChart3,
      title: 'Score de completude',
      description: 'Suivez la qualite de vos documents avec notre systeme de scoring.',
    },
    {
      icon: Layers,
      title: '6 Templates',
      description: 'Business Plan, Audit, Appel d\'Offre, Contrat, Devis, Note de Direction.',
    },
    {
      icon: Shield,
      title: 'Cadre juridique',
      description: 'Clauses et contrats calibres pour les 17 pays membres de l\'OHADA.',
    },
  ],
  document: [
    {
      icon: Zap,
      title: 'Raccourcis clavier',
      description: 'Ctrl+S pour sauvegarder, Ctrl+E pour exporter rapidement.',
    },
    {
      icon: Target,
      title: 'Blocs intelligents',
      description: 'Glissez-deposez des blocs pour structurer votre document.',
    },
    {
      icon: CheckCircle2,
      title: 'Auto-sauvegarde',
      description: 'Vos modifications sont sauvegardees automatiquement toutes les 30 secondes.',
    },
  ],
  export: [
    {
      icon: Download,
      title: 'Export en cours',
      description: 'Votre document est en cours de preparation au format demande.',
    },
    {
      icon: Award,
      title: 'Qualite optimale',
      description: 'Les exports PDF sont generes en haute resolution pour impression.',
    },
  ],
  auth: [
    {
      icon: Shield,
      title: 'Connexion securisee',
      description: 'Vos donnees sont protegees par un chiffrement de bout en bout.',
    },
    {
      icon: Clock,
      title: 'Session active',
      description: 'Restez connecte pour acceder rapidement a vos documents.',
    },
  ],
  dashboard: [
    {
      icon: TrendingUp,
      title: 'Tableau de bord',
      description: 'Visualisez vos statistiques et suivez votre productivite.',
    },
    {
      icon: Lightbulb,
      title: 'Suggestions',
      description: 'Decouvrez nos recommandations pour ameliorer vos documents.',
    },
  ],
}

type TipContext = keyof typeof TIPS

interface LoadingProps {
  /** Context determines which tips to show */
  context?: TipContext
  /** Custom loading text */
  text?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
  /** Show tips or just spinner */
  showTips?: boolean
  /** Custom className */
  className?: string
  /** Progress value (0-100) for determinate loading */
  progress?: number
}

export function Loading({ 
  context = 'general',
  text = 'Chargement en cours...',
  size = 'md',
  showTips = true,
  className,
  progress,
}: LoadingProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const tips = TIPS[context] || TIPS.general
  const currentTip = tips[currentTipIndex]
  const TipIcon = currentTip.icon

  // Rotate tips every 4 seconds
  useEffect(() => {
    if (!showTips || tips.length <= 1) return
    
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [tips.length, showTips])

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    fullscreen: 'fixed inset-0 z-50 p-8',
  }

  const spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    fullscreen: 'w-16 h-16',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    fullscreen: 'text-lg',
  }

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center gap-6',
        size === 'fullscreen' && 'bg-[var(--bg)]/95 backdrop-blur-xl',
        sizeClasses[size],
        className
      )}
    >
      {/* Spinner container */}
      <div className="relative">
        {/* Outer glow */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full blur-xl opacity-30',
            spinnerSizes[size]
          )}
          style={{ background: 'var(--accent)' }}
        />
        
        {/* Main spinner */}
        <div className={cn('relative', spinnerSizes[size])}>
          {/* Track */}
          <svg className="w-full h-full" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="var(--border)"
              strokeWidth="3"
            />
            {/* Animated arc */}
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={progress !== undefined ? `${progress * 1.256} 125.6` : '78.5 125.6'}
              strokeDashoffset="0"
              className={progress === undefined ? 'animate-spin origin-center' : ''}
              style={{ 
                transformOrigin: 'center',
                animation: progress === undefined ? 'spin 1.2s linear infinite' : 'none',
                transition: 'stroke-dasharray 0.3s ease',
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--electric)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center icon or progress */}
          <div className="absolute inset-0 flex items-center justify-center">
            {progress !== undefined ? (
              <span className="text-xs font-bold text-[var(--accent)]">{Math.round(progress)}%</span>
            ) : (
              <Sparkles 
                className="w-1/3 h-1/3 text-[var(--accent)] animate-pulse" 
              />
            )}
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p className={cn(
          'font-semibold text-[var(--text)]',
          textSizes[size]
        )}>
          {text}
        </p>
        
        {/* Progress bar for determinate loading */}
        {progress !== undefined && (
          <div className="mt-3 w-48 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--electric))',
              }}
            />
          </div>
        )}
      </div>

      {/* Tips section */}
      {showTips && (size === 'lg' || size === 'fullscreen') && (
        <div 
          className={cn(
            'max-w-md w-full mt-4 p-5 rounded-2xl',
            'bg-[var(--surface)] border border-[var(--border)]',
            'shadow-lg shadow-black/5',
            'transition-all duration-300',
            isAnimating && 'opacity-0 translate-y-2'
          )}
        >
          <div className="flex items-start gap-4">
            <div 
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accentS)' }}
            >
              <TipIcon className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  Astuce
                </span>
              </div>
              <h4 className="font-bold text-[var(--text)] text-sm mb-1">
                {currentTip.title}
              </h4>
              <p className="text-xs text-[var(--text3)] leading-relaxed">
                {currentTip.description}
              </p>
            </div>
          </div>
          
          {/* Tip indicators */}
          {tips.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {tips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTipIndex(index)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-200',
                    index === currentTipIndex 
                      ? 'w-4 bg-[var(--accent)]' 
                      : 'bg-[var(--border)] hover:bg-[var(--border2)]'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Skeleton loader for content placeholders
export function Skeleton({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--bg3)]',
        className
      )}
      {...props}
    />
  )
}

// Page loading wrapper with fullscreen loading
export function PageLoader({
  isLoading,
  context = 'general',
  text,
  children,
}: {
  isLoading: boolean
  context?: TipContext
  text?: string
  children: React.ReactNode
}) {
  if (isLoading) {
    return (
      <Loading 
        size="fullscreen" 
        context={context}
        text={text}
        showTips
      />
    )
  }
  return <>{children}</>
}

// Inline loading for buttons and small areas
export function LoadingSpinner({ 
  className,
  size = 16,
}: { 
  className?: string
  size?: number 
}) {
  return (
    <svg 
      className={cn('animate-spin', className)} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
