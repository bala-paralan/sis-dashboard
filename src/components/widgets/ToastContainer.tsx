import { useEffect, useRef } from 'react'
import { useNotificationStore, type Notification } from '@/store/notificationStore'

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: 'var(--alert-critical)',
  HIGH: 'var(--alert-high)',
  MEDIUM: 'var(--alert-medium)',
  LOW: 'var(--alert-low)',
}

function Toast({ n, onDismiss }: { n: Notification; onDismiss: () => void }) {
  const color = n.threatLevel ? (THREAT_COLORS[n.threatLevel] ?? 'var(--accent-blue)') : 'var(--accent-blue)'

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="alert"
      className="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl pointer-events-auto animate-fade-in"
      style={{
        background: 'var(--panel-bg)',
        borderColor: color,
        borderLeftWidth: 3,
        minWidth: 280,
        maxWidth: 360,
      }}
    >
      <span
        className="mt-0.5 w-2 h-2 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-text-primary truncate">{n.title}</p>
        <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-text-primary transition-colors shrink-0 text-[13px]"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toastQueue())
  const dismissNotification = useNotificationStore((s) => s.dismissNotification)
  const soundEnabled = useNotificationStore((s) => s.soundEnabled)
  const prevCountRef = useRef(0)

  useEffect(() => {
    const unreadCritical = toasts.filter((t) => t.threatLevel === 'CRITICAL' || t.threatLevel === 'HIGH')
    if (unreadCritical.length > prevCountRef.current && soundEnabled) {
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      } catch { /* AudioContext may be blocked */ }
    }
    prevCountRef.current = unreadCritical.length
  }, [toasts, soundEnabled])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-16 right-4 z-[500] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((n) => (
        <Toast key={n.id} n={n} onDismiss={() => dismissNotification(n.id)} />
      ))}
    </div>
  )
}
