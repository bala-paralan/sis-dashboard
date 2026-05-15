import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}))

beforeEach(() => {
  useAuthStore.setState({ user: null })
  localStorage.clear()
})

describe('authStore', () => {
  it('starts with null user', () => {
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setUser updates user state', () => {
    const user = { id: '1', email: 'admin@test.com', displayName: 'Admin', role: 'ADMIN' as const, createdAt: '2024-01-01' }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it('setUser(null) clears user state', () => {
    const user = { id: '1', email: 'admin@test.com', displayName: 'Admin', role: 'ADMIN' as const, createdAt: '2024-01-01' }
    useAuthStore.getState().setUser(user)
    useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('hasToken returns false when localStorage is empty', () => {
    localStorage.removeItem('access_token')
    expect(useAuthStore.getState().hasToken()).toBe(false)
  })

  it('hasToken returns true when token exists in localStorage', () => {
    localStorage.setItem('access_token', 'my-token')
    expect(useAuthStore.getState().hasToken()).toBe(true)
  })

  it('logout clears user state', async () => {
    const user = { id: '1', email: 'admin@test.com', displayName: 'Admin', role: 'ADMIN' as const, createdAt: '2024-01-01' }
    useAuthStore.getState().setUser(user)
    await useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
