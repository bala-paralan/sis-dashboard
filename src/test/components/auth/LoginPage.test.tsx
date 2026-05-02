import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn(),
  getMe:  vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: null })
  localStorage.clear()
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderLogin()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('shows SIS logo', () => {
    renderLogin()
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })

  it('shows Sign in button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
  })

  it('shows error when login fails', async () => {
    const { login } = await import('@/api/auth')
    vi.mocked(login).mockRejectedValueOnce(new Error('Invalid credentials'))
    renderLogin()
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@x.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    const { login } = await import('@/api/auth')
    vi.mocked(login).mockImplementationOnce(() => new Promise(() => undefined))
    renderLogin()
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    expect(screen.getByText(/Signing in/i)).toBeInTheDocument()
  })

  it('navigates to / on successful login', async () => {
    const { login } = await import('@/api/auth')
    vi.mocked(login).mockResolvedValueOnce({
      id: 'u1', email: 'a@b.com', displayName: null, role: 'OPERATOR', createdAt: ''
    })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
})
