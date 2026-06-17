import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import { getAccessToken } from '@/api/client'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  isChecking: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isChecking: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, isAuthenticated: true, error: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      set({ error: msg })
      throw err
    }
  },

  logout: async () => {
    try {
      await apiLogout()
    } catch {
      // server-side logout failures should not prevent local session cleanup
    }
    set({ user: null, isAuthenticated: false, error: null })
  },

  checkAuth: async () => {
    set({ isChecking: true })
    const token = getAccessToken()
    if (!token) {
      set({ isChecking: false, isAuthenticated: false, user: null })
      return
    }
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true, isChecking: false })
    } catch {
      set({ user: null, isAuthenticated: false, isChecking: false })
    }
  },

  clearError: () => set({ error: null }),
}))
