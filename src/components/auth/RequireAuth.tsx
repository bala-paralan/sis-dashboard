import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const hasToken = Boolean(localStorage.getItem('access_token'))

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
