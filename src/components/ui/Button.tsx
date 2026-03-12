import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => {
    const base = 'inline-flex items-center gap-2 font-bold rounded-lg cursor-pointer border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed font-sans'
    const variants = {
      primary: 'bg-[var(--accent)] text-white border-transparent hover:bg-[var(--accentH)] hover:shadow-lg hover:shadow-blue-500/20',
      ghost:   'bg-transparent text-[var(--text2)] border-[var(--border2)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accentS)]',
      danger:  'bg-transparent text-[var(--danger)] border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
    }
    const sizes = {
      sm: 'px-3.5 py-2 text-[12px] tracking-wide',
      md: 'px-5 py-2.5 text-[13px] tracking-wide',
      lg: 'px-7 py-3.5 text-[14px] tracking-wide',
    }
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full justify-center', className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
