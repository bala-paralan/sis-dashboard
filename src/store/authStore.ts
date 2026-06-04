import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  setUser: (user: MeResponse | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  clearAuth: () => set({ user: null, isAuthenticated: false }),
}))
