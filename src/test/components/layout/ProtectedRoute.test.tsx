import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false })
})

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: 'u1', email: 'a@b.com', displayName: null, role: 'OPERATOR', createdAt: '' } })
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('redirects to /login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Login Page')).toBeTruthy()
    expect(screen.queryByText('Dashboard')).toBeNull()
  })

  it('does not render children when unauthenticated', () => {
    render(
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/secret"
            element={
              <ProtectedRoute>
                <div>Secret Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.queryByText('Secret Content')).toBeNull()
  })
})
