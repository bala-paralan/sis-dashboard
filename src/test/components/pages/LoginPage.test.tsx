import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom'
import { LoginPage } from '@/components/pages/LoginPage'

// Mock the auth API
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}))

import * as authApi from '@/api/auth'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders without crashing', () => {
    const { container } = renderLoginPage()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows IINVSYS brand name', () => {
    renderLoginPage()
    expect(screen.getByText('IINVSYS')).toBeInTheDocument()
  })

  it('shows the SIS Tactical Dashboard subtitle', () => {
    renderLoginPage()
    expect(screen.getByText(/SIS Tactical Dashboard/i)).toBeInTheDocument()
  })

  it('renders an email input field', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders a password input field', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a Sign In submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows "Authorised personnel only" disclaimer', () => {
    renderLoginPage()
    expect(screen.getByText(/authorised personnel only/i)).toBeInTheDocument()
  })

  it('navigates to dashboard on successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      id: 'u1',
      email: 'op@test.com',
      displayName: 'Operator',
      role: 'OPERATOR',
      createdAt: new Date().toISOString(),
    })

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })

  it('shows error message on login failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert').textContent).toContain('Invalid credentials')
    })
  })

  it('disables Sign In button while loading', async () => {
    let resolve: (v: unknown) => void
    const deferred = new Promise((r) => { resolve = r })
    vi.mocked(authApi.login).mockReturnValue(deferred as ReturnType<typeof authApi.login>)

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /authenticating/i })).toBeDisabled()
    })

    resolve!(undefined)
  })

  it('calls login API with email and password values', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      id: 'u1',
      email: 'op@test.com',
      displayName: null,
      role: 'OPERATOR',
      createdAt: new Date().toISOString(),
    })

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@iinvsys.mil' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret99' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('admin@iinvsys.mil', 'secret99')
    })
  })

  it('error clears on re-submit (new error replaces old)', async () => {
    vi.mocked(authApi.login)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValue({
        id: 'u1',
        email: 'op@test.com',
        displayName: null,
        role: 'OPERATOR',
        createdAt: new Date().toISOString(),
      })

    renderLoginPage()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
