import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'
import * as authApi from '@/api/auth'
import * as client from '@/api/client'

vi.mock('@/api/auth')
vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, getAccessToken: vi.fn() }
})

const mockUser: authApi.MeResponse = {
  id:          'u1',
  email:       'op@example.com',
  displayName: 'Operator One',
  role:        'OPERATOR',
  createdAt:   '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useAuthStore.setState({ user: null, loading: false, error: null })
})

describe('useAuthStore', () => {
  describe('initial state', () => {
    it('user is null', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })
    it('loading is false', () => {
      expect(useAuthStore.getState().loading).toBe(false)
    })
    it('error is null', () => {
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('login()', () => {
    it('sets user on success', async () => {
      (authApi.login as Mock).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('op@example.com', 'secret')
      })
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('sets error on failure and re-throws', async () => {
      (authApi.login as Mock).mockRejectedValue(new Error('Invalid credentials'))
      await act(async () => {
        await expect(useAuthStore.getState().login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().error).toBe('Invalid credentials')
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('sets loading to true then false', async () => {
      let loadingDuring = false
      ;(authApi.login as Mock).mockImplementation(async () => {
        loadingDuring = useAuthStore.getState().loading
        return mockUser
      })
      await act(async () => {
        await useAuthStore.getState().login('op@example.com', 'secret')
      })
      expect(loadingDuring).toBe(true)
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('clears previous error on new login attempt', async () => {
      useAuthStore.setState({ error: 'Old error' })
      ;(authApi.login as Mock).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().login('op@example.com', 'secret')
      })
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('logout()', () => {
    it('clears user after logout', async () => {
      useAuthStore.setState({ user: mockUser })
      ;(authApi.logout as Mock).mockResolvedValue(undefined)
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('clears user even if logout API throws', async () => {
      useAuthStore.setState({ user: mockUser })
      ;(authApi.logout as Mock).mockRejectedValue(new Error('Network error'))
      await act(async () => {
        await useAuthStore.getState().logout()
      })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('bootstrap()', () => {
    it('does nothing when no access token', async () => {
      ;(client.getAccessToken as Mock).mockReturnValue(null)
      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(authApi.getMe as Mock).not.toHaveBeenCalled()
    })

    it('fetches user when access token is present', async () => {
      ;(client.getAccessToken as Mock).mockReturnValue('token123')
      ;(authApi.getMe as Mock).mockResolvedValue(mockUser)
      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('clears user on bootstrap failure', async () => {
      ;(client.getAccessToken as Mock).mockReturnValue('expired')
      ;(authApi.getMe as Mock).mockRejectedValue(new Error('401'))
      await act(async () => {
        await useAuthStore.getState().bootstrap()
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })
})
