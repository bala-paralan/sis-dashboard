import { create } from 'zustand'
import type { MeResponse } from '@/api/auth'
import { getAccessToken } from '@/api/client'

type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated'

interface AuthState {
  user: MeResponse | null
  authStatus: AuthStatus
  setUser: (user: MeResponse | null) => void
  setAuthStatus: (s: AuthStatus) => void
  /** Initialise: restore session from localStorage if a token exists. */
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  authStatus: 'checking',

  setUser: (user) => set({ user }),
  setAuthStatus: (authStatus) => set({ authStatus }),

  init: async () => {
    const token = getAccessToken()
    if (!token) {
      set({ authStatus: 'unauthenticated' })
      return
    }
    try {
      const { getMe } = await import('@/api/auth')
      const user = await getMe()
      set({ user, authStatus: 'authenticated' })
    } catch {
      set({ authStatus: 'unauthenticated' })
    }
  },
}))
