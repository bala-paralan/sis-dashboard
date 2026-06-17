import { useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSystemStore } from '@/store/systemStore'
import { useAuthStore } from '@/store/authStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { LoginPage } from '@/components/pages/LoginPage'
import { ShortcutHelp } from '@/components/widgets/ShortcutHelp'

function Dashboard() {
  const theme = useSystemStore((s) => s.theme)
  const setReconnectFn = useSystemStore((s) => s.setReconnectFn)
  const setSendMessageFn = useSystemStore((s) => s.setSendMessageFn)
  const mobileSidebarOpen = useSystemStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useSystemStore((s) => s.setMobileSidebarOpen)
  const { connect, sendMessage } = useWebSocket()
  const { helpOpen, setHelpOpen } = useKeyboardShortcuts()

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
        <div
          className={`mobile-sidebar-backdrop${mobileSidebarOpen ? ' active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
        <PanelGrid />
      </div>
      {helpOpen && <ShortcutHelp onClose={() => setHelpOpen(false)} />}
    </div>
  )
}

export function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isChecking = useAuthStore((s) => s.isChecking)
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const theme = useSystemStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isChecking) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
      >
        <span className="text-[13px] tracking-[0.08em]">Authenticating…</span>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />
}
