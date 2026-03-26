'use client'
import { useTheme } from '@/contexts/ThemeContext'
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      className={`relative rounded-full border transition-colors duration-200 flex-shrink-0 cursor-pointer ${className}`}
      style={{ width: 28, height: 28, background: 'var(--bg2)', borderColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Toggle theme">
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', position: 'absolute' }} />
    </button>
  )
}
