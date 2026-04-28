import { type ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getMe } from '@/api/auth'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const user           = useAuthStore((s) => s.user)
  const isInitialized  = useAuthStore((s) => s.isInitialized)
  const hasToken       = useAuthStore((s) => s.hasToken)
  const setUser        = useAuthStore((s) => s.setUser)

  const tokenPresent = hasToken()

  // If we have a token but no user yet, fetch the current user silently
  useEffect(() => {
    if (tokenPresent && !user && !isInitialized) {
      getMe()
        .then((me) => setUser(me))
        .catch(() => setUser(null))
    } else if (!tokenPresent && !isInitialized) {
      setUser(null)
    }
  }, [tokenPresent, user, isInitialized, setUser])

  // No token → redirect to login immediately
  if (!tokenPresent) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
