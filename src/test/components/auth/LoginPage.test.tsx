import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockUser = {
  id: 'u-001',
  email: 'op@iinvsys.com',
  displayName: 'Op One',
  role: 'OPERATOR' as const,
  createdAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  localStorage.clear()
  act(() => {
    useAuthStore.setState({ user: null, loading: false, error: null })
  })
  vi.restoreAllMocks()
})

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit')).toBeInTheDocument()
  })

  it('submit button is disabled when fields are empty', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('login-submit')).toBeDisabled()
  })

  it('submit button enables when both fields filled', () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'pass' } })
    expect(screen.getByTestId('login-submit')).not.toBeDisabled()
  })

  it('calls login store action on submit', async () => {
    const loginSpy = vi.fn(async () => {
      act(() => { useAuthStore.setState({ user: mockUser }) })
    })
    act(() => { useAuthStore.setState({ login: loginSpy } as never) })

    render(<LoginPage />)
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'op@iinvsys.com' } })
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('op@iinvsys.com', 'secret')
    })
  })

  it('shows error message when auth error is set', () => {
    render(<LoginPage />)
    // Set error after mount (clearError runs on mount, so set it after)
    act(() => { useAuthStore.setState({ error: 'Invalid credentials' }) })
    expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid credentials')
  })

  it('shows loading text on submit button while loading', () => {
    act(() => { useAuthStore.setState({ loading: true }) })
    render(<LoginPage />)
    expect(screen.getByTestId('login-submit')).toHaveTextContent('Signing in…')
  })

  it('does not show error element when no error', () => {
    render(<LoginPage />)
    expect(screen.queryByTestId('login-error')).not.toBeInTheDocument()
  })

  it('has correct page testid', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
})
