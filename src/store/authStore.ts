import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import type { MeResponse } from '@/api/auth'
import { getAccessToken } from '@/api/client'

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message || 'Login failed' })
      throw e
    }
  },

  logout: async () => {
    set({ isLoading: true })
    await apiLogout().catch(() => undefined)
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  checkSession: async () => {
    if (!getAccessToken()) {
      set({ isAuthenticated: false, isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
