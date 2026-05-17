import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoginPage } from '@/components/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    user:    null,
    loading: false,
    error:   null,
    login:   vi.fn(),
    logout:  vi.fn(),
    loadMe:  vi.fn(),
  })
})

describe('LoginPage', () => {
  it('renders without crashing', () => {
    expect(() => render(<LoginPage />)).not.toThrow()
  })

  it('renders Sign in heading', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('renders the IINVSYS SIS title', () => {
    render(<LoginPage />)
    expect(screen.getByText('IINVSYS SIS')).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText('operator@example.com')).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<LoginPage />)
    const pwInput = screen.getByPlaceholderText('••••••••')
    expect(pwInput).toBeInTheDocument()
    expect(pwInput).toHaveAttribute('type', 'password')
  })

  it('renders Sign in submit button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('calls login store action with entered credentials on submit', async () => {
    const loginFn = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ login: loginFn })
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('operator@example.com'), {
      target: { value: 'admin@sis.local' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('admin@sis.local', 'secret123')
    })
  })

  it('shows error message when login throws', async () => {
    const loginFn = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    useAuthStore.setState({ login: loginFn })
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('operator@example.com'), {
      target: { value: 'bad@user.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('disables submit button and shows "Signing in…" while loading', () => {
    // Directly set loading=true in the store to simulate the in-flight state
    useAuthStore.setState({ loading: true })
    render(<LoginPage />)
    const btn = screen.getByRole('button', { name: 'Signing in…' })
    expect(btn).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })

  it('does not show error message initially', () => {
    render(<LoginPage />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('clears error on a subsequent successful submit', async () => {
    const loginFn = vi.fn()
      .mockRejectedValueOnce(new Error('Bad password'))
      .mockResolvedValueOnce(undefined)
    useAuthStore.setState({ login: loginFn })
    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText('operator@example.com')
    const pwInput    = screen.getByPlaceholderText('••••••••')

    fireEvent.change(emailInput, { target: { value: 'a@b.com' } })
    fireEvent.change(pwInput,    { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    fireEvent.change(pwInput, { target: { value: 'correct' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
