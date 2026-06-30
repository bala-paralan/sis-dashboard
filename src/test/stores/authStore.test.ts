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
}))

import * as authApi from '@/api/auth'
import * as clientApi from '@/api/client'

const mockUser = {
  id: '1',
  email: 'operator@test.com',
  displayName: 'Operator',
  role: 'OPERATOR' as const,
  createdAt: '2024-01-01T00:00:00Z',
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

describe('authStore', () => {
  describe('initial state', () => {
    it('starts unauthenticated', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('starts with null user', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('starts with no error', () => {
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('login', () => {
    it('sets isAuthenticated and user on success', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('operator@test.com', 'password')
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('sets error and remains unauthenticated on failure', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
      await act(async () => {
        try { await useAuthStore.getState().login('bad@test.com', 'wrong') } catch {}
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().error).toBe('Invalid credentials')
    })

    it('sets isLoading true during request', async () => {
      let resolveLogin!: (v: typeof mockUser) => void
      vi.mocked(authApi.login).mockReturnValue(
        new Promise((res) => { resolveLogin = res })
      )
      const loginPromise = act(async () => {
        useAuthStore.getState().login('a@b.com', 'pass').catch(() => {})
      })
      expect(useAuthStore.getState().isLoading).toBe(true)
      resolveLogin(mockUser)
      await loginPromise
    })

    it('throws so caller can handle the error', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Server error'))
      await expect(
        act(async () => useAuthStore.getState().login('a@b.com', 'p'))
      ).rejects.toThrow('Server error')
    })
  })

  describe('logout', () => {
    it('clears user and isAuthenticated', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true })
      vi.mocked(authApi.logout).mockResolvedValue()
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('clears state even if API logout fails', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true })
      vi.mocked(authApi.logout).mockRejectedValue(new Error('network'))
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('initFromStorage', () => {
    it('sets user when valid token in storage', async () => {
      vi.mocked(clientApi.getAccessToken).mockReturnValue('valid-token')
      vi.mocked(authApi.getMe).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().initFromStorage()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('does nothing when no token in storage', async () => {
      vi.mocked(clientApi.getAccessToken).mockReturnValue(null)
      await act(async () => {
        await useAuthStore.getState().initFromStorage()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(authApi.getMe).not.toHaveBeenCalled()
    })

    it('clears tokens and stays unauthenticated when token is invalid', async () => {
      vi.mocked(clientApi.getAccessToken).mockReturnValue('expired-token')
      vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'))
      await act(async () => {
        await useAuthStore.getState().initFromStorage()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(clientApi.clearTokens).toHaveBeenCalled()
    })
  })

  describe('clearError', () => {
    it('resets error to null', () => {
      useAuthStore.setState({ error: 'Some error' })
      act(() => { useAuthStore.getState().clearError() })
      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})
