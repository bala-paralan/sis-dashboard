import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clearTokens, storeTokens, getAccessToken, getRefreshToken } from '@/api/client'

// Mock the client module before importing auth
vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return {
    ...actual,
    apiFetch: vi.fn(),
  }
})

import { login, logout, getMe } from '@/api/auth'
import { apiFetch } from '@/api/client'

beforeEach(() => {
  clearTokens()
  vi.clearAllMocks()
})

// ── login ──────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('calls /auth/login with email and password', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ access_token: 'acc', refresh_token: 'ref', token_type: 'Bearer' })
      .mockResolvedValueOnce({ id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' })

    await login('op@test.com', 'secret')

    expect(vi.mocked(apiFetch).mock.calls[0][0]).toBe('/auth/login')
    expect(vi.mocked(apiFetch).mock.calls[0][1]?.method).toBe('POST')
    expect(vi.mocked(apiFetch).mock.calls[0][1]?.body).toContain('op@test.com')
  })

  it('stores tokens returned by /auth/login', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ access_token: 'acc-xyz', refresh_token: 'ref-xyz', token_type: 'Bearer' })
      .mockResolvedValueOnce({ id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' })

    await login('op@test.com', 'secret')

    expect(getAccessToken()).toBe('acc-xyz')
    expect(getRefreshToken()).toBe('ref-xyz')
  })

  it('calls /auth/me after storing tokens', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ access_token: 'acc', refresh_token: 'ref', token_type: 'Bearer' })
      .mockResolvedValueOnce({ id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' })

    await login('op@test.com', 'secret')

    expect(vi.mocked(apiFetch).mock.calls[1][0]).toBe('/auth/me')
  })

  it('returns MeResponse from /auth/me', async () => {
    const meResponse = { id: '42', email: 'admin@test.com', displayName: 'Admin', role: 'ADMIN' as const, createdAt: '2026-01-01' }
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ access_token: 'acc', refresh_token: 'ref', token_type: 'Bearer' })
      .mockResolvedValueOnce(meResponse)

    const result = await login('admin@test.com', 'pass')
    expect(result).toEqual(meResponse)
  })

  it('propagates errors from /auth/login', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Invalid credentials'))
    await expect(login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })
})

// ── logout ──────────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('calls /auth/logout when refresh token is present', async () => {
    storeTokens('acc', 'ref-token')
    vi.mocked(apiFetch).mockResolvedValueOnce(undefined)

    await logout()

    expect(vi.mocked(apiFetch).mock.calls[0][0]).toBe('/auth/logout')
    expect(vi.mocked(apiFetch).mock.calls[0][1]?.method).toBe('POST')
  })

  it('includes refresh_token in logout body', async () => {
    storeTokens('acc', 'my-refresh-token')
    vi.mocked(apiFetch).mockResolvedValueOnce(undefined)

    await logout()

    expect(vi.mocked(apiFetch).mock.calls[0][1]?.body).toContain('my-refresh-token')
  })

  it('clears tokens after logout', async () => {
    storeTokens('acc', 'ref')
    vi.mocked(apiFetch).mockResolvedValueOnce(undefined)

    await logout()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('does not call /auth/logout when no refresh token', async () => {
    // No tokens stored
    await logout()
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })

  it('still clears tokens even when logout API call fails', async () => {
    storeTokens('acc', 'ref')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Network error'))

    await logout()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})

// ── getMe ──────────────────────────────────────────────────────────────────────

describe('getMe', () => {
  it('calls /auth/me', async () => {
    const me = { id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR' as const, createdAt: '' }
    vi.mocked(apiFetch).mockResolvedValueOnce(me)

    const result = await getMe()

    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(me)
  })
})
