import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe, type MeResponse } from '@/api/auth'
import { getAccessToken } from '@/api/client'

interface AuthState {
  user: MeResponse | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  loading: false,
  error:   null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      await apiLogout()
    } finally {
      set({ user: null, loading: false })
    }
  },

  checkSession: async () => {
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
