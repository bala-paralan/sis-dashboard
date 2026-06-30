import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const defaultStore = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn(),
  clearError: vi.fn(),
}

function renderPage(storeOverrides = {}) {
  const store = { ...defaultStore, ...storeOverrides, login: vi.fn(), clearError: vi.fn() }
  vi.mocked(useAuthStore).mockReturnValue(store)
  return { ...render(<MemoryRouter><LoginPage /></MemoryRouter>), store }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockReset()
})

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows SIS branding', () => {
    renderPage()
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })

  it('shows heading text', () => {
    renderPage()
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
  })

  it('calls login with entered credentials on submit', async () => {
    const { store } = renderPage()
    store.login.mockResolvedValue(undefined)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)

    await waitFor(() => {
      expect(store.login).toHaveBeenCalledWith('op@test.com', 'secret')
    })
  })

  it('shows error message when error is in store', () => {
    renderPage({ error: 'Invalid credentials' })
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('disables the submit button when loading', () => {
    renderPage({ isLoading: true })
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('shows "Signing in…" text while loading', () => {
    renderPage({ isLoading: true })
    expect(screen.getByText(/signing in…/i)).toBeInTheDocument()
  })

  it('redirects to / when already authenticated', () => {
    renderPage({ isAuthenticated: true })
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('calls clearError on submit', async () => {
    const { store } = renderPage()
    store.login.mockResolvedValue(undefined)
    fireEvent.submit(screen.getByLabelText(/email/i).closest('form')!)
    await waitFor(() => {
      expect(store.clearError).toHaveBeenCalled()
    })
  })

  it('does not show error alert when error is null', () => {
    renderPage({ error: null })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
