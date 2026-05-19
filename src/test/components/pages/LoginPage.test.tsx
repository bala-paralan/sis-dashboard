import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/components/pages/LoginPage'
import { useSystemStore } from '@/store/systemStore'

// Mock the auth API so no real network calls happen
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
}))

import * as authApi from '@/api/auth'

function renderLoginPage(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useSystemStore.setState({ user: null })
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders without crashing', () => {
    const { container } = renderLoginPage()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows SIS logo and sign-in heading', () => {
    renderLoginPage()
    expect(screen.getByText('SIS')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error when form submitted empty', async () => {
    renderLoginPage()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('calls login API with email and password on submit', async () => {
    const mockUser = { id: '1', email: 'op@sis.com', displayName: 'Operator', role: 'OPERATOR' as const, createdAt: '' }
    vi.mocked(authApi.login).mockResolvedValueOnce(mockUser)

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@sis.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(authApi.login).toHaveBeenCalledWith('op@sis.com', 'secret')
  })

  it('stores user in systemStore on successful login', async () => {
    const mockUser = { id: '1', email: 'op@sis.com', displayName: 'Cpl. Singh', role: 'OPERATOR' as const, createdAt: '' }
    vi.mocked(authApi.login).mockResolvedValueOnce(mockUser)

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@sis.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(useSystemStore.getState().user).toEqual(mockUser)
  })

  it('shows error message on login failure', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Invalid credentials'))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@sis.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('disables the submit button while loading', async () => {
    vi.mocked(authApi.login).mockImplementation(() => new Promise(() => undefined))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@sis.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })
})
