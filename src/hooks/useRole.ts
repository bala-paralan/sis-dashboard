import { useAuthStore } from '@/store/authStore'

type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER'

const ROLE_RANK: Record<Role, number> = { VIEWER: 0, OPERATOR: 1, ADMIN: 2 }

export function useRole(): Role {
  return useAuthStore((s) => s.user?.role ?? 'OPERATOR')
}

export function useHasRole(minimum: Role): boolean {
  const role = useRole()
  return ROLE_RANK[role] >= ROLE_RANK[minimum]
}
