import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { LoadingSpinner } from '@/components/ui/Loading'

// Variant styles
const variants = {
  primary: 
    'bg-gradient-to-r from-[var(--accent)] to-[var(--electric)] text-white border-none shadow-lg shadow-[var(--electricGlow)] hover:shadow-xl hover:shadow-[var(--electricGlow)] hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accentS)]',
  ghost: 
    'bg-transparent text-[var(--text2)] border border-[var(--border2)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accentS)]',
  danger: 
    'bg-transparent text-[var(--danger)] border border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
  success:
    'bg-[var(--success)] text-white border-none hover:opacity-90',
  outline:
    'bg-transparent text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accentS)]',
  link:
    'bg-transparent text-[var(--accent)] border-none underline-offset-4 hover:underline p-0',
  glass:
    'bg-[var(--glass-bg)] backdrop-blur-xl text-[var(--text)] border border-[var(--glass-border)] hover:bg-[var(--bg2)] shadow-lg',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-[11px] rounded-lg gap-1',
  sm: 'px-3.5 py-2 text-[12px] rounded-lg',
  md: 'px-5 py-2.5 text-[13px]',
  lg: 'px-7 py-3.5 text-[14px]',
  xl: 'px-8 py-4 text-[15px]',
  icon: 'w-10 h-10 p-0',
  'icon-sm': 'w-8 h-8 p-0',
  'icon-xs': 'w-6 h-6 p-0',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    isLoading,
    leftIcon,
    rightIcon,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-sans whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]'
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={16} className="text-current" />
            <span>Chargement...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
