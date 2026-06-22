import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  login: vi.fn().mockRejectedValue(new Error('Network error')),
  logout: vi.fn().mockResolvedValue(undefined),
  getMe: vi.fn().mockRejectedValue(new Error('Unauthorized')),
}))

vi.mock('@/api/client', () => ({
  getAccessToken: vi.fn().mockReturnValue(null),
  clearTokens: vi.fn(),
}))

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, error: null })
    localStorage.clear()
  })

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  it('demo login succeeds with correct credentials', async () => {
    await useAuthStore.getState().login('operator@sis.local', 'operator')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.role).toBe('OPERATOR')
    expect(state.error).toBeNull()
  })

  it('demo login fails with wrong password', async () => {
    await useAuthStore.getState().login('operator@sis.local', 'wrong')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toMatch(/Invalid credentials/)
  })

  it('logout clears user', async () => {
    await useAuthStore.getState().login('operator@sis.local', 'operator')
    await useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  it('clearError resets error state', async () => {
    await useAuthStore.getState().login('x@x.com', 'wrong')
    useAuthStore.getState().clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })
})
