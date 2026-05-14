import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import type { MeResponse } from '@/api/auth'

const mockUser: MeResponse = {
  id: 'u1',
  email: 'op@sis.local',
  displayName: 'Operator One',
  role: 'OPERATOR',
  createdAt: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false, error: null, isLoading: false })
  sessionStorage.clear()
  vi.unstubAllEnvs()
})

describe('authStore — login', () => {
  it('sets isAuthenticated to true after login', () => {
    useAuthStore.getState().login(mockUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('stores the user object', () => {
    useAuthStore.getState().login(mockUser)
    expect(useAuthStore.getState().user?.email).toBe('op@sis.local')
  })

  it('persists user to sessionStorage', () => {
    useAuthStore.getState().login(mockUser)
    const stored = sessionStorage.getItem('sis-auth-user')
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!).id).toBe('u1')
  })

  it('clears error on login', () => {
    useAuthStore.setState({ error: 'previous error' })
    useAuthStore.getState().login(mockUser)
    expect(useAuthStore.getState().error).toBeNull()
  })
})

describe('authStore — logout', () => {
  it('clears isAuthenticated on logout', () => {
    useAuthStore.getState().login(mockUser)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('clears user on logout', () => {
    useAuthStore.getState().login(mockUser)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('removes sessionStorage on logout', () => {
    useAuthStore.getState().login(mockUser)
    useAuthStore.getState().logout()
    expect(sessionStorage.getItem('sis-auth-user')).toBeNull()
  })
})

describe('authStore — hydrateFromSession', () => {
  it('restores user from sessionStorage', () => {
    sessionStorage.setItem('sis-auth-user', JSON.stringify(mockUser))
    useAuthStore.getState().hydrateFromSession()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user?.id).toBe('u1')
  })

  it('handles corrupt sessionStorage gracefully', () => {
    sessionStorage.setItem('sis-auth-user', 'not-json{{{')
    expect(() => useAuthStore.getState().hydrateFromSession()).not.toThrow()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('does nothing when sessionStorage is empty', () => {
    useAuthStore.getState().hydrateFromSession()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('authStore — setError / setLoading', () => {
  it('sets error message', () => {
    useAuthStore.getState().setError('Invalid credentials')
    expect(useAuthStore.getState().error).toBe('Invalid credentials')
  })

  it('clears error', () => {
    useAuthStore.getState().setError('err')
    useAuthStore.getState().setError(null)
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('sets loading state', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})
