import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

// Mock the auth API module
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
}))

import { login as mockLogin, logout as mockLogout, getMe as mockGetMe } from '@/api/auth'
import { getAccessToken as mockGetAccessToken } from '@/api/client'

const mockUser = {
  id: 'usr-1',
  email: 'operator@site.mil',
  displayName: 'Alpha Operator',
  role: 'OPERATOR' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isChecking: false,
    error: null,
  })
})

describe('useAuthStore', () => {
  describe('login', () => {
    it('sets user and isAuthenticated on successful login', async () => {
      vi.mocked(mockLogin).mockResolvedValueOnce(mockUser)

      await act(async () => {
        await useAuthStore.getState().login('operator@site.mil', 'secret')
      })

      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('sets error and rethrows on login failure', async () => {
      vi.mocked(mockLogin).mockRejectedValueOnce(new Error('Invalid credentials'))

      await act(async () => {
        await expect(
          useAuthStore.getState().login('x@y.com', 'wrong')
        ).rejects.toThrow('Invalid credentials')
      })

      expect(useAuthStore.getState().error).toBe('Invalid credentials')
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears user and isAuthenticated after logout', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true })
      vi.mocked(mockLogout).mockResolvedValueOnce(undefined)

      await act(async () => {
        await useAuthStore.getState().logout()
      })

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('still clears state if logout API call throws', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true })
      vi.mocked(mockLogout).mockRejectedValueOnce(new Error('network'))

      await act(async () => {
        await useAuthStore.getState().logout()
      })

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('checkAuth', () => {
    it('sets isAuthenticated when token exists and /me succeeds', async () => {
      vi.mocked(mockGetAccessToken).mockReturnValue('valid-token')
      vi.mocked(mockGetMe).mockResolvedValueOnce(mockUser)

      await act(async () => {
        await useAuthStore.getState().checkAuth()
      })

      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().isChecking).toBe(false)
    })

    it('sets isAuthenticated=false when no token is stored', async () => {
      vi.mocked(mockGetAccessToken).mockReturnValue(null)

      await act(async () => {
        await useAuthStore.getState().checkAuth()
      })

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().isChecking).toBe(false)
      expect(mockGetMe).not.toHaveBeenCalled()
    })

    it('sets isAuthenticated=false when /me call fails', async () => {
      vi.mocked(mockGetAccessToken).mockReturnValue('expired-token')
      vi.mocked(mockGetMe).mockRejectedValueOnce(new Error('Unauthorized'))

      await act(async () => {
        await useAuthStore.getState().checkAuth()
      })

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isChecking).toBe(false)
    })
  })

  describe('clearError', () => {
    it('clears the error field', () => {
      useAuthStore.setState({ error: 'Some error' })
      act(() => {
        useAuthStore.getState().clearError()
      })
      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})
