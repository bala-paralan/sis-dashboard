import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuthStore } from '@/store/authStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
}))

import { login } from '@/api/auth'

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: null })
  localStorage.clear()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    renderPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders the Sign In button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows loading state during login', async () => {
    vi.mocked(login).mockReturnValue(new Promise(() => {}))
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(await screen.findByRole('button', { name: 'Signing in...' })).toBeDisabled()
  })

  it('navigates to / on successful login', async () => {
    const user = { id: '1', email: 'a@b.com', displayName: 'A', role: 'OPERATOR' as const, createdAt: '2024-01-01' }
    vi.mocked(login).mockResolvedValue(user)
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
  })

  it('shows error message on failed login', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('re-enables the button after a failed login', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Bad creds'))
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@x.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: 'Sign In' })).not.toBeDisabled()
  })
})
