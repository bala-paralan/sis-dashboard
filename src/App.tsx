import { useCallback, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSystemStore } from '@/store/systemStore'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { LoginPage } from '@/components/auth/LoginPage'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { ToastContainer } from '@/components/widgets/ToastContainer'
import { KeyboardShortcutsModal } from '@/components/widgets/KeyboardShortcutsModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function Dashboard() {
  const mobileSidebarOpen = useSystemStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useSystemStore((s) => s.setMobileSidebarOpen)

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
    </div>
  )
}

export function App() {
  const theme = useSystemStore((s) => s.theme)
  const setReconnectFn = useSystemStore((s) => s.setReconnectFn)
  const setSendMessageFn = useSystemStore((s) => s.setSendMessageFn)
  const { connect, sendMessage } = useWebSocket()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const toggleHelp = useCallback(() => setShowShortcuts((v) => !v), [])
  useKeyboardShortcuts(toggleHelp)

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
    <>
      <ToastContainer />
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  )
}
