import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import { getAccessToken, clearTokens } from '@/api/client'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initFromStorage: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await apiLogout()
    } catch {
      // swallow — clear local auth state regardless of API failure
    }
    set({ user: null, isAuthenticated: false, isLoading: false, error: null })
  },

  initFromStorage: async () => {
    const token = getAccessToken()
    if (!token) return
    set({ isLoading: true })
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
