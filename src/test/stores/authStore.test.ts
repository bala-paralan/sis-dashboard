import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import type { MeResponse } from '@/api/auth'

vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  getMe:  vi.fn(),
}))

const mockUser: MeResponse = {
  id:          'user-001',
  email:       'operator@example.com',
  displayName: 'Operator',
  role:        'OPERATOR',
  createdAt:   '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  useAuthStore.setState({ user: null })
  localStorage.clear()
})

describe('authStore', () => {
  it('starts with null user', () => {
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setUser stores the user', () => {
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('setUser can clear to null', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('hasToken returns false when localStorage is empty', () => {
    expect(useAuthStore.getState().hasToken()).toBe(false)
  })

  it('hasToken returns true when access_token is in localStorage', () => {
    localStorage.setItem('access_token', 'test-token')
    expect(useAuthStore.getState().hasToken()).toBe(true)
  })

  it('logout clears the user', async () => {
    useAuthStore.getState().setUser(mockUser)
    await useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('logout calls apiLogout', async () => {
    const { logout: apiLogout } = await import('@/api/auth')
    await useAuthStore.getState().logout()
    expect(apiLogout).toHaveBeenCalled()
  })
})
