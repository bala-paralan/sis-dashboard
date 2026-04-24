import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import { getAccessToken } from '@/api/client'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user:      MeResponse | null
  loading:   boolean
  error:     string | null
  login:     (email: string, password: string) => Promise<void>
  logout:    () => Promise<void>
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user:    null,
  loading: false,
  error:   null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Login failed' })
      throw e
    }
  },

  logout: async () => {
    set({ loading: true })
    try {
      await apiLogout()
    } catch {
      // Ignore network errors — local session is always cleared
    } finally {
      set({ user: null, loading: false, error: null })
    }
  },

  bootstrap: async () => {
    if (!getAccessToken()) return
    set({ loading: true })
    try {
      const user = await getMe()
      set({ user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
}))
