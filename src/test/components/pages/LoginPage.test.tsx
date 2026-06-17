import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { LoginPage } from '@/components/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockLogin = vi.fn()
const mockClearError = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const mockUseAuthStore = vi.mocked(useAuthStore) as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuthStore.mockImplementation((selector: (s: object) => unknown) => {
    const state = {
      login: mockLogin,
      error: null,
      clearError: mockClearError,
    }
    return selector(state)
  })
})

describe('LoginPage', () => {
  it('renders the SIS logo and login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('SIS')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows restricted access notice', () => {
    render(<LoginPage />)
    expect(screen.getByText(/authorised personnel only/i)).toBeInTheDocument()
  })

  it('submit button is disabled when fields are empty', () => {
    render(<LoginPage />)
    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn).toBeDisabled()
  })

  it('enables submit button when both fields are filled', () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'op@site.mil' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    })
    expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled()
  })

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'op@site.mil' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('op@site.mil', 'secret123')
    })
  })

  it('shows error message from store', () => {
    mockUseAuthStore.mockImplementation((selector: (s: object) => unknown) => {
      const state = {
        login: mockLogin,
        error: 'Invalid credentials',
        clearError: mockClearError,
      }
      return selector(state)
    })

    render(<LoginPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('shows "Signing in…" while submitting', async () => {
    let resolve!: () => void
    mockLogin.mockReturnValueOnce(new Promise<void>((r) => { resolve = r }))

    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'op@site.mil' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(screen.getByRole('button')).toHaveTextContent('Signing in…')

    await act(async () => {
      resolve()
    })
  })
})
