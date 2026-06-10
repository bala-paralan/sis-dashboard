import { useNotificationStore } from '@/store/notificationStore'
import type { Notification } from '@/store/notificationStore'

const TYPE_ICONS: Record<string, string> = {
  ALERT: '🔔',
  SYSTEM_HEALTH: '🖥',
  CONNECTION: '📡',
}

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: 'var(--alert-critical)',
  HIGH: 'var(--alert-high)',
  MEDIUM: 'var(--alert-medium)',
  LOW: 'var(--alert-low)',
}

function NotifRow({ n }: { n: Notification }) {
  const dismiss = useNotificationStore((s) => s.dismissNotification)
  const color = n.threatLevel
    ? (THREAT_COLORS[n.threatLevel] ?? 'var(--accent-blue)')
    : 'var(--text-secondary)'
  const time = new Date(n.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="flex items-start gap-3 px-4 py-[10px] border-b border-border-color group"
      style={{ background: n.read ? 'transparent' : 'rgba(59,130,246,0.04)' }}
    >
      <span className="text-[16px] shrink-0 mt-[1px]">{TYPE_ICONS[n.type] ?? '●'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold" style={{ color }}>
            {n.title}
          </span>
          <span className="text-[10px] text-text-muted shrink-0">{time}</span>
        </div>
        <div className="text-[11px] text-text-secondary mt-[2px] leading-tight">{n.message}</div>
      </div>
      <button
        onClick={() => dismiss(n.id)}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary text-[12px] shrink-0 bg-transparent border-none cursor-pointer"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export function NotificationCenter() {
  const open = useNotificationStore((s) => s.drawerOpen)
  const setOpen = useNotificationStore((s) => s.setDrawerOpen)
  const notifications = useNotificationStore((s) => s.notifications)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150]"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-[52px] right-0 z-[160] flex flex-col"
        style={{
          width: 360,
          height: 'calc(100vh - 52px)',
          background: 'var(--panel-bg)',
          borderLeft: '1px solid var(--panel-border)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.4)',
        }}
        role="dialog"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{
            borderBottom: '1px solid var(--panel-border)',
            background: 'var(--panel-header-bg)',
          }}
        >
          <span className="text-[13px] font-bold">Notifications</span>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-[11px] text-accent-blue bg-transparent border-none cursor-pointer"
            >
              Mark all read
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-text-secondary bg-transparent border-none cursor-pointer text-[14px]"
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-text-secondary">
              <span className="text-3xl">🔕</span>
              <span className="text-[12px]">No notifications</span>
            </div>
          ) : (
            notifications.map((n) => <NotifRow key={n.id} n={n} />)
          )}
        </div>
      </div>
    </>
  )
}
