import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Variant styles
const variants = {
  default: 'bg-[var(--surface)] border-[var(--border)]',
  glass: 'bg-[var(--glass-bg)] backdrop-blur-xl border-[var(--glass-border)] shadow-lg',
  elevated: 'bg-[var(--surface)] border-[var(--border)] shadow-lg shadow-black/5 dark:shadow-black/20',
  gradient: 'bg-gradient-to-br from-[var(--accent)] to-[var(--electric)] border-none text-white',
  dark: 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-[rgba(148,163,184,0.1)]',
  outline: 'bg-transparent border-[var(--border)] border-dashed',
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants
  hover?: boolean
  padding?: keyof typeof paddings
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border transition-all duration-300',
        variants[variant],
        paddings[padding],
        hover && 'hover:-translate-y-1 hover:shadow-xl hover:border-[var(--accent)] cursor-pointer',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 pb-4', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-bold tracking-tight text-[var(--text)]',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-[var(--text3)]', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 pt-4 border-t border-[var(--border)]', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
}
