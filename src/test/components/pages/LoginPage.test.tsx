import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/pages/LoginPage'
import * as auth from '@/api/auth'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  mockNavigate.mockClear()
})

describe('LoginPage', () => {
  it('renders without throwing', () => {
    const { container } = renderLoginPage()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows an email input field', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('shows a password input field', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows a submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows the SIS IINVSYS brand', () => {
    renderLoginPage()
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })

  it('calls auth.login with email and password on submit', async () => {
    const loginSpy = vi.spyOn(auth, 'login').mockResolvedValue({
      id: 'user-1', email: 'operator@example.com', displayName: 'Operator',
      role: 'OPERATOR', createdAt: '',
    })

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'operator@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('operator@example.com', 'secret123')
    })
  })

  it('navigates to / after successful login', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue({
      id: 'user-1', email: 'operator@example.com', displayName: null,
      role: 'OPERATOR', createdAt: '',
    })

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'operator@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('shows an error message when login fails', async () => {
    vi.spyOn(auth, 'login').mockRejectedValue(new Error('Invalid credentials'))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('does not navigate on failed login', async () => {
    vi.spyOn(auth, 'login').mockRejectedValue(new Error('Server error'))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables submit button while loading', async () => {
    let resolve!: () => void
    vi.spyOn(auth, 'login').mockReturnValue(
      new Promise((r) => { resolve = () => r({ id: '', email: '', displayName: null, role: 'OPERATOR', createdAt: '' }) })
    )

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
    resolve()
  })
})
