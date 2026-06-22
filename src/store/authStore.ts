import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import { getAccessToken, clearTokens } from '@/api/client'
import type { MeResponse } from '@/api/auth'

const DEMO_USER: MeResponse = {
  id: 'demo-001',
  email: 'operator@sis.local',
  displayName: 'Operator',
  role: 'OPERATOR',
  createdAt: new Date().toISOString(),
}

const DEMO_CREDENTIALS: Record<string, { password: string; user: MeResponse }> = {
  'operator@sis.local': { password: 'operator', user: DEMO_USER },
  'admin@sis.local': {
    password: 'admin',
    user: { ...DEMO_USER, id: 'demo-002', email: 'admin@sis.local', displayName: 'Admin', role: 'ADMIN' },
  },
  'viewer@sis.local': {
    password: 'viewer',
    user: { ...DEMO_USER, id: 'demo-003', email: 'viewer@sis.local', displayName: 'Viewer', role: 'VIEWER' },
  },
}

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hydrateFromStorage: () => Promise<void>
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
    } catch {
      // Demo mode fallback — backend unreachable or bad credentials
      const demo = DEMO_CREDENTIALS[email.toLowerCase()]
      if (demo && demo.password === password) {
        localStorage.setItem('sos_access_token', 'demo-token')
        set({ user: demo.user, isAuthenticated: true, isLoading: false })
      } else {
        set({ error: 'Invalid credentials. Try operator@sis.local / operator', isLoading: false })
      }
    }
  },

  logout: async () => {
    try {
      await apiLogout()
    } catch {
      clearTokens()
    }
    set({ user: null, isAuthenticated: false })
  },

  hydrateFromStorage: async () => {
    const token = getAccessToken()
    if (!token) return
    if (token === 'demo-token') {
      set({ user: DEMO_USER, isAuthenticated: true })
      return
    }
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true })
    } catch {
      clearTokens()
    }
  },

  clearError: () => set({ error: null }),
}))
