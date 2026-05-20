import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })
  mockNavigate.mockClear()
})

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders without crashing', () => {
    const { container } = renderLoginPage()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the SIS brand text', () => {
    renderLoginPage()
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a Sign In submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce(undefined)
    useAuthStore.setState({ login: mockLogin } as never)

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'op@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('op@example.com', 'secret123')
    })
  })

  it('displays error message from store', () => {
    useAuthStore.setState({ error: 'Invalid credentials' })
    renderLoginPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('shows loading text on submit button while isLoading', () => {
    useAuthStore.setState({ isLoading: true })
    renderLoginPage()
    expect(screen.getByRole('button')).toHaveTextContent('Signing in…')
  })

  it('disables submit button while isLoading', () => {
    useAuthStore.setState({ isLoading: true })
    renderLoginPage()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('navigates to / on successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce(undefined)
    useAuthStore.setState({ login: mockLogin } as never)

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'op@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
})
