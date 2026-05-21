import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
}))

import { login, logout, getMe } from '@/api/auth'

const mockUser = {
  id: 'user-001',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'ADMIN' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  useAuthStore.setState({ user: null, loading: false, error: null })
  vi.clearAllMocks()
})

describe('useAuthStore', () => {
  describe('login', () => {
    it('sets user on successful login', async () => {
      vi.mocked(login).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('admin@example.com', 'password')
      })
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('sets error on failed login', async () => {
      vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))
      await act(async () => {
        await useAuthStore.getState().login('bad@example.com', 'wrong')
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().error).toBe('Invalid credentials')
    })

    it('sets loading true during login then false after', async () => {
      let resolveLogin!: (v: typeof mockUser) => void
      vi.mocked(login).mockReturnValue(new Promise((r) => { resolveLogin = r }))
      act(() => { void useAuthStore.getState().login('admin@example.com', 'pass') })
      expect(useAuthStore.getState().loading).toBe(true)
      await act(async () => { resolveLogin(mockUser) })
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears user on logout', async () => {
      useAuthStore.setState({ user: mockUser })
      vi.mocked(logout).mockResolvedValue(undefined)
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('init', () => {
    it('sets user when getMe succeeds', async () => {
      vi.mocked(getMe).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().init()
      })
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('leaves user null when getMe fails', async () => {
      vi.mocked(getMe).mockRejectedValue(new Error('401'))
      await act(async () => {
        await useAuthStore.getState().init()
      })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })
})
