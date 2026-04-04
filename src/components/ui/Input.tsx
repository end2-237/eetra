import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Variant styles
const variants = {
  default: 'border-[var(--border)] hover:border-[var(--border2)]',
  ghost: 'border-transparent bg-[var(--bg2)] hover:bg-[var(--bg3)]',
  error: 'border-[var(--danger)] focus-visible:ring-[var(--danger)]',
}

const sizes = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-10 px-4 text-[13px]',
  lg: 'h-12 px-5 text-[14px]',
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: keyof typeof variants
  inputSize?: keyof typeof sizes
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', inputSize = 'md', leftIcon, rightIcon, error, type, ...props }, ref) => {
    const hasError = !!error
    const baseStyles = 'flex w-full rounded-xl border bg-[var(--surface)] text-[var(--text)] transition-all duration-200 placeholder:text-[var(--text4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-50 font-sans'

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text4)]">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            baseStyles,
            variants[hasError ? 'error' : variant],
            sizes[inputSize],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text4)]">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-[11px] text-[var(--danger)] font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Search input variant
const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon'>>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        }
        {...props}
      />
    )
  }
)
SearchInput.displayName = 'SearchInput'

export { Input, SearchInput }
