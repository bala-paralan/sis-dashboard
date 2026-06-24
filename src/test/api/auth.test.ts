import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock the API client ───────────────────────────────────────────────────────
vi.mock('@/api/client', () => ({
  apiFetch:      vi.fn(),
  storeTokens:   vi.fn(),
  clearTokens:   vi.fn(),
  getRefreshToken: vi.fn(),
}))

import { apiFetch, storeTokens, clearTokens, getRefreshToken } from '@/api/client'
import { login, logout, getMe } from '@/api/auth'

beforeEach(() => vi.clearAllMocks())

describe('login', () => {
  it('calls POST /auth/login with email and password', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ access_token: 'acc', refresh_token: 'ref', token_type: 'Bearer' })
      .mockResolvedValueOnce({ id: 'u1', email: 'x@y.com', displayName: null, role: 'OPERATOR', createdAt: '' })

    await login('x@y.com', 'pass123')

    expect(vi.mocked(apiFetch)).toHaveBeenNthCalledWith(
      1,
      '/auth/login',
      expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify({ email: 'x@y.com', password: 'pass123' }),
      })
    )
  })

  it('calls storeTokens with the returned access and refresh tokens', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ access_token: 'acc-tok', refresh_token: 'ref-tok', token_type: 'Bearer' })
      .mockResolvedValueOnce({ id: 'u1', email: 'a@b.com', displayName: null, role: 'ADMIN', createdAt: '' })

    await login('a@b.com', 'secret')
    expect(vi.mocked(storeTokens)).toHaveBeenCalledWith('acc-tok', 'ref-tok')
  })

  it('calls GET /auth/me after storing tokens and returns user', async () => {
    const user = { id: 'u2', email: 'a@b.com', displayName: 'Alice', role: 'ADMIN' as const, createdAt: '' }
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ access_token: 'a', refresh_token: 'r', token_type: 'Bearer' })
      .mockResolvedValueOnce(user)

    const result = await login('a@b.com', 'pw')
    expect(vi.mocked(apiFetch)).toHaveBeenNthCalledWith(2, '/auth/me')
    expect(result).toEqual(user)
  })
})

describe('logout', () => {
  it('calls POST /auth/logout with the refresh token when one exists', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('my-refresh')
    vi.mocked(apiFetch).mockResolvedValue(undefined)

    await logout()

    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify({ refresh_token: 'my-refresh' }),
      })
    )
  })

  it('calls clearTokens after logout', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('my-refresh')
    vi.mocked(apiFetch).mockResolvedValue(undefined)

    await logout()
    expect(vi.mocked(clearTokens)).toHaveBeenCalled()
  })

  it('does not call POST /auth/logout when no refresh token', async () => {
    vi.mocked(getRefreshToken).mockReturnValue(null)

    await logout()
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
    expect(vi.mocked(clearTokens)).toHaveBeenCalled()
  })

  it('still calls clearTokens even when the logout request fails', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('ref-tok')
    vi.mocked(apiFetch).mockRejectedValue(new Error('Network error'))

    await logout()
    expect(vi.mocked(clearTokens)).toHaveBeenCalled()
  })
})

describe('getMe', () => {
  it('calls GET /auth/me and returns the user object', async () => {
    const user = { id: 'u3', email: 'b@c.com', displayName: 'Bob', role: 'VIEWER' as const, createdAt: '' }
    vi.mocked(apiFetch).mockResolvedValue(user)

    const result = await getMe()
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(user)
  })
})
