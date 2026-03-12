'use client'
import { useTheme } from '@/contexts/ThemeContext'
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      className={`relative w-11 h-6 rounded-full border transition-colors duration-200 flex-shrink-0 cursor-pointer ${className}`}
      style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }} aria-label="Toggle theme">
      <span className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200"
        style={{ background: 'var(--accent)', left: '2px', transform: theme === 'dark' ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  )
}
