import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSystemStore } from '@/store/systemStore'
import { useAuthStore } from '@/store/authStore'
import { useAlertStore } from '@/store/alertStore'
import { useNotificationStore } from '@/store/notificationStore'
import { getMe } from '@/api/auth'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { LoginPage } from '@/components/pages/LoginPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ToastContainer } from '@/components/widgets/ToastContainer'
import { NotificationCenter } from '@/components/widgets/NotificationCenter'

function DashboardShell() {
  const theme = useSystemStore((s) => s.theme)
  const setReconnectFn = useSystemStore((s) => s.setReconnectFn)
  const setSendMessageFn = useSystemStore((s) => s.setSendMessageFn)
  const mobileSidebarOpen = useSystemStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useSystemStore((s) => s.setMobileSidebarOpen)
  const connectionStatus = useSystemStore((s) => s.connectionStatus)
  const { connect, sendMessage } = useWebSocket()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const prevAlertCount = useRef(0)
  const prevConnection = useRef(connectionStatus)

  useEffect(() => {
    setReconnectFn(connect)
  }, [connect, setReconnectFn])

  useEffect(() => {
    setSendMessageFn(sendMessage)
  }, [sendMessage, setSendMessageFn])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Subscribe to alert store — generate notifications for new CRITICAL/HIGH alerts
  useEffect(() => {
    const unsub = useAlertStore.subscribe((state) => {
      const count = state.alerts.length
      if (count > prevAlertCount.current) {
        const newAlerts = state.alerts.slice(0, count - prevAlertCount.current)
        for (const alert of newAlerts) {
          if (alert.threat_level === 'CRITICAL' || alert.threat_level === 'HIGH') {
            addNotification({
              type: 'ALERT',
              title: `${alert.threat_level} Alert — ${alert.classification}`,
              message: alert.description ?? `Sensors: ${alert.source_sensors.join(', ')}`,
              timestamp: alert.timestamp,
              threatLevel: alert.threat_level,
            })
          }
        }
      }
      prevAlertCount.current = count
    })
    return unsub
  }, [addNotification])

  // Notify on connection status changes
  useEffect(() => {
    if (prevConnection.current === connectionStatus) return
    if (connectionStatus === 'disconnected') {
      addNotification({
        type: 'CONNECTION',
        title: 'Connection Lost',
        message: 'WebSocket connection to sensor network lost. Attempting to reconnect…',
        timestamp: new Date().toISOString(),
      })
    } else if (connectionStatus === 'connected' && prevConnection.current !== 'connecting') {
      addNotification({
        type: 'CONNECTION',
        title: 'Connection Restored',
        message: 'WebSocket connection to sensor network re-established.',
        timestamp: new Date().toISOString(),
      })
    }
    prevConnection.current = connectionStatus
  }, [connectionStatus, addNotification])

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
        <div
          className={`mobile-sidebar-backdrop${mobileSidebarOpen ? ' active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
        <PanelGrid />
      </div>
      <ToastContainer />
      <NotificationCenter />
    </div>
  )
}

export function App() {
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // On mount, try to hydrate user from existing token
  useEffect(() => {
    if (isAuthenticated) {
      getMe().then(setUser).catch(() => {
        // Token invalid/expired — ProtectedRoute will redirect
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
