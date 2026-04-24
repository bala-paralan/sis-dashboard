import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoginPage } from '@/components/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'

// Spy on the store's login action
vi.mock('@/store/authStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/authStore')>()
  return actual
})

beforeEach(() => {
  useAuthStore.setState({ user: null, loading: false, error: null })
})

describe('LoginPage', () => {
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
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows "Signing in…" text when loading', () => {
    useAuthStore.setState({ loading: true })
    render(<LoginPage />)
    expect(screen.getByText('Signing in…')).toBeInTheDocument()
  })

  it('disables submit button when loading', () => {
    useAuthStore.setState({ loading: true })
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('displays error message from store', () => {
    useAuthStore.setState({ error: 'Invalid credentials' })
    render(<LoginPage />)
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('does not show error when error is null', () => {
    render(<LoginPage />)
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    const loginSpy = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ login: loginSpy } as Parameters<typeof useAuthStore.setState>[0])

    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('operator@example.com'), {
      target: { value: 'op@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('op@test.com', 'secret123')
    })
  })

  it('shows authorised personnel notice', () => {
    render(<LoginPage />)
    expect(screen.getByText(/authorised personnel only/i)).toBeInTheDocument()
  })
})
