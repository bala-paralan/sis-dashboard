import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

beforeEach(() => {
  sessionStorage.clear()
  useAuthStore.setState({ user: null, isAuthenticated: false })
})

function renderWithRouter(initialPath: string, authenticated: boolean) {
  if (authenticated) {
    useAuthStore.setState({
      user: { id: 'u1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' },
      isAuthenticated: true,
    })
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div data-testid="dashboard">Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderWithRouter('/', true)
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRouter('/', false)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
  })

  it('does not render children when not authenticated', () => {
    renderWithRouter('/', false)
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
  })

  it('renders the login route directly without authentication', () => {
    renderWithRouter('/login', false)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
})
