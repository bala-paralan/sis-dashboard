import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoginPage } from '@/components/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockLogin = vi.fn()

beforeEach(() => {
  useAuthStore.setState({
    user:    null,
    loading: false,
    error:   null,
    login:   mockLogin,
  } as any)
  mockLogin.mockReset()
})

describe('LoginPage', () => {
  it('renders without crashing', () => {
    expect(() => render(<LoginPage />)).not.toThrow()
  })

  it('shows "SIS Dashboard" branding', () => {
    render(<LoginPage />)
    expect(screen.getByText('SIS Dashboard')).toBeInTheDocument()
  })

  it('shows "IINVSYS" label', () => {
    render(<LoginPage />)
    expect(screen.getByText('IINVSYS')).toBeInTheDocument()
  })

  it('shows email and password inputs', () => {
    render(<LoginPage />)
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows Sign In button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('op@test.com', 'secret'))
  })

  it('shows error alert when error is set in store', () => {
    useAuthStore.setState({ error: 'Invalid credentials' } as any)
    render(<LoginPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('shows "Signing in…" and disables button while loading', () => {
    useAuthStore.setState({ loading: true } as any)
    render(<LoginPage />)
    const btn = screen.getByRole('button', { name: /signing in/i })
    expect(btn).toBeDisabled()
  })

  it('does not show error element when error is null', () => {
    render(<LoginPage />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows classified notice at bottom', () => {
    render(<LoginPage />)
    expect(screen.getByText(/CLASSIFIED/)).toBeInTheDocument()
  })
})
