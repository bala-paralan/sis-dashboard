import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const IS_SIMULATION = import.meta.env['VITE_DATA_SOURCE'] === 'simulation'

export function ProtectedRoute() {
  const { isAuthenticated, checkSession } = useAuthStore()
  const [sessionChecked, setSessionChecked] = useState(IS_SIMULATION)

  useEffect(() => {
    if (IS_SIMULATION) return
    checkSession().finally(() => setSessionChecked(true))
  }, [checkSession])

  if (!sessionChecked) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'var(--bg-primary)' }}
      >
        <span className="text-[12px] text-text-secondary animate-pulse">
          Verifying session…
        </span>
      </div>
    )
  }

  if (!IS_SIMULATION && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
