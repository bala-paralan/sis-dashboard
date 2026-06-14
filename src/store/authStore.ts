import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'

interface AuthState {
  user: MeResponse | null
  isAuthenticated: boolean
  login: (user: MeResponse) => void
  logout: () => void
}

const SESSION_KEY = 'sis-auth'

function loadFromSession(): { user: MeResponse | null; isAuthenticated: boolean } {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return { user: null, isAuthenticated: false }
    const user = JSON.parse(raw) as MeResponse
    return { user, isAuthenticated: true }
  } catch {
    return { user: null, isAuthenticated: false }
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  ...loadFromSession(),

  login: (user: MeResponse) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY)
    set({ user: null, isAuthenticated: false })
  },
}))
