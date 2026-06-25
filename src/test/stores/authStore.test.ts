import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'

// ── Mock auth API ─────────────────────────────────────────────────────────────
vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  getMe:  vi.fn(),
}))

vi.mock('@/api/client', () => ({
  getAccessToken:  vi.fn(),
  getRefreshToken: vi.fn(),
  clearTokens:     vi.fn(),
  storeTokens:     vi.fn(),
}))

import * as authApi  from '@/api/auth'
import * as client   from '@/api/client'

const mockUser = {
  id:          'u1',
  email:       'operator@sis.local',
  displayName: 'Operator One',
  role:        'OPERATOR' as const,
  createdAt:   '2024-01-01T00:00:00Z',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: false, error: null })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ── Initial state ──────────────────────────────────────────────────────────
  it('starts with null user, not loading, no error', () => {
    const { user, loading, error } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(loading).toBe(false)
    expect(error).toBeNull()
  })

  // ── login() success ────────────────────────────────────────────────────────
  it('sets user on successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValue(mockUser)
    await useAuthStore.getState().login('operator@sis.local', 'secret')
    expect(useAuthStore.getState().user).toEqual(mockUser)
    expect(useAuthStore.getState().loading).toBe(false)
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('sets loading=true while login is in-flight', async () => {
    let resolve!: (v: typeof mockUser) => void
    vi.mocked(authApi.login).mockReturnValue(new Promise((r) => { resolve = r }))
    const loginPromise = useAuthStore.getState().login('a@b.com', 'p')
    expect(useAuthStore.getState().loading).toBe(true)
    resolve(mockUser)
    await loginPromise
    expect(useAuthStore.getState().loading).toBe(false)
  })

  // ── login() failure ────────────────────────────────────────────────────────
  it('sets error on failed login', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
    await expect(useAuthStore.getState().login('bad@user.com', 'wrong')).rejects.toThrow()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().error).toBe('Invalid credentials')
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('sets generic error message for non-Error rejections', async () => {
    vi.mocked(authApi.login).mockRejectedValue('something bad')
    await expect(useAuthStore.getState().login('a@b.com', 'p')).rejects.toBeTruthy()
    expect(useAuthStore.getState().error).toBe('Login failed')
  })

  // ── logout() ──────────────────────────────────────────────────────────────
  it('clears user on logout', async () => {
    useAuthStore.setState({ user: mockUser })
    await useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('clears error on logout', async () => {
    useAuthStore.setState({ user: mockUser, error: 'stale error' })
    await useAuthStore.getState().logout()
    expect(useAuthStore.getState().error).toBeNull()
  })

  // ── checkAuth() ───────────────────────────────────────────────────────────
  it('does nothing when no access token exists', async () => {
    vi.mocked(client.getAccessToken).mockReturnValue(null)
    await useAuthStore.getState().checkAuth()
    expect(useAuthStore.getState().user).toBeNull()
    expect(authApi.getMe).not.toHaveBeenCalled()
  })

  it('sets user when getMe succeeds', async () => {
    vi.mocked(client.getAccessToken).mockReturnValue('token-abc')
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser)
    await useAuthStore.getState().checkAuth()
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('clears user when getMe fails', async () => {
    vi.mocked(client.getAccessToken).mockReturnValue('expired-token')
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('401'))
    await useAuthStore.getState().checkAuth()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().loading).toBe(false)
  })
})
