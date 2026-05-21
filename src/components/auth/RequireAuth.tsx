import { type ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: ReactNode
}

export function RequireAuth({ children }: Props) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const init = useAuthStore((s) => s.init)
  const location = useLocation()

  useEffect(() => {
    if (!user && !loading) {
      init()
    }
  }, [user, loading, init])

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
      >
        Authenticating…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
