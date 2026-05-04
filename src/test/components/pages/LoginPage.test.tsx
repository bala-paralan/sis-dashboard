import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginPage } from '@/components/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockLogin = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

function setupStore(overrides?: { loading?: boolean; error?: string | null }) {
  vi.mocked(useAuthStore).mockImplementation((selector) => {
    const state = {
      user:    null,
      loading: overrides?.loading ?? false,
      error:   overrides?.error ?? null,
      login:   mockLogin,
      logout:  vi.fn(),
      bootstrap: vi.fn(),
    }
    return selector(state)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  setupStore()
})

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText(/operator@iinvsys\.mil/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a sign in button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText(/operator@iinvsys\.mil/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'secret123')
    })
  })

  it('shows loading state as "Signing in…" when loading is true', () => {
    setupStore({ loading: true })
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
  })

  it('disables submit button when loading', () => {
    setupStore({ loading: true })
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('displays error message when error is set', () => {
    setupStore({ error: 'Invalid credentials' })
    render(<LoginPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('does not show error element when error is null', () => {
    setupStore({ error: null })
    render(<LoginPage />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders the SIS logo text', () => {
    render(<LoginPage />)
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })
})
