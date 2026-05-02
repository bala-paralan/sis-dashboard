import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: ReactNode
}

export function RequireAuth({ children }: Props) {
  const hasToken = useAuthStore((s) => s.hasToken)
  const location = useLocation()

  if (!hasToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
