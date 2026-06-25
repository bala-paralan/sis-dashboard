import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import type { MeResponse } from '@/api/auth'
import { getAccessToken } from '@/api/client'

interface AuthState {
  user: MeResponse | null
  loading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, loading: false })
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Login failed' })
      throw err
    }
  },

  logout: async () => {
    await apiLogout()
    set({ user: null, error: null })
  },

  checkAuth: async () => {
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
