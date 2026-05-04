import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

// ── Mock auth API ─────────────────────────────────────────────────────────────
vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn(),
  getMe:  vi.fn(),
}))

vi.mock('@/api/client', () => ({
  getAccessToken: vi.fn(),
}))

import * as authApi from '@/api/auth'
import * as clientApi from '@/api/client'

const mockUser = {
  id:          'user-001',
  email:       'operator@iinvsys.mil',
  displayName: 'Operator One',
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

  describe('login()', () => {
    it('sets user on successful login', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('operator@iinvsys.mil', 'secret')
      })
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('sets error on failed login', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
      await act(async () => {
        await useAuthStore.getState().login('bad@email.com', 'wrong')
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().error).toBe('Invalid credentials')
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('sets loading true while request is in-flight', async () => {
      let resolve!: (v: typeof mockUser) => void
      vi.mocked(authApi.login).mockReturnValue(new Promise((r) => { resolve = r }))
      const promise = act(async () => {
        void useAuthStore.getState().login('operator@iinvsys.mil', 'secret')
      })
      expect(useAuthStore.getState().loading).toBe(true)
      resolve(mockUser)
      await promise
    })
  })

  describe('logout()', () => {
    it('clears user after logout', async () => {
      useAuthStore.setState({ user: mockUser })
      vi.mocked(authApi.logout).mockResolvedValue(undefined)
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('clears user even if API call throws', async () => {
      useAuthStore.setState({ user: mockUser })
      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'))
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('bootstrap()', () => {
    it('sets user when a valid token exists', async () => {
      vi.mocked(clientApi.getAccessToken).mockReturnValue('token-abc')
      vi.mocked(authApi.getMe).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('does nothing when no access token is stored', async () => {
      vi.mocked(clientApi.getAccessToken).mockReturnValue(null)
      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })
      expect(authApi.getMe).not.toHaveBeenCalled()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('clears user when /me call fails', async () => {
      vi.mocked(clientApi.getAccessToken).mockReturnValue('expired-token')
      vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'))
      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })
})
