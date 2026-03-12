'use client'
interface ToastProps { message: string; type: 'default' | 'ok' | 'err'; visible: boolean }
export function Toast({ message, type, visible }: ToastProps) {
  const colors = { default: 'bg-[var(--text)] text-[var(--bg)]', ok: 'bg-[var(--success)] text-white', err: 'bg-[var(--danger)] text-white' }
  return (
    <div className={`fixed bottom-6 left-1/2 z-[9999] px-5 py-2.5 rounded-lg text-[12px] font-bold whitespace-nowrap shadow-xl pointer-events-none transition-all duration-300 ${colors[type]}`}
      style={{ transform: `translateX(-50%) translateY(${visible ? '0' : '60px'})`, opacity: visible ? 1 : 0 }}>
      {message}
    </div>
  )
}
