import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'
import type { MeResponse } from '@/api/auth'

// ── API mocks ──────────────────────────────────────────────────────────────────
vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn(),
  getMe:  vi.fn(),
}))

vi.mock('@/api/client', () => ({
  getAccessToken:  vi.fn(),
  clearTokens:     vi.fn(),
  storeTokens:     vi.fn(),
  getRefreshToken: vi.fn(),
  apiFetch:        vi.fn(),
}))

import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import { getAccessToken } from '@/api/client'

const mockedLogin         = vi.mocked(apiLogin)
const mockedLogout        = vi.mocked(apiLogout)
const mockedGetMe         = vi.mocked(getMe)
const mockedGetAccessToken = vi.mocked(getAccessToken)

function makeUser(overrides: Partial<MeResponse> = {}): MeResponse {
  return {
    id:          'user-1',
    email:       'admin@sis.local',
    displayName: 'Admin',
    role:        'ADMIN',
    createdAt:   '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: null, loading: false, error: null })
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
      const user = makeUser()
      mockedLogin.mockResolvedValue(user)
      await act(() => useAuthStore.getState().login('admin@sis.local', 'pass'))
      expect(useAuthStore.getState().user).toEqual(user)
    })

    it('clears loading after successful login', async () => {
      mockedLogin.mockResolvedValue(makeUser())
      await act(() => useAuthStore.getState().login('a@b.com', 'pass'))
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('sets error on login failure', async () => {
      mockedLogin.mockRejectedValue(new Error('Unauthorized'))
      await act(async () => {
        try { await useAuthStore.getState().login('bad@b.com', 'wrong') } catch { /* expected */ }
      })
      expect(useAuthStore.getState().error).toBe('Unauthorized')
    })

    it('clears loading after failed login', async () => {
      mockedLogin.mockRejectedValue(new Error('Fail'))
      await act(async () => {
        try { await useAuthStore.getState().login('a@b.com', 'bad') } catch { /* expected */ }
      })
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('does not set user on failure', async () => {
      mockedLogin.mockRejectedValue(new Error('Fail'))
      await act(async () => {
        try { await useAuthStore.getState().login('a@b.com', 'bad') } catch { /* expected */ }
      })
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('re-throws the error so the caller can catch it', async () => {
      mockedLogin.mockRejectedValue(new Error('Boom'))
      await expect(
        act(() => useAuthStore.getState().login('a@b.com', 'x'))
      ).rejects.toThrow('Boom')
    })

    it('calls apiLogin with provided credentials', async () => {
      mockedLogin.mockResolvedValue(makeUser())
      await act(() => useAuthStore.getState().login('user@x.com', 'mypass'))
      expect(mockedLogin).toHaveBeenCalledWith('user@x.com', 'mypass')
    })
  })

  describe('logout', () => {
    it('clears user after logout', async () => {
      useAuthStore.setState({ user: makeUser() })
      mockedLogout.mockResolvedValue(undefined)
      await act(() => useAuthStore.getState().logout())
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('calls apiLogout', async () => {
      mockedLogout.mockResolvedValue(undefined)
      await act(() => useAuthStore.getState().logout())
      expect(mockedLogout).toHaveBeenCalledOnce()
    })
  })

  describe('loadMe', () => {
    it('does nothing when no access token', async () => {
      mockedGetAccessToken.mockReturnValue(null)
      await act(() => useAuthStore.getState().loadMe())
      expect(mockedGetMe).not.toHaveBeenCalled()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('fetches and stores user when access token exists', async () => {
      const user = makeUser()
      mockedGetAccessToken.mockReturnValue('some-jwt')
      mockedGetMe.mockResolvedValue(user)
      await act(() => useAuthStore.getState().loadMe())
      expect(useAuthStore.getState().user).toEqual(user)
    })

    it('silently clears loading on getMe failure', async () => {
      mockedGetAccessToken.mockReturnValue('expired-jwt')
      mockedGetMe.mockRejectedValue(new Error('401'))
      await act(() => useAuthStore.getState().loadMe())
      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })
})
