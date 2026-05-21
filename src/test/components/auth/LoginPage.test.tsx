import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  useAuthStore.setState({ user: null, loading: false, error: null })
  vi.clearAllMocks()
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders the sign-in heading', () => {
    renderLogin()
    expect(screen.getByText('IINVSYS SIS')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderLogin()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('calls authStore login with entered credentials', async () => {
    const loginFn = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ login: loginFn } as never)
    renderLogin()
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@x.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => expect(loginFn).toHaveBeenCalledWith('user@x.com', 'secret'))
  })

  it('shows error alert when store has error', () => {
    useAuthStore.setState({ error: 'Invalid credentials' } as never)
    renderLogin()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('disables button while loading', () => {
    useAuthStore.setState({ loading: true } as never)
    renderLogin()
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeDisabled()
  })

  it('navigates to / after successful login', async () => {
    const loginFn = vi.fn().mockImplementation(async () => {
      useAuthStore.setState({ user: { id: '1', email: 'a@b.com', displayName: null, role: 'VIEWER', createdAt: '' } })
    })
    useAuthStore.setState({ login: loginFn } as never)
    renderLogin()
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }))
  })
})
