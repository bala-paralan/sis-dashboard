import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'
import { logout as apiLogout } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  setUser: (u: MeResponse | null) => void
  logout: () => Promise<void>
  hasToken: () => boolean
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,

  setUser: (u: MeResponse | null) => {
    set({ user: u })
  },

  logout: async () => {
    await apiLogout()
    set({ user: null })
  },

  hasToken: () => {
    return Boolean(localStorage.getItem('access_token'))
  },
}))
