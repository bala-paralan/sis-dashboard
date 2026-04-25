import { useEffect } from 'react'
import { useToastStore } from '@/store/toastStore'
import type { Toast, ToastType } from '@/store/toastStore'

const TYPE_STYLES: Record<ToastType, { border: string; bg: string; color: string; icon: string }> = {
  success: { border: 'rgba(34,197,94,0.4)',  bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', icon: '✓' },
  error:   { border: 'rgba(239,68,68,0.4)',  bg: 'rgba(239,68,68,0.12)',  color: '#f87171', icon: '✕' },
  warning: { border: 'rgba(234,179,8,0.4)',  bg: 'rgba(234,179,8,0.12)',  color: '#facc15', icon: '⚠' },
  info:    { border: 'rgba(59,130,246,0.4)', bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', icon: 'ℹ' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const styles = TYPE_STYLES[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, removeToast])

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2.5 rounded-[8px] border px-3 py-2.5 shadow-lg text-[12px] min-w-[240px] max-w-[360px] animate-fade-in"
      style={{
        background:   styles.bg,
        borderColor:  styles.border,
        color:        'var(--text-primary)',
      }}
    >
      <span className="shrink-0 font-bold text-[13px]" style={{ color: styles.color }}>
        {styles.icon}
      </span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 ml-1 text-[11px] cursor-pointer border-none bg-transparent leading-none"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed top-[60px] right-3 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
