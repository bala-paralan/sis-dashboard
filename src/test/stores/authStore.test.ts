import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
  getMe:  vi.fn(),
  login:  vi.fn(),
}))

vi.mock('@/api/client', () => ({
  getAccessToken:  vi.fn(() => null),
  clearTokens:     vi.fn(),
  storeTokens:     vi.fn(),
  getRefreshToken: vi.fn(() => null),
  apiFetch:        vi.fn(),
}))

const mockUser = {
  id:          'u1',
  email:       'op@iinvsys.mil',
  displayName: 'Operator One',
  role:        'OPERATOR' as const,
  createdAt:   '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useAuthStore.setState({ user: null, isInitialized: false })
})

describe('useAuthStore', () => {
  describe('initial state', () => {
    it('user is null', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('isInitialized is false', () => {
      expect(useAuthStore.getState().isInitialized).toBe(false)
    })
  })

  describe('setUser()', () => {
    it('stores the user and marks initialized', () => {
      useAuthStore.getState().setUser(mockUser)
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isInitialized).toBe(true)
    })

    it('accepts null to clear the user', () => {
      useAuthStore.getState().setUser(mockUser)
      useAuthStore.getState().setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('logout()', () => {
    it('clears user after logout', async () => {
      useAuthStore.getState().setUser(mockUser)
      await useAuthStore.getState().logout()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('marks initialized after logout', async () => {
      await useAuthStore.getState().logout()
      expect(useAuthStore.getState().isInitialized).toBe(true)
    })

    it('does not throw if API call fails', async () => {
      const { logout: apiLogout } = await import('@/api/auth')
      vi.mocked(apiLogout).mockRejectedValueOnce(new Error('network'))
      await expect(useAuthStore.getState().logout()).resolves.toBeUndefined()
    })
  })

  describe('hasToken()', () => {
    it('returns false when no token in localStorage', () => {
      expect(useAuthStore.getState().hasToken()).toBe(false)
    })

    it('returns true when access token is in localStorage', async () => {
      const { getAccessToken } = await import('@/api/client')
      vi.mocked(getAccessToken).mockReturnValueOnce('tok123')
      expect(useAuthStore.getState().hasToken()).toBe(true)
    })
  })
})
