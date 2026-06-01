import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'

// Mock useNavigate so we can track navigation calls
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useAuthStore.setState({ user: null, loading: false, error: null, isAuthenticated: false })
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders the IINVSYS SIS title', () => {
    renderLogin()
    // Title div contains "IINVSYS SIS" text (possibly split across elements)
    const allText = document.body.textContent ?? ''
    expect(allText).toMatch(/IINVSYS/i)
    expect(allText).toMatch(/SIS/)
  })

  it('renders Email input', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/operator@iinvsys/i)).toBeInTheDocument()
  })

  it('renders Password input', () => {
    renderLogin()
    const pwd = screen.getByPlaceholderText(/••••/)
    expect(pwd).toBeInTheDocument()
    expect((pwd as HTMLInputElement).type).toBe('password')
  })

  it('renders Sign In button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('shows "Signing in…" when loading', () => {
    useAuthStore.setState({ loading: true })
    renderLogin()
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeInTheDocument()
  })

  it('disables Sign In button when loading', () => {
    useAuthStore.setState({ loading: true })
    renderLogin()
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeDisabled()
  })

  it('shows error message from store', () => {
    useAuthStore.setState({ error: 'Invalid credentials' })
    renderLogin()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('calls login action with email and password on submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ login: mockLogin } as never)

    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/operator@iinvsys/i), { target: { value: 'admin@sis.com' } })
    fireEvent.change(screen.getByPlaceholderText(/••••/), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@sis.com', 'secret')
    })
  })

  it('navigates to / after successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ login: mockLogin } as never)

    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/operator@iinvsys/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText(/••••/), { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('does not navigate when login throws', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Bad creds'))
    useAuthStore.setState({ login: mockLogin } as never)

    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/operator@iinvsys/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText(/••••/), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => expect(mockLogin).toHaveBeenCalled())
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
