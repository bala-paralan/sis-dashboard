import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'
import { logout as apiLogout } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  setUser: (user: MeResponse | null) => void
  logout: () => Promise<void>
  hasToken: () => boolean
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: async () => {
    await apiLogout()
    set({ user: null })
  },

  hasToken: () => Boolean(localStorage.getItem('access_token')),
}))
