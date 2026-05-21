import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  init: () => Promise<void>
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
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Login failed', loading: false })
    }
  },

  logout: async () => {
    await apiLogout().catch(() => undefined)
    set({ user: null })
  },

  init: async () => {
    set({ loading: true })
    try {
      const user = await getMe()
      set({ user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
}))
