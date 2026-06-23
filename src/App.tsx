import { useEffect, useRef } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSystemStore } from '@/store/systemStore'
import { useAuthStore } from '@/store/authStore'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { LoginPage } from '@/components/pages/LoginPage'
import { ToastContainer } from '@/components/widgets/Toast'
import { toast } from '@/store/toastStore'

function Dashboard() {
  const setReconnectFn = useSystemStore((s) => s.setReconnectFn)
  const setSendMessageFn = useSystemStore((s) => s.setSendMessageFn)
  const mobileSidebarOpen = useSystemStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useSystemStore((s) => s.setMobileSidebarOpen)
  const connectionStatus = useSystemStore((s) => s.connectionStatus)
  const { connect, sendMessage } = useWebSocket()
  const prevStatus = useRef(connectionStatus)

  useEffect(() => {
    setReconnectFn(connect)
  }, [connect, setReconnectFn])

  useEffect(() => {
    setSendMessageFn(sendMessage)
  }, [sendMessage, setSendMessageFn])

  // Toast on WebSocket connection state changes
  useEffect(() => {
    if (prevStatus.current === connectionStatus) return
    const prev = prevStatus.current
    prevStatus.current = connectionStatus
    if (connectionStatus === 'disconnected') {
      toast.warning('WebSocket disconnected — retrying…')
    } else if (connectionStatus === 'connected' && prev !== 'connecting') {
      toast.success('WebSocket reconnected')
    }
  }, [connectionStatus])

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
    </div>
  )
}

export function App() {
  const authStatus = useAuthStore((s) => s.authStatus)
  const theme = useSystemStore((s) => s.theme)
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    init()
  }, [init])

  if (authStatus === 'checking') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
      >
        <span className="text-sm">Checking session…</span>
      </div>
    )
  }

  if (authStatus === 'unauthenticated') {
    return <LoginPage />
  }

  return <Dashboard />
}
