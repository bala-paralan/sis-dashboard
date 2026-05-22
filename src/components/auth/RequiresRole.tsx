import { useHasRole } from '@/hooks/useRole'

type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER'

interface RequiresRoleProps {
  role: Role
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequiresRole({ role, children, fallback = null }: RequiresRoleProps) {
  const allowed = useHasRole(role)
  return allowed ? <>{children}</> : <>{fallback}</>
}
