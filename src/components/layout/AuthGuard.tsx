import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: ReactNode
}

export function AuthGuard({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loading         = useAuthStore((s) => s.loading)
  const checkAuth       = useAuthStore((s) => s.checkAuth)
  const location        = useLocation()

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
        aria-label="Loading"
      >
        <div className="text-sm">Verifying session…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
