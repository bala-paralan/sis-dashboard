import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSystemStore } from '@/store/systemStore'
import { useAlertStore } from '@/store/alertStore'
import { useNotificationStore } from '@/store/notificationStore'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { ToastContainer } from '@/components/widgets/ToastContainer'
import { NotificationCenter } from '@/components/widgets/NotificationCenter'
import { KeyboardShortcutsModal } from '@/components/widgets/KeyboardShortcutsModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function App() {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const theme = useSystemStore((s) => s.theme)
  const setReconnectFn = useSystemStore((s) => s.setReconnectFn)
  const setSendMessageFn = useSystemStore((s) => s.setSendMessageFn)
  const mobileSidebarOpen = useSystemStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useSystemStore((s) => s.setMobileSidebarOpen)
  const { connect, sendMessage } = useWebSocket()
  const alerts = useAlertStore((s) => s.alerts)
  const addNotification = useNotificationStore((s) => s.addNotification)

  useKeyboardShortcuts(() => setShowShortcuts(true))

  // Push CRITICAL/HIGH alerts to notification center
  useEffect(() => {
    const recent = alerts
      .filter((a) => !a.acknowledged && (a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH'))
      .slice(0, 1)
    if (recent.length > 0) {
      const a = recent[0]
      addNotification({
        type: 'ALERT',
        title: `${a.threat_level} Alert`,
        message: a.description ?? a.sensor_family,
        timestamp: a.timestamp,
        threatLevel: a.threat_level,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts.length])

  useEffect(() => {
    setReconnectFn(connect)
  }, [connect, setReconnectFn])

  useEffect(() => {
    setSendMessageFn(sendMessage)
  }, [sendMessage, setSendMessageFn])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div
      className="app-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <TopNavBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <LeftSidebar />
        {/* Mobile sidebar backdrop */}
        <div
          className={`mobile-sidebar-backdrop${mobileSidebarOpen ? ' active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
        <PanelGrid />
      </div>
      <ToastContainer />
      <NotificationCenter />
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
