import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getAccessToken } from '@/api/client'

interface Props {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const user = useAuthStore((s) => s.user)
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user && !loading) {
      checkAuth()
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && !user && !getAccessToken()) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          fontSize: 12,
        }}
      >
        Loading…
      </div>
    )
  }

  if (!user && !getAccessToken()) return null

  return <>{children}</>
}
