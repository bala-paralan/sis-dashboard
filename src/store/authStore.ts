import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'
import { logout as apiLogout } from '@/api/auth'
import { getAccessToken } from '@/api/client'

interface AuthState {
  user: MeResponse | null
  isInitialized: boolean
  setUser: (user: MeResponse | null) => void
  logout: () => Promise<void>
  hasToken: () => boolean
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isInitialized: false,

  setUser: (user) => set({ user, isInitialized: true }),

  logout: async () => {
    await apiLogout().catch(() => undefined)
    set({ user: null, isInitialized: true })
  },

  hasToken: () => Boolean(getAccessToken()),
}))
