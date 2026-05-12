import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn(),
  getMe:  vi.fn(),
}))

vi.mock('@/api/client', () => ({
  getAccessToken: vi.fn(),
  clearTokens:    vi.fn(),
  storeTokens:    vi.fn(),
}))

import { login, logout, getMe } from '@/api/auth'
import { getAccessToken, clearTokens } from '@/api/client'

const mockUser = {
  id:          'u-001',
  email:       'operator@iinvsys.mil',
  displayName: 'Alpha Operator',
  role:        'OPERATOR' as const,
  createdAt:   '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  useAuthStore.setState({ user: null, loading: false, error: null })
  vi.clearAllMocks()
})

describe('useAuthStore', () => {
  describe('initial state', () => {
    it('user is null', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })
    it('loading is false', () => {
      expect(useAuthStore.getState().loading).toBe(false)
    })
    it('error is null', () => {
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('login', () => {
    it('sets user on successful login', async () => {
      vi.mocked(login).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('operator@iinvsys.mil', 'pass')
      })
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('sets error on failed login', async () => {
      vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))
      await act(async () => {
        await useAuthStore.getState().login('bad@email.com', 'wrong')
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().error).toBe('Invalid credentials')
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('sets loading to false after failure', async () => {
      vi.mocked(login).mockRejectedValue(new Error('Server error'))
      await act(async () => {
        await useAuthStore.getState().login('a@b.com', 'p')
      })
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears user on logout', async () => {
      useAuthStore.setState({ user: mockUser })
      vi.mocked(logout).mockResolvedValue(undefined)
      await act(async () => { await useAuthStore.getState().logout() })
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('calls clearTokens', async () => {
      vi.mocked(logout).mockResolvedValue(undefined)
      await act(async () => { await useAuthStore.getState().logout() })
      expect(clearTokens).toHaveBeenCalled()
    })

    it('still clears user when logout API throws', async () => {
      useAuthStore.setState({ user: mockUser })
      vi.mocked(logout).mockRejectedValue(new Error('Network error'))
      await act(async () => { await useAuthStore.getState().logout() })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('restore', () => {
    it('restores user when access token is present', async () => {
      vi.mocked(getAccessToken).mockReturnValue('valid-token')
      vi.mocked(getMe).mockResolvedValue(mockUser)
      await act(async () => { await useAuthStore.getState().restore() })
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('does nothing when no access token', async () => {
      vi.mocked(getAccessToken).mockReturnValue(null)
      await act(async () => { await useAuthStore.getState().restore() })
      expect(getMe).not.toHaveBeenCalled()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('clears tokens and leaves user null when getMe fails', async () => {
      vi.mocked(getAccessToken).mockReturnValue('expired-token')
      vi.mocked(getMe).mockRejectedValue(new Error('Unauthorized'))
      await act(async () => { await useAuthStore.getState().restore() })
      expect(clearTokens).toHaveBeenCalled()
      expect(useAuthStore.getState().user).toBeNull()
    })
  })
})
