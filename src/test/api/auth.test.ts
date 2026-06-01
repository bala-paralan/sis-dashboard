import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { login, logout, getMe } from '@/api/auth'
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '@/api/client'

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return {
    ...actual,
    apiFetch: vi.fn(),
  }
})

import * as clientModule from '@/api/client'

const mockMe = {
  id:          'user-001',
  email:       'test@example.com',
  displayName: 'Test User',
  role:        'OPERATOR' as const,
  createdAt:   '2026-01-01T00:00:00.000Z',
}

const mockTokens = {
  access_token:  'acc-token',
  refresh_token: 'ref-token',
  token_type:    'Bearer',
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

describe('login', () => {
  it('calls /auth/login then /auth/me', async () => {
    const apiFetch = vi.mocked(clientModule.apiFetch)
    apiFetch
      .mockResolvedValueOnce(mockTokens)
      .mockResolvedValueOnce(mockMe)

    await login('test@example.com', 'password123')

    expect(apiFetch).toHaveBeenCalledTimes(2)
    expect(apiFetch).toHaveBeenNthCalledWith(1, '/auth/login', expect.objectContaining({ method: 'POST' }))
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/auth/me')
  })

  it('returns MeResponse from /auth/me', async () => {
    const apiFetch = vi.mocked(clientModule.apiFetch)
    apiFetch
      .mockResolvedValueOnce(mockTokens)
      .mockResolvedValueOnce(mockMe)

    const result = await login('test@example.com', 'pw')
    expect(result).toEqual(mockMe)
  })

  it('stores access and refresh tokens after login', async () => {
    const apiFetch = vi.mocked(clientModule.apiFetch)
    apiFetch
      .mockResolvedValueOnce(mockTokens)
      .mockResolvedValueOnce(mockMe)

    await login('test@example.com', 'pw')

    expect(getAccessToken()).toBe('acc-token')
    expect(getRefreshToken()).toBe('ref-token')
  })
})

describe('logout', () => {
  it('calls /auth/logout with the refresh token', async () => {
    storeTokens('acc', 'ref-456')
    const apiFetch = vi.mocked(clientModule.apiFetch)
    apiFetch.mockResolvedValueOnce(undefined)

    await logout()

    expect(apiFetch).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('ref-456') })
    )
  })

  it('clears tokens from localStorage after logout', async () => {
    storeTokens('acc', 'ref')
    const apiFetch = vi.mocked(clientModule.apiFetch)
    apiFetch.mockResolvedValueOnce(undefined)

    await logout()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('skips /auth/logout call when no refresh token available', async () => {
    clearTokens()
    const apiFetch = vi.mocked(clientModule.apiFetch)

    await logout()

    expect(apiFetch).not.toHaveBeenCalled()
  })

  it('clears tokens even if logout API call fails', async () => {
    storeTokens('acc', 'ref')
    const apiFetch = vi.mocked(clientModule.apiFetch)
    apiFetch.mockRejectedValueOnce(new Error('Network error'))

    await logout()

    expect(getAccessToken()).toBeNull()
  })
})

describe('getMe', () => {
  it('calls /auth/me and returns user info', async () => {
    const apiFetch = vi.mocked(clientModule.apiFetch)
    apiFetch.mockResolvedValueOnce(mockMe)

    const result = await getMe()

    expect(apiFetch).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(mockMe)
  })
})
