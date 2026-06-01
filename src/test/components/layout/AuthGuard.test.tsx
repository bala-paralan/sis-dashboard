import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useAuthStore } from '@/store/authStore'

beforeEach(() => {
  useAuthStore.setState({
    user:            null,
    loading:         false,
    error:           null,
    isAuthenticated: false,
    checkAuth:       vi.fn().mockResolvedValue(undefined),
  } as never)
  vi.clearAllMocks()
})

function renderWithAuth(isAuthenticated: boolean, loading = false) {
  useAuthStore.setState({
    isAuthenticated,
    loading,
    checkAuth: vi.fn().mockResolvedValue(undefined),
  } as never)

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <div>Protected Content</div>
            </AuthGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('AuthGuard', () => {
  it('renders children when authenticated', () => {
    renderWithAuth(true)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithAuth(false)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state while checking auth', () => {
    renderWithAuth(false, true)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders "Verifying session…" during loading', () => {
    renderWithAuth(false, true)
    expect(screen.getByText(/Verifying session/i)).toBeInTheDocument()
  })

  it('calls checkAuth on mount', () => {
    const checkAuth = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ checkAuth, isAuthenticated: true, loading: false } as never)

    render(
      <MemoryRouter>
        <AuthGuard>
          <div>Content</div>
        </AuthGuard>
      </MemoryRouter>
    )

    expect(checkAuth).toHaveBeenCalledTimes(1)
  })
})
