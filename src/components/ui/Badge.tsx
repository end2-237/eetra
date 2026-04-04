import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Variant styles
const variants = {
  default: 'bg-[var(--bg3)] text-[var(--text2)]',
  primary: 'bg-[var(--accentS)] text-[var(--accent)]',
  secondary: 'bg-[var(--bg2)] text-[var(--text3)] border border-[var(--border)]',
  success: 'bg-[rgba(16,185,129,0.12)] text-[var(--success)]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-[var(--warn)]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-[var(--danger)]',
  outline: 'bg-transparent border border-[var(--border)] text-[var(--text2)]',
  gradient: 'bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] text-white',
}

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
  lg: 'px-3 py-1.5 text-[12px]',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  dot?: boolean
  dotColor?: string
}

function Badge({ 
  className, 
  variant = 'default', 
  size = 'md', 
  dot,
  dotColor,
  children,
  ...props 
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold rounded-full transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span 
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: dotColor || 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}

export { Badge }
