import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import { getAccessToken } from '@/api/client'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user:            MeResponse | null
  loading:         boolean
  error:           string | null
  isAuthenticated: boolean

  login:     (email: string, password: string) => Promise<void>
  logout:    () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user:            null,
  loading:         false,
  error:           null,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, isAuthenticated: true })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Login failed' })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    set({ loading: true })
    await apiLogout().catch(() => undefined)
    set({ user: null, isAuthenticated: false, loading: false, error: null })
  },

  checkAuth: async () => {
    if (!getAccessToken()) {
      set({ user: null, isAuthenticated: false })
      return
    }
    set({ loading: true })
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
