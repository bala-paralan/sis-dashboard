import { useNotificationStore, type Notification } from '@/store/notificationStore'
import { useRef, useEffect } from 'react'

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: 'var(--alert-critical)',
  HIGH: 'var(--alert-high)',
  MEDIUM: 'var(--alert-medium)',
  LOW: 'var(--alert-low)',
}

const TYPE_ICONS: Record<string, string> = {
  ALERT: '⚠',
  SYSTEM: '⚙',
  CONNECTION: '⟳',
}

function NotificationRow({ n }: { n: Notification }) {
  const color = n.threatLevel ? (THREAT_COLORS[n.threatLevel] ?? 'var(--text-muted)') : 'var(--text-muted)'
  const ts = new Date(n.timestamp)
  const timeStr = `${String(ts.getUTCHours()).padStart(2, '0')}:${String(ts.getUTCMinutes()).padStart(2, '0')} UTC`

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b"
      style={{
        borderColor: 'var(--panel-border)',
        background: n.read ? 'transparent' : 'rgba(59,130,246,0.05)',
      }}
    >
      <span className="text-[14px] mt-0.5 shrink-0" style={{ color }}>
        {TYPE_ICONS[n.type] ?? '•'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-text-primary truncate">{n.title}</p>
          <span className="text-[10px] text-text-muted shrink-0 font-mono">{timeStr}</span>
        </div>
        <p className="text-[11px] text-text-secondary mt-0.5">{n.message}</p>
        {n.threatLevel && (
          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
            {n.threatLevel}
          </span>
        )}
      </div>
    </div>
  )
}

export function NotificationCenter() {
  const notifications = useNotificationStore((s) => s.notifications)
  const centerOpen = useNotificationStore((s) => s.centerOpen)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const setCenterOpen = useNotificationStore((s) => s.setCenterOpen)
  const soundEnabled = useNotificationStore((s) => s.soundEnabled)
  const toggleSound = useNotificationStore((s) => s.toggleSound)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!centerOpen) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setCenterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [centerOpen, setCenterOpen])

  if (!centerOpen) return null

  return (
    <div
      ref={drawerRef}
      className="fixed top-[52px] right-0 z-[400] flex flex-col"
      style={{
        width: 360,
        height: 'calc(100vh - 52px)',
        background: 'var(--panel-bg)',
        borderLeft: '1px solid var(--panel-border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
      }}
      role="dialog"
      aria-label="Notification Center"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--panel-border)', background: 'var(--panel-header-bg)' }}
      >
        <span className="text-[13px] font-semibold text-text-primary">Notifications</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="text-[18px] transition-opacity"
            style={{ opacity: soundEnabled ? 1 : 0.4 }}
            aria-label={soundEnabled ? 'Mute notification sounds' : 'Enable notification sounds'}
            title={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>
          <button
            onClick={markAllRead}
            className="text-[11px] text-accent-blue hover:opacity-80 transition-opacity"
          >
            Mark all read
          </button>
          <button
            onClick={() => setCenterOpen(false)}
            className="text-[13px] text-text-muted hover:text-text-primary transition-colors ml-1"
            aria-label="Close notification center"
          >
            ✕
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-text-muted">
            <span className="text-3xl">🔕</span>
            <p className="text-[12px]">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => <NotificationRow key={n.id} n={n} />)
        )}
      </div>
    </div>
  )
}
