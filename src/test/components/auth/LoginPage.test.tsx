import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuthStore } from '@/store/authStore'
import * as authApi from '@/api/auth'

vi.mock('@/api/auth', () => ({
  login:   vi.fn(),
  logout:  vi.fn(),
  getMe:   vi.fn(),
}))

vi.mock('@/api/client', () => ({
  getAccessToken:  vi.fn(() => null),
  clearTokens:     vi.fn(),
  storeTokens:     vi.fn(),
  getRefreshToken: vi.fn(() => null),
  apiFetch:        vi.fn(),
}))

const mockUser = {
  id:          'u1',
  email:       'op@iinvsys.mil',
  displayName: 'Operator One',
  role:        'OPERATOR' as const,
  createdAt:   '2026-01-01T00:00:00.000Z',
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useAuthStore.setState({ user: null, isInitialized: false })
})

describe('LoginPage', () => {
  it('renders the SIS heading', () => {
    renderPage()
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders the sign-in button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    let resolve: (v: typeof mockUser) => void
    ;(authApi.login as Mock).mockReturnValue(new Promise((r) => { resolve = r }))

    renderPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@iinvsys.mil' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
    })

    resolve!(mockUser)
  })

  it('sets user in store on successful login', async () => {
    ;(authApi.login as Mock).mockResolvedValue(mockUser)
    renderPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@iinvsys.mil' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })
  })

  it('shows error message on failed login', async () => {
    ;(authApi.login as Mock).mockRejectedValue(new Error('Invalid credentials'))
    renderPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@user.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('disables submit button while loading', async () => {
    ;(authApi.login as Mock).mockReturnValue(new Promise(() => {}))
    renderPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@iinvsys.mil' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })

  it('clears error when re-submitting', async () => {
    ;(authApi.login as Mock)
      .mockRejectedValueOnce(new Error('Bad credentials'))
      .mockResolvedValueOnce(mockUser)

    renderPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@iinvsys.mil' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => screen.getByRole('alert'))

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
