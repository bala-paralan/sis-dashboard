import { useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSystemStore } from '@/store/systemStore'
import { useAuthStore } from '@/store/authStore'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { LoginPage } from '@/components/pages/LoginPage'

export function App() {
  const theme = useSystemStore((s) => s.theme)
  const setReconnectFn = useSystemStore((s) => s.setReconnectFn)
  const setSendMessageFn = useSystemStore((s) => s.setSendMessageFn)
  const mobileSidebarOpen = useSystemStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useSystemStore((s) => s.setMobileSidebarOpen)
  const { connect, sendMessage } = useWebSocket()

  const authUser    = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.loading)
  const initAuth    = useAuthStore((s) => s.init)

  useEffect(() => { void initAuth() }, [initAuth])

  useEffect(() => {
    setReconnectFn(connect)
  }, [connect, setReconnectFn])

  useEffect(() => {
    setSendMessageFn(sendMessage)
  }, [sendMessage, setSendMessageFn])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (authLoading && !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <span className="text-[var(--text-secondary)] text-sm animate-pulse">Initialising…</span>
      </div>
    )
  }

  if (!authUser) {
    return <LoginPage />
  }

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
    </div>
  )
}
