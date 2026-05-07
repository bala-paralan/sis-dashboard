import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

const mockUser = {
  id: 'u-001',
  email: 'operator@iinvsys.com',
  displayName: 'Operator One',
  role: 'OPERATOR' as const,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockTokens = {
  access_token: 'access-abc',
  refresh_token: 'refresh-xyz',
  token_type: 'Bearer',
}

function mockFetchSequence(...responses: unknown[]) {
  let call = 0
  global.fetch = vi.fn(async () => {
    const body = responses[call++] ?? {}
    return {
      ok: true,
      status: 200,
      json: async () => body,
    } as Response
  })
}

function mockFetchError(message: string) {
  global.fetch = vi.fn(async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: message }),
  } as Response))
}

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    act(() => {
      useAuthStore.setState({ user: null, loading: false, error: null })
    })
    vi.restoreAllMocks()
  })

  it('starts with null user and no error', () => {
    const { user, loading, error } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(loading).toBe(false)
    expect(error).toBeNull()
  })

  it('login: sets user on success', async () => {
    mockFetchSequence(mockTokens, mockUser)
    await act(async () => {
      await useAuthStore.getState().login('operator@iinvsys.com', 'secret')
    })
    expect(useAuthStore.getState().user).toEqual(mockUser)
    expect(useAuthStore.getState().error).toBeNull()
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('login: stores tokens in localStorage', async () => {
    mockFetchSequence(mockTokens, mockUser)
    await act(async () => {
      await useAuthStore.getState().login('operator@iinvsys.com', 'secret')
    })
    expect(localStorage.getItem('sos_access_token')).toBe('access-abc')
    expect(localStorage.getItem('sos_refresh_token')).toBe('refresh-xyz')
  })

  it('login: sets error on failure', async () => {
    mockFetchError('Invalid credentials')
    await act(async () => {
      await useAuthStore.getState().login('bad@bad.com', 'wrong')
    })
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().error).toBe('Invalid credentials')
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('logout: clears user and tokens', async () => {
    // Seed a logged-in state
    localStorage.setItem('sos_access_token', 'access-abc')
    localStorage.setItem('sos_refresh_token', 'refresh-xyz')
    act(() => {
      useAuthStore.setState({ user: mockUser })
    })
    global.fetch = vi.fn(async () => ({ ok: true, status: 204, json: async () => ({}) } as Response))

    await act(async () => {
      await useAuthStore.getState().logout()
    })
    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem('sos_access_token')).toBeNull()
    expect(localStorage.getItem('sos_refresh_token')).toBeNull()
  })

  it('checkSession: restores user when token exists', async () => {
    localStorage.setItem('sos_access_token', 'access-abc')
    global.fetch = vi.fn(async () => ({
      ok: true, status: 200, json: async () => mockUser,
    } as Response))

    await act(async () => {
      await useAuthStore.getState().checkSession()
    })
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('checkSession: does nothing when no token', async () => {
    global.fetch = vi.fn()
    await act(async () => {
      await useAuthStore.getState().checkSession()
    })
    expect(global.fetch).not.toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('checkSession: clears user on 401', async () => {
    localStorage.setItem('sos_access_token', 'expired-token')
    mockFetchError('Unauthorized')
    await act(async () => {
      await useAuthStore.getState().checkSession()
    })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('clearError: resets error to null', () => {
    act(() => { useAuthStore.setState({ error: 'some error' }) })
    act(() => { useAuthStore.getState().clearError() })
    expect(useAuthStore.getState().error).toBeNull()
  })
})
