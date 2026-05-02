import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'

beforeEach(() => {
  localStorage.clear()
})

function renderGuarded(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/*"
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
  it('redirects to /login when no token in localStorage', () => {
    renderGuarded('/')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when access_token is present', () => {
    localStorage.setItem('access_token', 'valid-token')
    renderGuarded('/')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('renders children when token is set to non-empty string', () => {
    localStorage.setItem('access_token', 'abc123')
    renderGuarded('/dashboard')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects again after token is removed', () => {
    localStorage.setItem('access_token', 'token')
    const { rerender } = renderGuarded('/')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()

    localStorage.removeItem('access_token')
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <div>Protected Content</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
