import { useEffect, useRef } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import type { Notification } from '@/store/notificationStore'

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: 'var(--alert-critical)',
  HIGH:     'var(--alert-high)',
  MEDIUM:   'var(--alert-medium)',
  LOW:      'var(--alert-low)',
}

function Toast({ notif, onDismiss }: { notif: Notification; onDismiss: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timerRef.current)
  }, [onDismiss])

  const color = notif.threatLevel ? (THREAT_COLORS[notif.threatLevel] ?? 'var(--accent-blue)') : 'var(--accent-blue)'

  return (
    <div
      role="alert"
      className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg cursor-pointer"
      style={{
        background: 'var(--panel-bg)',
        border: `1px solid ${color}`,
        borderLeft: `3px solid ${color}`,
        minWidth: 280,
        maxWidth: 360,
      }}
      onClick={onDismiss}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold" style={{ color }}>
          {notif.title}
        </div>
        <div className="text-[11px] text-text-secondary mt-[2px] leading-tight">
          {notif.message}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss() }}
        className="text-text-secondary text-[14px] border-none bg-transparent cursor-pointer shrink-0 leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications)
  const dismiss = useNotificationStore((s) => s.dismissNotification)

  const recent = notifications.slice(0, 5).filter((n) => !n.read)

  if (recent.length === 0) return null

  return (
    <div
      className="fixed top-[60px] right-4 z-[200] flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {recent.map((n) => (
        <Toast key={n.id} notif={n} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>
  )
}
