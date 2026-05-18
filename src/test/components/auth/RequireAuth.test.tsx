import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuthStore } from '@/store/authStore'

const mockUser = {
  id: 'user-001',
  email: 'op@example.com',
  displayName: 'Operator',
  role: 'OPERATOR' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  useAuthStore.setState({ user: null, loading: false, error: null, init: vi.fn() as never })
})

function renderWithRouter(user: typeof mockUser | null) {
  useAuthStore.setState({ user })
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <div>Protected Content</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('RequireAuth', () => {
  it('renders children when user is authenticated', () => {
    renderWithRouter(mockUser)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when user is null', () => {
    renderWithRouter(null)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows authenticating message while loading', () => {
    useAuthStore.setState({ user: null, loading: true })
    render(
      <MemoryRouter>
        <RequireAuth>
          <div>Protected</div>
        </RequireAuth>
      </MemoryRouter>
    )
    expect(screen.getByText('Authenticating…')).toBeInTheDocument()
  })
})
