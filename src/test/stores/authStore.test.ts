import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn(),
  getMe:  vi.fn(),
}))

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, getAccessToken: vi.fn() }
})

import * as authApi from '@/api/auth'
import * as clientApi from '@/api/client'

const mockMe = {
  id:          'user-001',
  email:       'test@example.com',
  displayName: 'Test User',
  role:        'OPERATOR' as const,
  createdAt:   '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  useAuthStore.setState({ user: null, loading: false, error: null, isAuthenticated: false })
  vi.clearAllMocks()
})

describe('useAuthStore — initial state', () => {
  it('user is null', () => {
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('isAuthenticated is false', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('loading is false', () => {
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('error is null', () => {
    expect(useAuthStore.getState().error).toBeNull()
  })
})

describe('login', () => {
  it('sets user and isAuthenticated on success', async () => {
    vi.mocked(authApi.login).mockResolvedValue(mockMe)

    await act(async () => { await useAuthStore.getState().login('test@test.com', 'pw') })

    expect(useAuthStore.getState().user).toEqual(mockMe)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('sets error on failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

    await act(async () => {
      try { await useAuthStore.getState().login('bad@bad.com', 'wrong') } catch {}
    })

    expect(useAuthStore.getState().error).toBe('Invalid credentials')
  })

  it('sets loading to false after success', async () => {
    vi.mocked(authApi.login).mockResolvedValue(mockMe)

    await act(async () => { await useAuthStore.getState().login('t@t.com', 'pw') })

    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('sets loading to false after failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('fail'))

    await act(async () => {
      try { await useAuthStore.getState().login('t@t.com', 'pw') } catch {}
    })

    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('re-throws the error so callers can handle it', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid'))

    await expect(act(async () => {
      await useAuthStore.getState().login('t@t.com', 'pw')
    })).rejects.toThrow('Invalid')
  })
})

describe('logout', () => {
  it('clears user and isAuthenticated', async () => {
    useAuthStore.setState({ user: mockMe, isAuthenticated: true })
    vi.mocked(authApi.logout).mockResolvedValue(undefined)

    await act(async () => { await useAuthStore.getState().logout() })

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('clears state even if logout API throws', async () => {
    useAuthStore.setState({ user: mockMe, isAuthenticated: true })
    vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'))

    await act(async () => { await useAuthStore.getState().logout() })

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().loading).toBe(false)
  })
})

describe('checkAuth', () => {
  it('sets user when access token exists and getMe succeeds', async () => {
    vi.mocked(clientApi.getAccessToken).mockReturnValue('valid-token')
    vi.mocked(authApi.getMe).mockResolvedValue(mockMe)

    await act(async () => { await useAuthStore.getState().checkAuth() })

    expect(useAuthStore.getState().user).toEqual(mockMe)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('sets isAuthenticated false when no access token', async () => {
    vi.mocked(clientApi.getAccessToken).mockReturnValue(null)

    await act(async () => { await useAuthStore.getState().checkAuth() })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('sets isAuthenticated false when getMe fails (expired token)', async () => {
    vi.mocked(clientApi.getAccessToken).mockReturnValue('expired-token')
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'))

    await act(async () => { await useAuthStore.getState().checkAuth() })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().loading).toBe(false)
  })
})

describe('clearError', () => {
  it('clears the error field', () => {
    useAuthStore.setState({ error: 'Some error' })
    act(() => { useAuthStore.getState().clearError() })
    expect(useAuthStore.getState().error).toBeNull()
  })
})
