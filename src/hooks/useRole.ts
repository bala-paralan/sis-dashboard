import { useAuthStore } from '@/store/authStore'

type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER'

const ROLE_RANK: Record<Role, number> = { VIEWER: 0, OPERATOR: 1, ADMIN: 2 }

export function useRole() {
  const user = useAuthStore((s) => s.user)
  const role: Role = (user?.role as Role) ?? 'VIEWER'
  const hasRole = (required: Role) => ROLE_RANK[role] >= ROLE_RANK[required]
  return { role, hasRole, isAdmin: role === 'ADMIN', isOperator: role === 'OPERATOR' || role === 'ADMIN', isViewer: role === 'VIEWER' }
}
