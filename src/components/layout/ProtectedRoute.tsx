import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Demo/dev bypass: if VITE_AUTH_BYPASS is set to true, skip auth check
  const bypass = import.meta.env.VITE_AUTH_BYPASS === 'true'

  if (!bypass && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
