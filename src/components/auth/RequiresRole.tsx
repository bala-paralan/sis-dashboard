import { useRole } from '@/hooks/useRole'

type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER'

interface Props {
  role: Role
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequiresRole({ role, children, fallback = null }: Props) {
  const { hasRole } = useRole()
  if (!hasRole(role)) return <>{fallback}</>
  return <>{children}</>
}
