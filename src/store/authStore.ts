import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'
import { getAccessToken } from '@/api/client'

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: MeResponse | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: !!getAccessToken(),
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}))
