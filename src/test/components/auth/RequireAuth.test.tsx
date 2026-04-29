import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn(),
  getMe:  vi.fn().mockResolvedValue(null),
}))

vi.mock('@/api/client', () => ({
  getAccessToken:  vi.fn(() => null),
  clearTokens:     vi.fn(),
  storeTokens:     vi.fn(),
  getRefreshToken: vi.fn(() => null),
  apiFetch:        vi.fn(),
}))

function renderGuard(children: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/*" element={<RequireAuth>{children}</RequireAuth>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  localStorage.clear()
  useAuthStore.setState({ user: null, isInitialized: false })
  // reset mock to return null by default
  const { getAccessToken } = await import('@/api/client')
  vi.mocked(getAccessToken).mockReturnValue(null)
})

describe('RequireAuth', () => {
  it('redirects to /login when no token present', () => {
    renderGuard(<div data-testid="protected">Dashboard</div>)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
  })

  it('renders children when access token is present', async () => {
    const { getAccessToken } = await import('@/api/client')
    vi.mocked(getAccessToken).mockReturnValue('tok123')
    renderGuard(<div data-testid="protected">Dashboard</div>)
    expect(screen.getByTestId('protected')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('renders children with correct text when authenticated', async () => {
    const { getAccessToken } = await import('@/api/client')
    vi.mocked(getAccessToken).mockReturnValue('tok123')
    renderGuard(<span>Tactical Dashboard</span>)
    expect(screen.getByText('Tactical Dashboard')).toBeInTheDocument()
  })

  it('renders multiple children when token is present', async () => {
    const { getAccessToken } = await import('@/api/client')
    vi.mocked(getAccessToken).mockReturnValue('tok123')
    renderGuard(
      <>
        <div data-testid="child-1">Panel A</div>
        <div data-testid="child-2">Panel B</div>
      </>
    )
    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })
})
