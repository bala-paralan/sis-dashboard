import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'
import { useAlertStore } from '@/store/alertStore'
import { useToastStore } from '@/store/toastStore'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { KeyboardShortcutLegend } from '@/components/widgets/KeyboardShortcutLegend'
import { ToastContainer } from '@/components/widgets/ToastContainer'

export function App() {
  const theme = useSystemStore((s) => s.theme)
  const setReconnectFn = useSystemStore((s) => s.setReconnectFn)
  const setSendMessageFn = useSystemStore((s) => s.setSendMessageFn)
  const mobileSidebarOpen = useSystemStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useSystemStore((s) => s.setMobileSidebarOpen)
  const { connect, sendMessage } = useWebSocket()

  const [showLegend, setShowLegend] = useState(false)
  const alerts      = useAlertStore((s) => s.alerts)
  const mutedAlerts = useSystemStore((s) => s.mutedAlerts)
  const addToast    = useToastStore((s) => s.addToast)

  useKeyboardShortcuts({ onShowLegend: () => setShowLegend(true) })

  // Fire toast for new CRITICAL / HIGH alerts
  useEffect(() => {
    const latest = alerts[0]
    if (!latest) return
    if (mutedAlerts) return
    if (latest.threat_level !== 'CRITICAL' && latest.threat_level !== 'HIGH') return
    addToast({
      threatLevel:    latest.threat_level,
      classification: latest.classification,
      timestamp:      latest.timestamp,
      location:       latest.location ?? '',
    })
  }, [alerts[0]?.id])

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
      {showLegend && <KeyboardShortcutLegend onClose={() => setShowLegend(false)} />}
      <ToastContainer />
    </div>
  )
}
