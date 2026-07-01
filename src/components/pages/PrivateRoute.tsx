import { Navigate } from 'react-router-dom'
import { getAccessToken } from '@/api/client'

interface Props {
  children: React.ReactNode
}

export function PrivateRoute({ children }: Props) {
  return getAccessToken() ? <>{children}</> : <Navigate to="/login" replace />
}
