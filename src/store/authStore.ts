import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import type { MeResponse } from '@/api/auth'
import { getAccessToken } from '@/api/client'

interface AuthState {
  user: MeResponse | null
  loading: boolean
  error: string | null

  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: false,
  error: null,

  init: async () => {
    if (!getAccessToken()) return
    set({ loading: true, error: null })
    try {
      const user = await getMe()
      set({ user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await apiLogin(email, password)
      set({ user, loading: false })
    } catch (e) {
      set({ error: (e as Error).message ?? 'Login failed', loading: false })
    }
  },

  logout: async () => {
    set({ loading: true })
    try { await apiLogout() } catch { /* best effort */ }
    set({ user: null, loading: false, error: null })
  },
}))
