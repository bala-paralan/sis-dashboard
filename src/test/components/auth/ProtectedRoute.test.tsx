import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = vi.fn()
const mockCheckAuth = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockStore = {
  user: null as { displayName: string; email: string } | null,
  loading: false,
  checkAuth: mockCheckAuth,
}

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((sel: (s: typeof mockStore) => unknown) => sel(mockStore)),
}))

let mockToken: string | null = null
vi.mock('@/api/client', () => ({
  getAccessToken: () => mockToken,
}))

const { ProtectedRoute } = await import('@/components/auth/ProtectedRoute')

beforeEach(() => {
  vi.clearAllMocks()
  mockStore.user = null
  mockStore.loading = false
  mockToken = null
})

describe('ProtectedRoute', () => {
  it('redirects to /login when no token and no user', () => {
    mockToken = null
    mockStore.user = null
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('renders children when user is set', () => {
    mockStore.user = { displayName: 'Admin', email: 'a@b.com' }
    mockToken = 'token123'
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders children when token exists even if user not yet loaded', () => {
    mockStore.user = null
    mockToken = 'token123'
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows loading indicator when loading is true', () => {
    mockStore.loading = true
    mockToken = 'token123'
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('calls checkAuth on mount when no user', () => {
    mockToken = null
    mockStore.user = null
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(mockCheckAuth).toHaveBeenCalled()
  })
})
