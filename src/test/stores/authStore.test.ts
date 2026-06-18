import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

// ── Mock the auth API ─────────────────────────────────────────────────────────
vi.mock('@/api/auth', () => ({
  login:   vi.fn(),
  logout:  vi.fn(),
  getMe:   vi.fn(),
}))

vi.mock('@/api/client', () => ({
  getAccessToken:  vi.fn(),
  getRefreshToken: vi.fn(),
  clearTokens:     vi.fn(),
  storeTokens:     vi.fn(),
}))

import { login as mockLogin, logout as mockLogout, getMe as mockGetMe } from '@/api/auth'
import { getAccessToken } from '@/api/client'

const ME = {
  id:          'u-1',
  email:       'operator@example.com',
  displayName: 'Test Operator',
  role:        'OPERATOR' as const,
  createdAt:   '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: null, loading: false, error: null })
})

describe('authStore.init', () => {
  it('does nothing when no access token is stored', async () => {
    vi.mocked(getAccessToken).mockReturnValue(null)
    await act(async () => { await useAuthStore.getState().init() })
    expect(mockGetMe).not.toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('loads the user when a token exists', async () => {
    vi.mocked(getAccessToken).mockReturnValue('tok-abc')
    vi.mocked(mockGetMe).mockResolvedValue(ME)
    await act(async () => { await useAuthStore.getState().init() })
    expect(mockGetMe).toHaveBeenCalledOnce()
    expect(useAuthStore.getState().user).toEqual(ME)
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('clears user when getMe throws (expired token)', async () => {
    vi.mocked(getAccessToken).mockReturnValue('tok-expired')
    vi.mocked(mockGetMe).mockRejectedValue(new Error('Unauthorized'))
    await act(async () => { await useAuthStore.getState().init() })
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().loading).toBe(false)
  })
})

describe('authStore.login', () => {
  it('sets user on successful login', async () => {
    vi.mocked(mockLogin).mockResolvedValue(ME)
    await act(async () => {
      await useAuthStore.getState().login('operator@example.com', 'secret')
    })
    expect(mockLogin).toHaveBeenCalledWith('operator@example.com', 'secret')
    expect(useAuthStore.getState().user).toEqual(ME)
    expect(useAuthStore.getState().error).toBeNull()
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('sets error on failed login', async () => {
    vi.mocked(mockLogin).mockRejectedValue(new Error('Invalid credentials'))
    await act(async () => {
      await useAuthStore.getState().login('bad@user.com', 'wrong')
    })
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().error).toBe('Invalid credentials')
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('clears a previous error on new login attempt', async () => {
    useAuthStore.setState({ error: 'Previous error' })
    vi.mocked(mockLogin).mockResolvedValue(ME)
    await act(async () => {
      await useAuthStore.getState().login('operator@example.com', 'secret')
    })
    expect(useAuthStore.getState().error).toBeNull()
  })
})

describe('authStore.logout', () => {
  it('clears user and calls API logout', async () => {
    useAuthStore.setState({ user: ME })
    vi.mocked(mockLogout).mockResolvedValue(undefined)
    await act(async () => { await useAuthStore.getState().logout() })
    expect(mockLogout).toHaveBeenCalledOnce()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('clears user even if API logout throws', async () => {
    useAuthStore.setState({ user: ME })
    vi.mocked(mockLogout).mockRejectedValue(new Error('Network error'))
    await act(async () => { await useAuthStore.getState().logout() })
    expect(useAuthStore.getState().user).toBeNull()
  })
})
