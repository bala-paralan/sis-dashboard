import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (user: MeResponse) => void
  logout: () => void
  setError: (msg: string | null) => void
  setLoading: (v: boolean) => void
  hydrateFromSession: () => void
}

const SESSION_KEY = 'sis-auth-user'

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: (user: MeResponse) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    set({ user, isAuthenticated: true, error: null })
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY)
    set({ user: null, isAuthenticated: false })
  },

  setError: (msg) => set({ error: msg }),

  setLoading: (v) => set({ isLoading: v }),

  hydrateFromSession: () => {
    // Allow bypass for dev/demo environments
    if (import.meta.env.VITE_AUTH_BYPASS === 'true') {
      const demo: MeResponse = {
        id: 'demo',
        email: 'demo@sis.local',
        displayName: 'Demo Operator',
        role: 'OPERATOR',
        createdAt: new Date().toISOString(),
      }
      set({ user: demo, isAuthenticated: true })
      return
    }
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const user = JSON.parse(stored) as MeResponse
        set({ user, isAuthenticated: true })
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }
  },
}))
