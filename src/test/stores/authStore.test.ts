import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
}))
vi.mock('@/api/client', () => ({
  getAccessToken: vi.fn(),
  clearTokens: vi.fn(),
  storeTokens: vi.fn(),
  getRefreshToken: vi.fn(),
  apiFetch: vi.fn(),
}))

import { login as mockLogin, logout as mockLogout, getMe as mockGetMe } from '@/api/auth'
import { getAccessToken as mockGetAccessToken } from '@/api/client'

const mockUser = {
  id: 'user-001',
  email: 'operator@example.com',
  displayName: 'Test Operator',
  role: 'OPERATOR' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })
  vi.clearAllMocks()
})

describe('useAuthStore', () => {
  describe('initial state', () => {
    it('starts unauthenticated with no user', () => {
      const { user, isAuthenticated } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(isAuthenticated).toBe(false)
    })

    it('starts with no error and not loading', () => {
      const { error, isLoading } = useAuthStore.getState()
      expect(error).toBeNull()
      expect(isLoading).toBe(false)
    })
  })

  describe('login', () => {
    it('sets user and isAuthenticated on success', async () => {
      vi.mocked(mockLogin).mockResolvedValueOnce(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('operator@example.com', 'secret')
      })
      const { user, isAuthenticated } = useAuthStore.getState()
      expect(user).toEqual(mockUser)
      expect(isAuthenticated).toBe(true)
    })

    it('sets error and clears isLoading on failure', async () => {
      vi.mocked(mockLogin).mockRejectedValueOnce(new Error('Invalid credentials'))
      await act(async () => {
        try {
          await useAuthStore.getState().login('bad@example.com', 'wrong')
        } catch {
          // expected
        }
      })
      const { error, isLoading, isAuthenticated } = useAuthStore.getState()
      expect(error).toBe('Invalid credentials')
      expect(isLoading).toBe(false)
      expect(isAuthenticated).toBe(false)
    })

    it('clears previous error before attempting login', async () => {
      useAuthStore.setState({ error: 'previous error' })
      vi.mocked(mockLogin).mockResolvedValueOnce(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('operator@example.com', 'secret')
      })
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears user and isAuthenticated', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true })
      vi.mocked(mockLogout).mockResolvedValueOnce(undefined)
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      const { user, isAuthenticated } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(isAuthenticated).toBe(false)
    })

    it('succeeds even if API logout call fails', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true })
      vi.mocked(mockLogout).mockRejectedValueOnce(new Error('network error'))
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('checkSession', () => {
    it('sets isAuthenticated from getMe when access token exists', async () => {
      vi.mocked(mockGetAccessToken).mockReturnValue('valid-token')
      vi.mocked(mockGetMe).mockResolvedValueOnce(mockUser)
      await act(async () => {
        await useAuthStore.getState().checkSession()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('stays unauthenticated when no access token', async () => {
      vi.mocked(mockGetAccessToken).mockReturnValue(null)
      await act(async () => {
        await useAuthStore.getState().checkSession()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('stays unauthenticated when getMe fails', async () => {
      vi.mocked(mockGetAccessToken).mockReturnValue('expired-token')
      vi.mocked(mockGetMe).mockRejectedValueOnce(new Error('401'))
      await act(async () => {
        await useAuthStore.getState().checkSession()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('clearError', () => {
    it('clears the error field', () => {
      useAuthStore.setState({ error: 'some error' })
      act(() => {
        useAuthStore.getState().clearError()
      })
      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})
