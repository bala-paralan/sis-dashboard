import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'
import type { MeResponse } from '@/api/auth'

function mockUser(overrides?: Partial<MeResponse>): MeResponse {
  return {
    id: 'user-001',
    email: 'operator@example.com',
    displayName: 'Test Operator',
    role: 'OPERATOR',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  sessionStorage.clear()
  useAuthStore.setState({ user: null, isAuthenticated: false })
})

describe('useAuthStore', () => {
  describe('initial state', () => {
    it('user is null initially', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('isAuthenticated is false initially', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('sets isAuthenticated to true on login', () => {
      act(() => {
        useAuthStore.getState().login(mockUser())
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('stores the user object on login', () => {
      const user = mockUser({ email: 'test@test.com' })
      act(() => {
        useAuthStore.getState().login(user)
      })
      expect(useAuthStore.getState().user).toEqual(user)
    })

    it('persists auth to sessionStorage on login', () => {
      const user = mockUser()
      act(() => {
        useAuthStore.getState().login(user)
      })
      const stored = sessionStorage.getItem('sis-auth')
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(user)
    })
  })

  describe('logout', () => {
    it('sets isAuthenticated to false on logout', () => {
      act(() => {
        useAuthStore.getState().login(mockUser())
        useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('clears user on logout', () => {
      act(() => {
        useAuthStore.getState().login(mockUser())
        useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('removes auth from sessionStorage on logout', () => {
      act(() => {
        useAuthStore.getState().login(mockUser())
        useAuthStore.getState().logout()
      })
      expect(sessionStorage.getItem('sis-auth')).toBeNull()
    })
  })
})
